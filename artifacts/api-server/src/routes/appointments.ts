import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, appointmentsTable } from "@workspace/db";
import {
  ListAppointmentsQueryParams,
  CreateAppointmentBody,
  GetAppointmentParams,
  UpdateAppointmentParams,
  UpdateAppointmentBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/appointments", async (req, res): Promise<void> => {
  const parsed = ListAppointmentsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const appointments = parsed.data.status
    ? await db.select().from(appointmentsTable).where(eq(appointmentsTable.status, parsed.data.status)).orderBy(appointmentsTable.scheduledAt)
    : await db.select().from(appointmentsTable).orderBy(appointmentsTable.scheduledAt);
  res.json(appointments);
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const data = {
    animalId: parsed.data.animalId,
    veterinarianId: parsed.data.veterinarianId ?? null,
    veterinarianName: parsed.data.veterinarianName ?? null,
    type: parsed.data.type,
    scheduledAt: new Date(parsed.data.scheduledAt),
    notes: parsed.data.notes ?? null,
    status: "scheduled" as const,
  };
  const [appt] = await db.insert(appointmentsTable).values(data).returning();
  res.status(201).json(appt);
});

router.get("/appointments/:id", async (req, res): Promise<void> => {
  const params = GetAppointmentParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [appt] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, params.data.id));
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  res.json(appt);
});

router.patch("/appointments/:id", async (req, res): Promise<void> => {
  const params = UpdateAppointmentParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [appt] = await db.update(appointmentsTable).set(parsed.data).where(eq(appointmentsTable.id, params.data.id)).returning();
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  res.json(appt);
});

export default router;
