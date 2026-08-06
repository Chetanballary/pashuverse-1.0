import { Router, type IRouter } from "express";
import { eq, gt, and } from "drizzle-orm";
import { db, vaccinationsTable } from "@workspace/db";
import {
  ListVaccinationsQueryParams,
  CreateVaccinationBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/vaccinations", async (req, res): Promise<void> => {
  const parsed = ListVaccinationsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const conditions = [];
  if (parsed.data.animalId) conditions.push(eq(vaccinationsTable.animalId, parsed.data.animalId));
  if (parsed.data.upcoming) conditions.push(gt(vaccinationsTable.nextDueDate, new Date()));

  const vaccinations = conditions.length > 0
    ? await db.select().from(vaccinationsTable).where(and(...conditions)).orderBy(vaccinationsTable.administeredDate)
    : await db.select().from(vaccinationsTable).orderBy(vaccinationsTable.administeredDate);

  res.json(vaccinations);
});

router.post("/vaccinations", async (req, res): Promise<void> => {
  const parsed = CreateVaccinationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const insertData: Parameters<typeof db.insert<typeof vaccinationsTable>>[0] extends infer T ? never : never = {} as never;
  const data = {
    animalId: parsed.data.animalId,
    vaccineName: parsed.data.vaccineName,
    batchNumber: parsed.data.batchNumber ?? null,
    administeredDate: new Date(parsed.data.administeredDate),
    nextDueDate: parsed.data.nextDueDate ? new Date(parsed.data.nextDueDate) : null,
    veterinarianId: parsed.data.veterinarianId ?? null,
    veterinarianName: parsed.data.veterinarianName ?? null,
  };

  const [vaccination] = await db.insert(vaccinationsTable).values(data).returning();
  res.status(201).json(vaccination);
});

export default router;
