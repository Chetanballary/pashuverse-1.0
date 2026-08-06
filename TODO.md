# TODO: Remove Disease Detection, Vaccinations, and Emergency SOS Features

## Step 1: Delete Page Components
- [x] Delete `artifacts/pashuverse/src/pages/DiseaseDetectionPage.tsx`
- [x] Delete `artifacts/pashuverse/src/pages/VaccinationsPage.tsx`
- [x] Delete `artifacts/pashuverse/src/pages/SosPage.tsx`

## Step 2: Update App.tsx (Routing)
- [x] Remove imports for DiseaseDetectionPage, VaccinationsPage, SosPage
- [x] Remove Route entries for /disease-detection, /vaccinations, /sos

## Step 3: Update layout.tsx (Sidebar Navigation)
- [x] Remove "Disease Detection" sidebar link
- [x] Remove "Vaccinations" sidebar link
- [x] Remove "Emergency SOS" sidebar link

## Step 4: Update Dashboard.tsx
- [x] Remove SOS-related imports and data usage
- [x] Remove quick-access links to these features
- [x] Remove AI Health Scan / Emergency Intake buttons

## Step 5: Update LandingPage.tsx
- [x] Remove "AI Disease Detection" feature card
- [x] Remove "Emergency SOS" feature card

## Step 6: Update AnimalProfilePage.tsx
- [x] Remove vaccination tab and vaccination-related logic
- [x] Remove `useGetAnimalVaccinations` hook import

## Step 7: Update API Server Routes
- [x] Remove imports and usage in `routes/index.ts`

## Step 8: Delete API Server Route Files
- [x] Delete `routes/disease_predictions.ts`
- [x] Delete `routes/vaccinations.ts`
- [x] Delete `routes/sos.ts`

## Step 9: Update DB Schema Index
- [x] Remove exports in `schema/index.ts`

## Step 10: Delete DB Schema Files
- [x] Delete `schema/disease_predictions.ts`
- [x] Delete `schema/vaccinations.ts`
- [x] Delete `schema/sos.ts`

## Step 11: Clean Up Generated API Client (api.ts)
- [x] Remove disease prediction, vaccination, sos request related functions/hooks

## Step 12: Clean Up Generated Zod API (api.ts)
- [x] Remove disease prediction, vaccination, sos request related zod schemas

## Step 13: Verify no remaining references
- [x] Search for any remaining references to these features

