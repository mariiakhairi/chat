// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  documents;
  messages;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.documents = /* @__PURE__ */ new Map();
    this.messages = [];
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async addDocument(doc) {
    const id = randomUUID();
    const document = { ...doc, id };
    this.documents.set(id, document);
    return document;
  }
  async getDocuments() {
    return Array.from(this.documents.values());
  }
  async removeDocument(id) {
    this.documents.delete(id);
    if (this.documents.size === 0) {
      this.messages = [];
    }
  }
  async clearDocuments() {
    this.documents.clear();
    this.messages = [];
  }
  async addMessage(message) {
    this.messages.push(message);
    return message;
  }
  async getMessages() {
    return this.messages;
  }
  async clearMessages() {
    this.messages = [];
  }
};
var storage = new MemStorage();

// server/routes.ts
import multer from "multer";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { createRequire } from "module";
var require2 = createRequire(import.meta.url);
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024
  }
});
var questionSchema = z.object({
  question: z.string().min(1)
});
async function registerRoutes(app2) {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  app2.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const file = req.file;
      const MAX_SIZE = 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return res.status(400).json({ error: "File size exceeds 1MB limit" });
      }
      let content;
      if (file.mimetype === "application/pdf") {
        try {
          const pdfParse = require2("pdf-parse");
          const pdfData = await pdfParse(file.buffer);
          content = pdfData.text;
          if (!content || content.trim().length === 0) {
            console.warn("PDF parsed but no text extracted");
            content = "[PDF uploaded but contains no extractable text. This may be a scanned image PDF.]";
          }
        } catch (pdfError) {
          console.error("PDF parsing error:", pdfError);
          const errorMsg = pdfError.message || "Unknown PDF error";
          return res.status(400).json({
            error: `Failed to parse PDF: ${errorMsg}. Please ensure it's a valid PDF file.`
          });
        }
      } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.originalname.endsWith(".docx")) {
        try {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ buffer: file.buffer });
          content = result.value;
          if (!content || content.trim().length === 0) {
            console.warn("DOCX parsed but no text extracted");
            content = "[DOCX uploaded but contains no extractable text.]";
          }
        } catch (docxError) {
          console.error("DOCX parsing error:", docxError);
          const errorMsg = docxError.message || "Unknown DOCX error";
          return res.status(400).json({
            error: `Failed to parse DOCX: ${errorMsg}. Please ensure it's a valid Word document.`
          });
        }
      } else if (file.originalname.endsWith(".doc")) {
        return res.status(400).json({ error: "Old .doc format not supported. Please convert to .docx" });
      } else {
        content = file.buffer.toString("utf-8");
      }
      const document = await storage.addDocument({
        name: file.originalname,
        size: file.size,
        content,
        type: file.mimetype
      });
      res.json({
        success: true,
        document: {
          id: document.id,
          name: document.name,
          size: document.size,
          type: document.type
        }
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });
  app2.post("/api/chat", async (req, res) => {
    try {
      const { question } = questionSchema.parse(req.body);
      const documents = await storage.getDocuments();
      if (documents.length === 0) {
        return res.status(400).json({ error: "No documents uploaded" });
      }
      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: question,
        timestamp: /* @__PURE__ */ new Date()
      };
      await storage.addMessage(userMessage);
      const combinedContent = documents.map(
        (doc) => `Document: ${doc.name}

${doc.content}`
      ).join("\n\n---\n\n");
      const prompt = `You are a helpful assistant that answers questions based on the provided document content.

Document Content:
${combinedContent}

User Question: ${question}

Please provide a clear, accurate answer based only on the information in the documents. If the answer cannot be found in the documents, politely say so.`;
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      });
      const aiContent = result.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response.";
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: aiContent,
        timestamp: /* @__PURE__ */ new Date()
      };
      await storage.addMessage(aiMessage);
      res.json({
        success: true,
        message: aiMessage
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process question" });
    }
  });
  app2.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json({ messages });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });
  app2.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      const documentsWithoutContent = documents.map(({ id, name, size, type }) => ({
        id,
        name,
        size,
        type
      }));
      res.json({ documents: documentsWithoutContent });
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ error: "Failed to get documents" });
    }
  });
  app2.delete("/api/documents/:id", async (req, res) => {
    try {
      await storage.removeDocument(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove document error:", error);
      res.status(500).json({ error: "Failed to remove document" });
    }
  });
  app2.delete("/api/documents", async (req, res) => {
    try {
      await storage.clearDocuments();
      res.json({ success: true });
    } catch (error) {
      console.error("Clear documents error:", error);
      res.status(500).json({ error: "Failed to clear documents" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
