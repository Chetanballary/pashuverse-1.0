import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const healthRecordsTable = pgTable("health_records", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull(),
  veterinarianId: text("veterinarian_id"),
  veterinarianName: text("veterinarian_name"),
  diagnosis: text("diagnosis").notNull(),
  treatment: text("treatment").notNull(),
  notes: text("notes"),
  severity: text("severity"), // low, medium, high, critical
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHealthRecordSchema = createInsertSchema(healthRecordsTable).omit({ id: true, createdAt: true });
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type HealthRecord = typeof healthRecordsTable.$inferSelect;
