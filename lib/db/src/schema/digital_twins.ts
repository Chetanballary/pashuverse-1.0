import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const digitalTwinsTable = pgTable("digital_twins", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull().unique(),
  healthScore: integer("health_score").notNull().default(80),
  riskLevel: text("risk_level").notNull().default("low"), // low, medium, high, critical
  aiForecasts: text("ai_forecasts"), // JSON string
  medicalTimeline: text("medical_timeline"), // JSON string
  nutritionScore: real("nutrition_score"),
  activityScore: real("activity_score"),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDigitalTwinSchema = createInsertSchema(digitalTwinsTable).omit({ id: true, createdAt: true });
export type InsertDigitalTwin = z.infer<typeof insertDigitalTwinSchema>;
export type DigitalTwin = typeof digitalTwinsTable.$inferSelect;
