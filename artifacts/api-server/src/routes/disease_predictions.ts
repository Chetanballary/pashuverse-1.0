import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, diseasePredictionsTable, animalsTable } from "@workspace/db";
import {
  ListDiseasePredictionsQueryParams,
  CreateDiseasePredictionBody,
  GetDiseasePredictionParams,
} from "@workspace/api-zod";

// Simulated AI disease prediction (deterministic mock)
function predictDisease(symptoms: string): { disease: string; confidence: number; severity: string; severityScore: number; treatment: string } {
  const s = symptoms.toLowerCase();
  if (s.includes("fever") || s.includes("lethargy") || s.includes("loss of appetite")) {
    return { disease: "Bovine Respiratory Disease", confidence: 0.87, severity: "high", severityScore: 72, treatment: "Administer prescribed antibiotics (Florfenicol 20mg/kg). Isolate the animal in a warm, dry area. Ensure high hydration and fresh fodder. Monitor vitals for 48 hours." };
  }
  if (s.includes("limping") || s.includes("swelling") || s.includes("foot")) {
    return { disease: "Foot and Mouth Disease", confidence: 0.91, severity: "critical", severityScore: 88, treatment: "No specific antiviral treatment. Apply antiseptic to lesions. Administer supportive care (anti-inflammatories) and soft feed. Report to local veterinary authorities immediately." };
  }
  if (s.includes("diarrhea") || s.includes("loose stool") || s.includes("dehydration")) {
    return { disease: "Bovine Viral Diarrhea", confidence: 0.79, severity: "medium", severityScore: 55, treatment: "Provide active oral fluid therapy (electrolytes) to counter dehydration. Administer intestinal binders and consult for possible secondary infection antibiotic treatment." };
  }
  if (s.includes("bloat") || s.includes("stomach") || s.includes("distended")) {
    return { disease: "Rumen Bloat", confidence: 0.84, severity: "high", severityScore: 68, treatment: "Administer anti-bloating surfactant (e.g. Poloxalene or vegetable oil 250ml) via drench. In critical cases, perform emergency trocarization of the left flank." };
  }
  return { disease: "General Infection", confidence: 0.65, severity: "low", severityScore: 35, treatment: "Isolate the animal, provide clean drinking water, fresh greens, and general comfort. Monitor temperature and feed intake for 24-48 hours." };
}

const router: IRouter = Router();

router.get("/disease-predictions", async (req, res): Promise<void> => {
  const parsed = ListDiseasePredictionsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  let predictions;
  if (parsed.data.animalId) {
    predictions = await db.select().from(diseasePredictionsTable).where(eq(diseasePredictionsTable.animalId, parsed.data.animalId)).orderBy(diseasePredictionsTable.createdAt);
  } else {
    predictions = await db.select().from(diseasePredictionsTable).orderBy(diseasePredictionsTable.createdAt);
  }
  res.json(predictions);
});

router.post("/disease-predictions", async (req, res): Promise<void> => {
  const parsed = CreateDiseasePredictionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [animal] = await db.select().from(animalsTable).where(eq(animalsTable.id, parsed.data.animalId));
  const prediction = predictDisease(parsed.data.symptoms);

  const [record] = await db.insert(diseasePredictionsTable).values({
    animalId: parsed.data.animalId,
    animalName: animal?.name ?? null,
    symptoms: parsed.data.symptoms,
    imageUrl: parsed.data.imageUrl ?? null,
    predictedDisease: prediction.disease,
    confidence: prediction.confidence,
    severity: prediction.severity,
    severityScore: prediction.severityScore,
    recommendedTreatment: prediction.treatment,
    nearbyVets: JSON.stringify([
      { name: "Dr. Rajesh Kumar", distance: "2.3 km", phone: "+91-9876543210" },
      { name: "Dr. Priya Singh", distance: "4.1 km", phone: "+91-9876543211" },
    ]),
  }).returning();

  res.status(201).json(record);
});

router.get("/disease-predictions/:id", async (req, res): Promise<void> => {
  const params = GetDiseasePredictionParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [prediction] = await db.select().from(diseasePredictionsTable).where(eq(diseasePredictionsTable.id, params.data.id));
  if (!prediction) { res.status(404).json({ error: "Prediction not found" }); return; }
  res.json(prediction);
});

export default router;
