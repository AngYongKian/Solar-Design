import { type User, type InsertUser, type Calculation, type InsertCalculation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCalculation(id: string): Promise<Calculation | undefined>;
  getCalculationsByUserId(userId: string): Promise<Calculation[]>;
  createCalculation(calculation: InsertCalculation): Promise<Calculation>;
  updateCalculation(id: string, calculation: Partial<Calculation>): Promise<Calculation | undefined>;
  deleteCalculation(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private calculations: Map<string, Calculation>;

  constructor() {
    this.users = new Map();
    this.calculations = new Map();
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

  async getCalculation(id: string): Promise<Calculation | undefined> {
    return this.calculations.get(id);
  }

  async getCalculationsByUserId(userId: string): Promise<Calculation[]> {
    return Array.from(this.calculations.values()).filter(
      (calc) => calc.userId === userId,
    );
  }

  async createCalculation(insertCalculation: InsertCalculation): Promise<Calculation> {
    const id = randomUUID();
    const calculation: Calculation = {
      ...insertCalculation,
      id,
      createdAt: new Date().toISOString(),
      userId: insertCalculation.userId || null,
    };
    this.calculations.set(id, calculation);
    return calculation;
  }

  async updateCalculation(id: string, updates: Partial<Calculation>): Promise<Calculation | undefined> {
    const existing = this.calculations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.calculations.set(id, updated);
    return updated;
  }

  async deleteCalculation(id: string): Promise<boolean> {
    return this.calculations.delete(id);
  }
}

export const storage = new MemStorage();
