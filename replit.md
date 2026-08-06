# PASHUVERSE

AI-Powered Intelligent Ecosystem for Predictive Animal Healthcare and Livestock Management — a national-scale platform connecting Farmers, Veterinarians, Labs, Hospitals, Government, NGOs, Insurance Providers, and Researchers.

## Run & Operate

- `pnpm --filter @workspace/pashuverse run dev` — run the frontend (port set by workflow, previewPath `/`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, previewPath `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, framer-motion, Recharts, Lucide icons
- API: Express 5, contract-first OpenAPI → Orval codegen
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Auth: Mock AuthContext (role-based; upgrade to Clerk for production)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (one file per domain)
- `artifacts/api-server/src/routes/` — Express route handlers (one file per domain)
- `artifacts/pashuverse/src/` — React frontend (pages/, components/, context/)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — generated Zod validation schemas (do not edit)

## Architecture decisions

- Contract-first: all API shapes defined in `openapi.yaml` before any code is written
- Orval codegen generates both React Query hooks (frontend) and Zod validators (backend)
- DB schema lives in `lib/db` as a shared workspace package; routes import tables directly
- Disease prediction uses a deterministic keyword-matching mock (ready to replace with Gemini/OpenAI)
- Dashboard stats are computed live from DB counts; farm analytics and surveillance are seeded static data

## Product — 20 Modules

1. AI Disease Detection — symptom → AI prediction with confidence score and treatment
2. Digital Health Passport — QR code, full animal timeline
3. Tele-Veterinary — video/voice/emergency appointment booking
4. Vaccination Manager — schedule, calendar, certificate
5. Disease Surveillance — GIS outbreak map with severity heatmap
6. Smart Farm Dashboard — stats, charts, analytics
7. Nutrition Advisor — feed recommendations, weight tracking
8. Breeding Management — heat cycle, pregnancy, calving
9. Emergency SOS — one-tap SOS with GPS
10. Marketplace — medicines, vaccines, feed, equipment
11. Insurance Portal — buy policy, file claims, track status
12. Laboratory Portal — test booking, sample tracking, reports
13. Government Dashboard — outbreak monitoring, district analytics
14. NGO Dashboard — rescue, adoption, donations
15. Research Portal — anonymous data, disease trends
16. SAATHI AI — voice/text chatbot (English, Hindi, Kannada)
17. Animal Digital Twin — health score 0–100, risk prediction, AI forecast
18. Sustainability Dashboard — carbon footprint, feed efficiency
19. Community Forum — posts, ask-a-vet, announcements
20. Smart Notifications — vaccination due, disease alert, SOS

## Roles

Farmer, Veterinarian, Laboratory, Animal Hospital, Government Officer, NGO, Insurance Provider, Researcher, Admin

## User preferences

_Populate as you build._

## Gotchas

- After any `lib/` schema change, run `pnpm run typecheck:libs` before checking artifact packages
- After any `openapi.yaml` change, run `pnpm --filter @workspace/api-spec run codegen`
- `vaccinations.administeredDate` and `nextDueDate` are `timestamp` columns — pass `new Date(string)` when inserting
- AI disease prediction in `disease_predictions.ts` is a keyword-match stub; replace with real LLM call when ready
