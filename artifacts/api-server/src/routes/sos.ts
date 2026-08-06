import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, sosRequestsTable } from "@workspace/db";
import {
  CreateSosRequestBody,
  UpdateSosRequestParams,
  UpdateSosRequestBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sos-requests", async (req, res): Promise<void> => {
  const requests = await db.select().from(sosRequestsTable).orderBy(sosRequestsTable.createdAt);
  res.json(requests);
});

router.post("/sos-requests", async (req, res): Promise<void> => {
  const parsed = CreateSosRequestBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [request] = await db.insert(sosRequestsTable).values({ ...parsed.data, status: "active" }).returning();
  res.status(201).json(request);
});

router.patch("/sos-requests/:id", async (req, res): Promise<void> => {
  const params = UpdateSosRequestParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateSosRequestBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [request] = await db.update(sosRequestsTable).set(parsed.data).where(eq(sosRequestsTable.id, params.data.id)).returning();
  if (!request) { res.status(404).json({ error: "SOS request not found" }); return; }
  res.json(request);
});

export default router;
