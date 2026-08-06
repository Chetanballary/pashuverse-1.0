import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull(),
  animalName: text("animal_name"),
  veterinarianId: text("veterinarian_id"),
  veterinarianName: text("veterinarian_name"),
  type: text("type").notNull(), // video_call, voice_call, in_person, emergency
  status: text("status").notNull().default("scheduled"), // scheduled, confirmed, completed, cancelled
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({ id: true, createdAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;
