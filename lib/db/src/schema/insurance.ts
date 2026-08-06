import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const insurancePoliciesTable = pgTable("insurance_policies", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull(),
  animalName: text("animal_name"),
  policyNumber: text("policy_number").notNull(),
  provider: text("provider").notNull(),
  coverage: text("coverage"),
  premium: real("premium").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  status: text("status").notNull().default("active"), // active, expired, cancelled
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insuranceClaimsTable = pgTable("insurance_claims", {
  id: serial("id").primaryKey(),
  policyId: integer("policy_id").notNull(),
  amount: real("amount").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("filed"), // filed, under_review, approved, rejected
  documents: text("documents"), // JSON array of document URLs
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInsurancePolicySchema = createInsertSchema(insurancePoliciesTable).omit({ id: true, createdAt: true });
export type InsertInsurancePolicy = z.infer<typeof insertInsurancePolicySchema>;
export type InsurancePolicy = typeof insurancePoliciesTable.$inferSelect;

export const insertInsuranceClaimSchema = createInsertSchema(insuranceClaimsTable).omit({ id: true, createdAt: true });
export type InsertInsuranceClaim = z.infer<typeof insertInsuranceClaimSchema>;
export type InsuranceClaim = typeof insuranceClaimsTable.$inferSelect;
