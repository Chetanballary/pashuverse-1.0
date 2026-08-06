import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, healthRecordsTable } from "@workspace/db";
import {
  ListHealthRecordsQueryParams,
  CreateHealthRecordBody,
  GetHealthRecordParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/health-records", async (req, res): Promise<void> => {
  const parsed = ListHealthRecordsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  let records;
  if (parsed.data.animalId) {
    records = await db.select().from(healthRecordsTable).where(eq(healthRecordsTable.animalId, parsed.data.animalId)).orderBy(healthRecordsTable.recordedAt);
  } else {
    records = await db.select().from(healthRecordsTable).orderBy(healthRecordsTable.recordedAt);
  }
  res.json(records);
});

router.post("/health-records", async (req, res): Promise<void> => {
  const parsed = CreateHealthRecordBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const insertData = {
    ...parsed.data,
    recordedAt: new Date(parsed.data.recordedAt),
  };
  const [record] = await db.insert(healthRecordsTable).values(insertData).returning();
  res.status(201).json(record);
});

router.get("/health-records/:id", async (req, res): Promise<void> => {
  const params = GetHealthRecordParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [record] = await db.select().from(healthRecordsTable).where(eq(healthRecordsTable.id, params.data.id));
  if (!record) { res.status(404).json({ error: "Health record not found" }); return; }
  res.json(record);
});

export default router;
