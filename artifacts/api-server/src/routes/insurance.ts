import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, insurancePoliciesTable, insuranceClaimsTable, animalsTable } from "@workspace/db";
import {
  CreateInsurancePolicyBody,
  CreateInsuranceClaimBody,
  GetInsuranceClaimParams,
  UpdateInsuranceClaimParams,
  UpdateInsuranceClaimBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/insurance/policies", async (_req, res): Promise<void> => {
  const policies = await db.select().from(insurancePoliciesTable).orderBy(insurancePoliciesTable.createdAt);
  res.json(policies);
});

router.post("/insurance/policies", async (req, res): Promise<void> => {
  const parsed = CreateInsurancePolicyBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [animal] = await db.select().from(animalsTable).where(eq(animalsTable.id, parsed.data.animalId));
  const policyNumber = `PASH-INS-${Date.now().toString(36).toUpperCase()}`;
  const [policy] = await db.insert(insurancePoliciesTable).values({
    animalId: parsed.data.animalId,
    animalName: animal?.name ?? null,
    policyNumber,
    provider: parsed.data.provider,
    coverage: parsed.data.coverage ?? null,
    premium: parsed.data.premium,
    startDate: new Date(parsed.data.startDate),
    endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    status: "active",
  }).returning();
  res.status(201).json(policy);
});

router.get("/insurance/claims", async (_req, res): Promise<void> => {
  const claims = await db.select().from(insuranceClaimsTable).orderBy(insuranceClaimsTable.createdAt);
  res.json(claims);
});

router.post("/insurance/claims", async (req, res): Promise<void> => {
  const parsed = CreateInsuranceClaimBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [claim] = await db.insert(insuranceClaimsTable).values({ ...parsed.data, status: "filed" }).returning();
  res.status(201).json(claim);
});

router.get("/insurance/claims/:id", async (req, res): Promise<void> => {
  const params = GetInsuranceClaimParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [claim] = await db.select().from(insuranceClaimsTable).where(eq(insuranceClaimsTable.id, params.data.id));
  if (!claim) { res.status(404).json({ error: "Claim not found" }); return; }
  res.json(claim);
});

router.patch("/insurance/claims/:id", async (req, res): Promise<void> => {
  const params = UpdateInsuranceClaimParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateInsuranceClaimBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [claim] = await db.update(insuranceClaimsTable).set(parsed.data).where(eq(insuranceClaimsTable.id, params.data.id)).returning();
  if (!claim) { res.status(404).json({ error: "Claim not found" }); return; }
  res.json(claim);
});

export default router;
