import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", ["Operator", "Supervisor", "QA", "Engineer", "Admin"]);
export const equipmentStatusEnum = pgEnum("equipment_status", ["Operational", "In Use", "Maintenance", "Offline"]);
export const logStatusEnum = pgEnum("log_status", ["Draft", "Submitted", "Approved", "Rejected"]);
export const activityTypeEnum = pgEnum("activity_type", ["Operation", "Maintenance", "Calibration", "Cleaning", "Sampling"]);
export const auditActionEnum = pgEnum("audit_action", ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "APPROVE", "REJECT"]);

// Users Table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: roleEnum("role").notNull().default("Operator"),
  department: text("department"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Equipment Table
export const equipment = pgTable("equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  equipmentId: text("equipment_id").notNull().unique(), // e.g., EQ-BIO-001
  name: text("name").notNull(),
  type: text("type").notNull(),
  manufacturer: text("manufacturer"),
  model: text("model"),
  serialNumber: text("serial_number"),
  location: text("location").notNull(),
  status: equipmentStatusEnum("status").notNull().default("Operational"),
  qualificationStatus: text("qualification_status"), // IQ/OQ/PQ
  pmFrequency: text("pm_frequency"), // Monthly, Weekly, etc.
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipment.$inferSelect;

// Log Entries Table
export const logEntries = pgTable("log_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  logId: text("log_id").notNull().unique(), // e.g., LOG-2024-001
  equipmentId: varchar("equipment_id").notNull().references(() => equipment.id),
  activityType: activityTypeEnum("activity_type").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  description: text("description").notNull(),
  batchNumber: text("batch_number"),
  readings: text("readings"), // JSON string for temp, pH, etc.
  status: logStatusEnum("status").notNull().default("Draft"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  submittedAt: timestamp("submitted_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
});

export const insertLogEntrySchema = createInsertSchema(logEntries).omit({
  id: true,
  logId: true,
  createdAt: true,
  submittedAt: true,
  approvedAt: true,
});

export type InsertLogEntry = z.infer<typeof insertLogEntrySchema>;
export type LogEntry = typeof logEntries.$inferSelect;

// Audit Trail Table (Immutable)
export const auditTrail = pgTable("audit_trail", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: auditActionEnum("action").notNull(),
  entityType: text("entity_type").notNull(), // Equipment, LogEntry, User, etc.
  entityId: text("entity_id"), // ID of the affected record
  oldValue: text("old_value"), // JSON string
  newValue: text("new_value"), // JSON string
  reason: text("reason"),
  ipAddress: text("ip_address"),
});

export const insertAuditTrailSchema = createInsertSchema(auditTrail).omit({
  id: true,
  timestamp: true,
});

export type InsertAuditTrail = z.infer<typeof insertAuditTrailSchema>;
export type AuditTrail = typeof auditTrail.$inferSelect;

// PM Schedules Table
export const pmSchedules = pgTable("pm_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  equipmentId: varchar("equipment_id").notNull().references(() => equipment.id),
  taskName: text("task_name").notNull(),
  frequency: text("frequency").notNull(), // Daily, Weekly, Monthly, Quarterly
  lastPerformed: timestamp("last_performed"),
  nextDue: timestamp("next_due").notNull(),
  status: text("status").notNull().default("Scheduled"), // Scheduled, Overdue, Completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPMScheduleSchema = createInsertSchema(pmSchedules).omit({
  id: true,
  createdAt: true,
});

export type InsertPMSchedule = z.infer<typeof insertPMScheduleSchema>;
export type PMSchedule = typeof pmSchedules.$inferSelect;
