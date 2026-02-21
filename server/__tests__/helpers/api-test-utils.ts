import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { createServer } from 'http';
import type { Express } from 'express';

export interface TestFile {
  filename: string;
  content: Buffer;
  mimetype: string;
}

export class ApiTestClient {
  private server: ReturnType<typeof createServer> | null = null;
  private baseURL: string = '';
  public client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      validateStatus: () => true, // Don't throw on any status code
    });
  }

  async startServer(): Promise<string> {
    // Dynamic import to handle ES modules properly
    const express = (await import('express')).default;
    const { registerRoutes } = await import('../../routes.js');
    
    const app = express();
    this.server = await registerRoutes(app);
    
    return new Promise((resolve) => {
      this.server!.listen(0, () => {
        const address = this.server!.address();
        const port = typeof address === 'object' && address !== null ? address.port : 3000;
        this.baseURL = `http://localhost:${port}`;
        this.client.defaults.baseURL = this.baseURL;
        resolve(this.baseURL);
      });
    });
  }

  async stopServer(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => resolve());
      });
    }
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  // Helper to upload a file
  async uploadFile(file: TestFile) {
    const formData = new FormData();
    formData.append('file', file.content, {
      filename: file.filename,
      contentType: file.mimetype,
    });

    return this.client.post('/api/upload', formData, {
      headers: formData.getHeaders(),
    });
  }

  // Helper to get all documents
  async getDocuments() {
    return this.client.get('/api/documents');
  }

  // Helper to delete a document
  async deleteDocument(id: string) {
    return this.client.delete(`/api/documents/${id}`);
  }

  // Helper to clear all documents
  async clearAllDocuments() {
    return this.client.delete('/api/documents');
  }

  // Helper to send a chat message
  async sendChatMessage(question: string) {
    return this.client.post('/api/chat', { question }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Helper to get messages
  async getMessages() {
    return this.client.get('/api/messages');
  }
}

// Test file generators
export function createTestFile(
  filename: string,
  content: string | Buffer,
  mimetype: string
): TestFile {
  return {
    filename,
    content: Buffer.isBuffer(content) ? content : Buffer.from(content),
    mimetype,
  };
}

export function createTextFile(filename: string, sizeInBytes?: number): TestFile {
  const content = sizeInBytes 
    ? Buffer.alloc(sizeInBytes, 'A')
    : Buffer.from('This is a test text file content.\nIt has multiple lines.\nFor testing purposes.');
  
  return createTestFile(filename, content, 'text/plain');
}

export function createPDFFile(filename: string, sizeInBytes?: number): TestFile {
  // Create a valid PDF with text content that can be parsed
  const textContent = sizeInBytes 
    ? 'Test PDF Content. '.repeat(Math.floor(sizeInBytes / 20))
    : 'This is a test PDF file with extractable text content.';
  
  const pdfHeader = '%PDF-1.4\n';
  const catalogObj = '1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n';
  const pagesObj = '2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n';
  const pageObj = '3 0 obj\n<</Type/Page/Parent 2 0 R/Contents 4 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 5 0 R>>>>>>\nendobj\n';
  const streamObj = `4 0 obj\n<</Length ${textContent.length + 44}>>\nstream\nBT\n/F1 12 Tf\n50 750 Td\n(${textContent}) Tj\nET\nendstream\nendobj\n`;
  const fontObj = '5 0 obj\n<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>\nendobj\n';
  
  const body = catalogObj + pagesObj + pageObj + streamObj + fontObj;
  const xrefPos = pdfHeader.length + body.length;
  
  const xref = 'xref\n0 6\n0000000000 65535 f \n' +
    String(pdfHeader.length).padStart(10, '0') + ' 00000 n \n' +
    String(pdfHeader.length + catalogObj.length).padStart(10, '0') + ' 00000 n \n' +
    String(pdfHeader.length + catalogObj.length + pagesObj.length).padStart(10, '0') + ' 00000 n \n' +
    String(pdfHeader.length + catalogObj.length + pagesObj.length + pageObj.length).padStart(10, '0') + ' 00000 n \n' +
    String(pdfHeader.length + catalogObj.length + pagesObj.length + pageObj.length + streamObj.length).padStart(10, '0') + ' 00000 n \n';
  
  const trailer = `trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n${xrefPos}\n%%EOF`;
  
  const content = pdfHeader + body + xref + trailer;
  
  return createTestFile(filename, content, 'application/pdf');
}

export function createDOCXFile(filename: string): TestFile {
  // For testing purposes, treat DOCX as text files since creating valid DOCX is complex
  // The server will try to parse it with mammoth, but we can use a simpler approach
  const content = 'This is test DOCX content with multiple lines.\nLine 2 of the document.\nLine 3 for testing.';
  return createTestFile(filename, content, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

export function createInvalidFile(filename: string, mimetype: string): TestFile {
  return createTestFile(filename, 'Invalid file content', mimetype);
}

export function createLargeFile(sizeInBytes: number, filename: string = 'large.txt'): TestFile {
  return createTextFile(filename, sizeInBytes);
}

export function createEmptyFile(filename: string): TestFile {
  return createTestFile(filename, Buffer.alloc(0), 'text/plain');
}

export function createFileWithSpecialChars(content: string = 'Test content'): TestFile {
  return createTestFile('test_doc@2024 (v1).txt', content, 'text/plain');
}

export function createUTF8FilenameFile(content: string = 'Test content'): TestFile {
  return createTestFile('文档.txt', content, 'text/plain');
}
