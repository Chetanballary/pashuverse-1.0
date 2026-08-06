import { Router, type IRouter } from "express";
import { eq, and, ilike, or } from "drizzle-orm";
import { db, animalsTable, healthRecordsTable, vaccinationsTable, digitalTwinsTable } from "@workspace/db";
import {
  ListAnimalsQueryParams,
  CreateAnimalBody,
  GetAnimalParams,
  UpdateAnimalParams,
  UpdateAnimalBody,
  DeleteAnimalParams,
  GetAnimalHealthRecordsParams,
  GetAnimalVaccinationsParams,
  GetAnimalDigitalTwinParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/animals", async (req, res): Promise<void> => {
  const parsed = ListAnimalsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { status, species, search } = parsed.data;

  let query = db.select().from(animalsTable).$dynamic();
  const conditions = [];
  if (status) conditions.push(eq(animalsTable.status, status));
  if (species) conditions.push(eq(animalsTable.species, species));
  if (search) conditions.push(or(ilike(animalsTable.name, `%${search}%`), ilike(animalsTable.breed, `%${search}%`)));
  if (conditions.length > 0) query = query.where(and(...conditions));

  const animals = await query.orderBy(animalsTable.createdAt);
  res.json(animals);
});

router.post("/animals", async (req, res): Promise<void> => {
  const parsed = CreateAnimalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [animal] = await db.insert(animalsTable).values({
    ...parsed.data,
    qrCode: `PASH-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  }).returning();
  // Create digital twin automatically
  await db.insert(digitalTwinsTable).values({ animalId: animal.id, healthScore: 80, riskLevel: "low" }).onConflictDoNothing();
  res.status(201).json(animal);
});

router.get("/animals/:id", async (req, res): Promise<void> => {
  const params = GetAnimalParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [animal] = await db.select().from(animalsTable).where(eq(animalsTable.id, params.data.id));
  if (!animal) { res.status(404).json({ error: "Animal not found" }); return; }
  res.json(animal);
});

router.patch("/animals/:id", async (req, res): Promise<void> => {
  const params = UpdateAnimalParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateAnimalBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [animal] = await db.update(animalsTable).set(parsed.data).where(eq(animalsTable.id, params.data.id)).returning();
  if (!animal) { res.status(404).json({ error: "Animal not found" }); return; }
  res.json(animal);
});

router.delete("/animals/:id", async (req, res): Promise<void> => {
  const params = DeleteAnimalParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [animal] = await db.delete(animalsTable).where(eq(animalsTable.id, params.data.id)).returning();
  if (!animal) { res.status(404).json({ error: "Animal not found" }); return; }
  res.sendStatus(204);
});

router.get("/animals/:id/health-records", async (req, res): Promise<void> => {
  const params = GetAnimalHealthRecordsParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const records = await db.select().from(healthRecordsTable).where(eq(healthRecordsTable.animalId, params.data.id)).orderBy(healthRecordsTable.recordedAt);
  res.json(records);
});

router.get("/animals/:id/vaccinations", async (req, res): Promise<void> => {
  const params = GetAnimalVaccinationsParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const vaccinations = await db.select().from(vaccinationsTable).where(eq(vaccinationsTable.animalId, params.data.id)).orderBy(vaccinationsTable.administeredDate);
  res.json(vaccinations);
});

router.get("/animals/:id/digital-twin", async (req, res): Promise<void> => {
  const params = GetAnimalDigitalTwinParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  let [twin] = await db.select().from(digitalTwinsTable).where(eq(digitalTwinsTable.animalId, params.data.id));
  if (!twin) {
    [twin] = await db.insert(digitalTwinsTable).values({ animalId: params.data.id, healthScore: 80, riskLevel: "low" }).returning();
  }
  res.json(twin);
});

export default router;
