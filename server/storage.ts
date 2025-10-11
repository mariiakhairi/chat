import { type User, type InsertUser, type Message, type UploadedDocument } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  addDocument(doc: Omit<UploadedDocument, 'id'>): Promise<UploadedDocument>;
  getDocuments(): Promise<UploadedDocument[]>;
  removeDocument(id: string): Promise<void>;
  clearDocuments(): Promise<void>;
  
  addMessage(message: Message): Promise<Message>;
  getMessages(): Promise<Message[]>;
  clearMessages(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private documents: Map<string, UploadedDocument>;
  private messages: Message[];

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.messages = [];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async addDocument(doc: Omit<UploadedDocument, 'id'>): Promise<UploadedDocument> {
    const id = randomUUID();
    const document: UploadedDocument = { ...doc, id };
    this.documents.set(id, document);
    return document;
  }

  async getDocuments(): Promise<UploadedDocument[]> {
    return Array.from(this.documents.values());
  }

  async removeDocument(id: string): Promise<void> {
    this.documents.delete(id);
    if (this.documents.size === 0) {
      this.messages = [];
    }
  }

  async clearDocuments(): Promise<void> {
    this.documents.clear();
    this.messages = [];
  }

  async addMessage(message: Message): Promise<Message> {
    this.messages.push(message);
    return message;
  }

  async getMessages(): Promise<Message[]> {
    return this.messages;
  }

  async clearMessages(): Promise<void> {
    this.messages = [];
  }
}

export const storage = new MemStorage();
