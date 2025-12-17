import {
  type User,
  type InsertUser,
  type Equipment,
  type InsertEquipment,
  type LogEntry,
  type InsertLogEntry,
  type AuditTrail,
  type InsertAuditTrail,
  type PMSchedule,
  type InsertPMSchedule,
  users,
  equipment,
  logEntries,
  auditTrail,
  pmSchedules,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq, and, desc } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Equipment operations
  getAllEquipment(): Promise<Equipment[]>;
  getEquipmentById(id: string): Promise<Equipment | undefined>;
  getEquipmentByEquipmentId(equipmentId: string): Promise<Equipment | undefined>;
  createEquipment(eq: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: string, updates: Partial<InsertEquipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: string): Promise<void>;

  // Log Entry operations
  getAllLogEntries(): Promise<LogEntry[]>;
  getLogEntryById(id: string): Promise<LogEntry | undefined>;
  createLogEntry(log: InsertLogEntry): Promise<LogEntry>;
  updateLogEntry(id: string, updates: Partial<Omit<LogEntry, 'id' | 'logId' | 'createdAt'>>): Promise<LogEntry | undefined>;
  approveLogEntry(id: string, approverId: string): Promise<LogEntry | undefined>;

  // Audit Trail operations
  createAuditLog(audit: InsertAuditTrail): Promise<AuditTrail>;
  getAllAuditLogs(limit?: number): Promise<AuditTrail[]>;

  // PM Schedule operations
  getAllPMSchedules(): Promise<PMSchedule[]>;
  createPMSchedule(pm: InsertPMSchedule): Promise<PMSchedule>;
  updatePMSchedule(id: string, updates: Partial<InsertPMSchedule>): Promise<PMSchedule | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Equipment operations
  async getAllEquipment(): Promise<Equipment[]> {
    return await db.select().from(equipment).orderBy(desc(equipment.createdAt));
  }

  async getEquipmentById(id: string): Promise<Equipment | undefined> {
    const result = await db.select().from(equipment).where(eq(equipment.id, id)).limit(1);
    return result[0];
  }

  async getEquipmentByEquipmentId(equipmentId: string): Promise<Equipment | undefined> {
    const result = await db.select().from(equipment).where(eq(equipment.equipmentId, equipmentId)).limit(1);
    return result[0];
  }

  async createEquipment(eq: InsertEquipment): Promise<Equipment> {
    const result = await db.insert(equipment).values(eq).returning();
    return result[0];
  }

  async updateEquipment(id: string, updates: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const result = await db.update(equipment).set({ ...updates, updatedAt: new Date() }).where(eq(equipment.id, id)).returning();
    return result[0];
  }

  async deleteEquipment(id: string): Promise<void> {
    await db.delete(equipment).where(eq(equipment.id, id));
  }

  // Log Entry operations
  async getAllLogEntries(): Promise<LogEntry[]> {
    return await db.select().from(logEntries).orderBy(desc(logEntries.createdAt));
  }

  async getLogEntryById(id: string): Promise<LogEntry | undefined> {
    const result = await db.select().from(logEntries).where(eq(logEntries.id, id)).limit(1);
    return result[0];
  }

  async createLogEntry(log: InsertLogEntry): Promise<LogEntry> {
    // Generate log ID (e.g., LOG-2024-001)
    const year = new Date().getFullYear();
    const count = await db.select().from(logEntries);
    const logId = `LOG-${year}-${String(count.length + 1).padStart(3, '0')}`;
    
    const result = await db.insert(logEntries).values({
      ...log,
      logId,
    }).returning();
    return result[0];
  }

  async updateLogEntry(id: string, updates: Partial<Omit<LogEntry, 'id' | 'logId' | 'createdAt'>>): Promise<LogEntry | undefined> {
    const result = await db.update(logEntries).set(updates as any).where(eq(logEntries.id, id)).returning();
    return result[0];
  }

  async approveLogEntry(id: string, approverId: string): Promise<LogEntry | undefined> {
    const result = await db.update(logEntries).set({
      status: "Approved",
      approvedBy: approverId,
      approvedAt: new Date(),
    }).where(eq(logEntries.id, id)).returning();
    return result[0];
  }

  // Audit Trail operations
  async createAuditLog(audit: InsertAuditTrail): Promise<AuditTrail> {
    const result = await db.insert(auditTrail).values(audit).returning();
    return result[0];
  }

  async getAllAuditLogs(limit: number = 100): Promise<AuditTrail[]> {
    return await db.select().from(auditTrail).orderBy(desc(auditTrail.timestamp)).limit(limit);
  }

  // PM Schedule operations
  async getAllPMSchedules(): Promise<PMSchedule[]> {
    return await db.select().from(pmSchedules).orderBy(pmSchedules.nextDue);
  }

  async createPMSchedule(pm: InsertPMSchedule): Promise<PMSchedule> {
    const result = await db.insert(pmSchedules).values(pm).returning();
    return result[0];
  }

  async updatePMSchedule(id: string, updates: Partial<InsertPMSchedule>): Promise<PMSchedule | undefined> {
    const result = await db.update(pmSchedules).set(updates).where(eq(pmSchedules.id, id)).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
