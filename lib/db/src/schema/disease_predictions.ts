import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const diseasePredictionsTable = pgTable("disease_predictions", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull(),
  animalName: text("animal_name"),
  symptoms: text("symptoms").notNull(),
  predictedDisease: text("predicted_disease"),
  confidence: real("confidence"), // 0-1 float
  severity: text("severity"), // low, medium, high, critical
  severityScore: real("severity_score"), // 0-100
  recommendedTreatment: text("recommended_treatment"),
  nearbyVets: text("nearby_vets"), // JSON string
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDiseasePredictionSchema = createInsertSchema(diseasePredictionsTable).omit({ id: true, createdAt: true });
export type InsertDiseasePrediction = z.infer<typeof insertDiseasePredictionSchema>;
export type DiseasePrediction = typeof diseasePredictionsTable.$inferSelect;
