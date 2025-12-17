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
  type SystemConfig,
  type InsertSystemConfig,
  type Notification,
  type InsertNotification,
  type EmailConfig,
  type InsertEmailConfig,
  users,
  equipment,
  logEntries,
  auditTrail,
  pmSchedules,
  systemConfig,
  notifications,
  emailConfig,
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

  // System Config operations
  getSystemConfig(key: string): Promise<SystemConfig | undefined>;
  getAllSystemConfig(): Promise<SystemConfig[]>;
  setSystemConfig(key: string, value: string | null, updatedBy?: string): Promise<SystemConfig>;

  // Notification operations
  getAllNotifications(userId?: string): Promise<Notification[]>;
  getUnreadNotifications(userId?: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsRead(userId: string): Promise<void>;

  // Email Config operations
  getEmailConfig(): Promise<EmailConfig | undefined>;
  updateEmailConfig(config: Partial<InsertEmailConfig>): Promise<EmailConfig>;
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

  // System Config operations
  async getSystemConfig(key: string): Promise<SystemConfig | undefined> {
    const result = await db.select().from(systemConfig).where(eq(systemConfig.key, key)).limit(1);
    return result[0];
  }

  async getAllSystemConfig(): Promise<SystemConfig[]> {
    return await db.select().from(systemConfig);
  }

  async setSystemConfig(key: string, value: string | null, updatedBy?: string): Promise<SystemConfig> {
    const existing = await this.getSystemConfig(key);
    if (existing) {
      const result = await db.update(systemConfig).set({
        value,
        updatedBy,
        updatedAt: new Date(),
      }).where(eq(systemConfig.key, key)).returning();
      return result[0];
    }
    const result = await db.insert(systemConfig).values({
      key,
      value,
      updatedBy,
    }).returning();
    return result[0];
  }

  // Notification operations
  async getAllNotifications(userId?: string): Promise<Notification[]> {
    if (userId) {
      return await db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
    }
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(userId?: string): Promise<Notification[]> {
    if (userId) {
      return await db.select().from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.status, "Unread")))
        .orderBy(desc(notifications.createdAt));
    }
    return await db.select().from(notifications)
      .where(eq(notifications.status, "Unread"))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const result = await db.update(notifications).set({
      status: "Read",
      readAt: new Date(),
    }).where(eq(notifications.id, id)).returning();
    return result[0];
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({
      status: "Read",
      readAt: new Date(),
    }).where(and(eq(notifications.userId, userId), eq(notifications.status, "Unread")));
  }

  // Email Config operations
  async getEmailConfig(): Promise<EmailConfig | undefined> {
    const result = await db.select().from(emailConfig).limit(1);
    return result[0];
  }

  async updateEmailConfig(config: Partial<InsertEmailConfig>): Promise<EmailConfig> {
    const existing = await this.getEmailConfig();
    if (existing) {
      const result = await db.update(emailConfig).set({
        ...config,
        updatedAt: new Date(),
      }).where(eq(emailConfig.id, existing.id)).returning();
      return result[0];
    }
    const result = await db.insert(emailConfig).values({
      ...config,
      isEnabled: config.isEnabled ?? false,
    }).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
