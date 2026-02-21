import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { createRequire } from "module";

const requireCJS = createRequire(import.meta.url);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024,
  },
});

const questionSchema = z.object({
  question: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      const MAX_SIZE = 1024 * 1024;

      if (file.size > MAX_SIZE) {
        return res.status(400).json({ error: "File size exceeds 1MB limit" });
      }

      let content: string;
      
      if (file.mimetype === "application/pdf") {
        try {
          // pdf-parse 1.x has a simple default function export
          const pdfParse = requireCJS("pdf-parse");
          const pdfData = await pdfParse(file.buffer);
          content = pdfData.text;
          
          if (!content || content.trim().length === 0) {
            console.warn("PDF parsed but no text extracted");
            content = "[PDF uploaded but contains no extractable text. This may be a scanned image PDF.]";
          }
        } catch (pdfError: any) {
          console.error("PDF parsing error:", pdfError);
          const errorMsg = pdfError.message || "Unknown PDF error";
          return res.status(400).json({ 
            error: `Failed to parse PDF: ${errorMsg}. Please ensure it's a valid PDF file.` 
          });
        }
      } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
                 file.originalname.endsWith('.docx')) {
        try {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ buffer: file.buffer });
          content = result.value;
          
          if (!content || content.trim().length === 0) {
            console.warn("DOCX parsed but no text extracted");
            content = "[DOCX uploaded but contains no extractable text.]";
          }
        } catch (docxError: any) {
          console.error("DOCX parsing error:", docxError);
          const errorMsg = docxError.message || "Unknown DOCX error";
          return res.status(400).json({ 
            error: `Failed to parse DOCX: ${errorMsg}. Please ensure it's a valid Word document.` 
          });
        }
      } else if (file.originalname.endsWith('.doc')) {
        return res.status(400).json({ error: "Old .doc format not supported. Please convert to .docx" });
      } else {
        content = file.buffer.toString("utf-8");
      }

      const document = await storage.addDocument({
        name: file.originalname,
        size: file.size,
        content,
        type: file.mimetype,
      });

      res.json({
        success: true,
        document: {
          id: document.id,
          name: document.name,
          size: document.size,
          type: document.type,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { question } = questionSchema.parse(req.body);
      const documents = await storage.getDocuments();

      if (documents.length === 0) {
        return res.status(400).json({ error: "No documents uploaded" });
      }

      const userMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: question,
        timestamp: new Date(),
      };

      await storage.addMessage(userMessage);

      const combinedContent = documents.map(doc => 
        `Document: ${doc.name}\n\n${doc.content}`
      ).join('\n\n---\n\n');

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
        ],
      });

      const aiContent = result.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response.";

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai" as const,
        content: aiContent,
        timestamp: new Date(),
      };

      await storage.addMessage(aiMessage);

      res.json({
        success: true,
        message: aiMessage,
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process question" });
    }
  });

  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json({ messages });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      const documentsWithoutContent = documents.map(({ id, name, size, type }) => ({
        id, name, size, type
      }));
      res.json({ documents: documentsWithoutContent });
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ error: "Failed to get documents" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      await storage.removeDocument(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove document error:", error);
      res.status(500).json({ error: "Failed to remove document" });
    }
  });

  app.delete("/api/documents", async (req, res) => {
    try {
      await storage.clearDocuments();
      res.json({ success: true });
    } catch (error) {
      console.error("Clear documents error:", error);
      res.status(500).json({ error: "Failed to clear documents" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
