import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, animalsTable, appointmentsTable, vaccinationsTable, notificationsTable, sosRequestsTable, diseasePredictionsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [totalAnimals] = await db.select({ count: count() }).from(animalsTable);
  const [healthyAnimals] = await db.select({ count: count() }).from(animalsTable).where(eq(animalsTable.status, "healthy"));
  const [sickAnimals] = await db.select({ count: count() }).from(animalsTable).where(eq(animalsTable.status, "sick"));
  const [pendingVaccinations] = await db.select({ count: count() }).from(vaccinationsTable).where(sql`${vaccinationsTable.nextDueDate} > NOW()`);
  const [activeAlerts] = await db.select({ count: count() }).from(diseasePredictionsTable).where(eq(diseasePredictionsTable.severity, "critical"));
  const [todayAppointments] = await db.select({ count: count() }).from(appointmentsTable).where(sql`DATE(${appointmentsTable.scheduledAt}) = CURRENT_DATE`);
  const [openSosRequests] = await db.select({ count: count() }).from(sosRequestsTable).where(eq(sosRequestsTable.status, "active"));

  res.json({
    totalAnimals: totalAnimals.count,
    healthyAnimals: healthyAnimals.count,
    sickAnimals: sickAnimals.count,
    pendingVaccinations: pendingVaccinations.count,
    activeAlerts: activeAlerts.count,
    totalFarmers: 1247,
    activeCases: sickAnimals.count + activeAlerts.count,
    todayAppointments: todayAppointments.count,
    openSosRequests: openSosRequests.count,
  });
});

router.get("/dashboard/disease-surveillance", async (_req, res): Promise<void> => {
  res.json([
    { id: 1, region: "Karnataka", diseaseType: "Foot and Mouth Disease", caseCount: 23, severity: "critical", latitude: 15.3173, longitude: 75.7139, reportedDate: new Date().toISOString() },
    { id: 2, region: "Maharashtra", diseaseType: "Bovine Respiratory Disease", caseCount: 45, severity: "high", latitude: 19.7515, longitude: 75.7139, reportedDate: new Date().toISOString() },
    { id: 3, region: "Punjab", diseaseType: "Bovine Viral Diarrhea", caseCount: 12, severity: "medium", latitude: 31.1471, longitude: 75.3412, reportedDate: new Date().toISOString() },
    { id: 4, region: "Rajasthan", diseaseType: "Bluetongue Disease", caseCount: 8, severity: "low", latitude: 27.0238, longitude: 74.2179, reportedDate: new Date().toISOString() },
    { id: 5, region: "Uttar Pradesh", diseaseType: "Brucellosis", caseCount: 31, severity: "high", latitude: 26.8467, longitude: 80.9462, reportedDate: new Date().toISOString() },
    { id: 6, region: "Tamil Nadu", diseaseType: "Anthrax", caseCount: 3, severity: "critical", latitude: 11.1271, longitude: 78.6569, reportedDate: new Date().toISOString() },
  ]);
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const recentAnimals = await db.select().from(animalsTable).orderBy(sql`${animalsTable.createdAt} DESC`).limit(3);
  const recentPredictions = await db.select().from(diseasePredictionsTable).orderBy(sql`${diseasePredictionsTable.createdAt} DESC`).limit(3);
  const recentSos = await db.select().from(sosRequestsTable).orderBy(sql`${sosRequestsTable.createdAt} DESC`).limit(2);

  const activity = [
    ...recentAnimals.map((a, i) => ({ id: i + 1, type: "animal_registered", description: `Animal "${a.name}" registered by farmer`, timestamp: a.createdAt.toISOString(), actorName: "Farmer", actorRole: "farmer" })),
    ...recentPredictions.map((p, i) => ({ id: i + 100, type: "disease_detected", description: `AI detected "${p.predictedDisease}" for ${p.animalName ?? "animal"}`, timestamp: p.createdAt.toISOString(), actorName: "SAATHI AI", actorRole: "system" })),
    ...recentSos.map((s, i) => ({ id: i + 200, type: "sos_alert", description: `Emergency SOS: ${s.description.slice(0, 60)}`, timestamp: s.createdAt.toISOString(), actorName: s.farmerName ?? "Farmer", actorRole: "farmer" })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

  res.json(activity.map((a, i) => ({ ...a, id: i + 1 })));
});

router.get("/dashboard/farm-analytics", async (_req, res): Promise<void> => {
  res.json({
    milkProduction: [
      { month: "Jan", liters: 4200 }, { month: "Feb", liters: 3800 }, { month: "Mar", liters: 4500 },
      { month: "Apr", liters: 4100 }, { month: "May", liters: 3900 }, { month: "Jun", liters: 4700 },
      { month: "Jul", liters: 5100 }, { month: "Aug", liters: 4900 }, { month: "Sep", liters: 4600 },
      { month: "Oct", liters: 5200 }, { month: "Nov", liters: 4800 }, { month: "Dec", liters: 5400 },
    ],
    growthRate: [
      { month: "Jan", rate: 2.1 }, { month: "Feb", rate: 2.4 }, { month: "Mar", rate: 2.8 },
      { month: "Apr", rate: 2.6 }, { month: "May", rate: 3.1 }, { month: "Jun", rate: 3.4 },
      { month: "Jul", rate: 3.2 }, { month: "Aug", rate: 2.9 }, { month: "Sep", rate: 3.5 },
      { month: "Oct", rate: 3.8 }, { month: "Nov", rate: 3.6 }, { month: "Dec", rate: 4.0 },
    ],
    mortalityRate: 1.2,
    revenue: 842000,
    expenses: 318000,
    profitMargin: 62.2,
  });
});

export default router;
