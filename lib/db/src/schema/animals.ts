import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const animalsTable = pgTable("animals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species").notNull(),
  breed: text("breed").notNull(),
  age: real("age"),
  weight: real("weight"),
  ownerId: text("owner_id").notNull(),
  qrCode: text("qr_code"),
  healthScore: integer("health_score").notNull().default(80),
  status: text("status").notNull().default("healthy"), // healthy, sick, at_risk, critical
  imageUrl: text("image_url"),
  tagNumber: text("tag_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAnimalSchema = createInsertSchema(animalsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAnimal = z.infer<typeof insertAnimalSchema>;
export type Animal = typeof animalsTable.$inferSelect;
