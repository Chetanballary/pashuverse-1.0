import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vaccinationsTable = pgTable("vaccinations", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull(),
  vaccineName: text("vaccine_name").notNull(),
  batchNumber: text("batch_number"),
  administeredDate: timestamp("administered_date", { withTimezone: true }).notNull(),
  nextDueDate: timestamp("next_due_date", { withTimezone: true }),
  veterinarianId: text("veterinarian_id"),
  veterinarianName: text("veterinarian_name"),
  certificateUrl: text("certificate_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVaccinationSchema = createInsertSchema(vaccinationsTable).omit({ id: true, createdAt: true });
export type InsertVaccination = z.infer<typeof insertVaccinationSchema>;
export type Vaccination = typeof vaccinationsTable.$inferSelect;
