import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sosRequestsTable = pgTable("sos_requests", {
  id: serial("id").primaryKey(),
  farmerId: text("farmer_id").notNull(),
  farmerName: text("farmer_name"),
  animalId: integer("animal_id"),
  description: text("description").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: text("status").notNull().default("active"), // active, responded, resolved
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSosRequestSchema = createInsertSchema(sosRequestsTable).omit({ id: true, createdAt: true });
export type InsertSosRequest = z.infer<typeof insertSosRequestSchema>;
export type SosRequest = typeof sosRequestsTable.$inferSelect;
