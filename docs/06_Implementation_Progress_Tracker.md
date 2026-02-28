# Musculá — Implementation Progress Tracker

**Last update:** 2026-02-28
**Source of truth:** `docs/05_Implementation_Plan.md`

**Checkpoint:** BE-5 cerrada al 100%. BE-6 backend quedó funcional end-to-end: `bodyMode` durable, Open Food Facts integrado con parseo + validación + cache persistente y storage externo (Supabase) con fallback local.

## Backend Phases

### BE-1 — Base Backend Setup
- **Status:** ✅ Done
- **Validation:** build/lint/tests green on latest run.
- **Notes:** No active deviations detected.

### BE-2 — Authentication and User Management
- **Status:** ✅ Done
- **Validation:** unit + integration auth/user suites present and passing.
- **Notes:** No active deviations detected.

### BE-3 — Exercises and Equipment
- **Status:** ✅ Done
- **Validation:** list/search/filter/create + equipment profile flows covered by tests and green.
- **Resolved deviations:** domain error mapping and DB-level filtering/pagination consistency.

### BE-4 — Mesocycles and Planning
- **Status:** ✅ Done
- **Validation:**
  - unit: domain validations and mesocycle state rules
  - integration: CRUD + activate (archives previous active) + duplicate
  - build/test/e2e green
- **Resolved deviations:** Prisma 7 config migration warning fixed using `prisma.config.ts` + `migrations.seed`.
- **Operational note:** seed command requires running PostgreSQL at `localhost:5432`.

### BE-5 — Training Sessions (Tracking Core)
- **Status:** ✅ Done
- **Completed in this phase:**
  - Domain entities implemented: `Session`, `WorkingSet`, `WarmupSet`, `ReadinessScore`.
  - Application services implemented: `WarmupGeneratorService`, `AutoregulationService`, `TrainingSessionService`, `ReadinessService`.
  - Application service implemented: `ExerciseSubstitutionService`.
  - Infrastructure implemented: `PrismaSessionRepository`, `TrainingController`, BE-5 DTOs, `TrainingModule` wiring in `AppModule`.
  - Training endpoints added for: `weight suggestion`, `warmup generation`, `exercise substitution list`, `exercise substitution execution`.
  - State safeguards added: complete/abandon now reject non-`IN_PROGRESS` sessions.
  - Unit tests added for tracking entities, warmup generation, and autoregulation branches.
  - Unit tests added for substitution service.
  - Integration tests added for sessions flow: start, active session, list, detail, readiness, complete, weight suggestion (with/without history), warmup generation, substitution flow, completed-session edge case.

### BE-6 — Nutrition and Body Composition
- **Status:** ✅ Done
- **Completed in this phase:**
  - Domain enum implemented: `BodyMode`.
  - Domain entities/value object implemented: `Food`, `Meal`, `FoodEntry`, `BodyMetric`, `ProgressPhoto`, `DailyNutrition`.
  - Unit tests added for `DailyNutrition.calculateTotals` (empty and aggregation scenarios).
  - Application interfaces implemented: `INutritionRepository`, `IBodyMetricRepository`, `IProgressPhotoRepository`, `IFoodApiClient`, `IFileStorageService`.
  - Prisma repositories implemented for nutrition, body metrics and progress photos.
  - Application services implemented: `NutritionService`, `TdeeCalculatorService`, `BodyMetricService`, `ProgressPhotoService`.
  - Integración real de `OpenFoodFactsClient` implementada (search/barcode HTTP + parse/validación de macros) con cache persistente en `Food` (`source = API`).
  - Integración real de storage implementada con `SupabaseStorageService` (upload comprimido, signed URLs, delete) y fallback a `LocalFileStorageService` por configuración.
  - Controllers/DTOs implemented: `NutritionController` y `BodyMetricController` con endpoints para daily nutrition, meal slots, food entries, food search/barcode/custom, body mode y weight trend.
  - Persistencia durable de `bodyMode` implementada en DB (`UserPreferences.bodyMode`) con migración Prisma y wiring en `PrismaNutritionRepository` + `NutritionService`.
  - Wiring implemented: `NutritionPersistenceModule` + `NutritionModule` registrado en `AppModule`.
  - Tests added: unit (`tdee-calculator.service.spec.ts`, `nutrition.service.spec.ts`) + integration/e2e (`nutrition.e2e-spec.ts`).
- **Current pending in BE-6:**
  - No pendientes críticos de backend detectados en esta fase.

## Drift / Technical Debt Log

### Active deviations
- None confirmed at this checkpoint.

### Planned technical debt (accepted)
- No accepted debt registered yet for BE-5. New debt must be logged with owner + mitigation.

## Verification Log
- 2026-02-27: `npm run build` ✅
- 2026-02-27: `npm test` ✅
- 2026-02-27: `npm run test:e2e` ✅
- 2026-02-27: `npx prisma db seed` ✅ config load; ❌ runtime DB connection (`localhost:5432`).
- 2026-02-27: `npm test -- session-tracking.entity.spec.ts warmup-generator.service.spec.ts` ✅
- 2026-02-27: `npm test -- autoregulation.service.spec.ts` ✅
- 2026-02-27: `npm run build` ✅ (post BE-5 domain/services)
- 2026-02-27: `npm test` ✅ (10 suites, 49 tests)
- 2026-02-27: `npm run lint` ✅ (post BE-5 training controller/wiring + training e2e).
- 2026-02-27: `npm run build` ✅ (post BE-5 session infra/API).
- 2026-02-27: `npm test` ✅ (10 suites, 49 tests).
- 2026-02-27: `npm run test:e2e` ✅ (5 suites, 20 tests; incluye `training-sessions.e2e-spec.ts`).
- 2026-02-28: `npm run lint` ✅ (post BE-5 completion: substitution + suggestion/warmup/substitute endpoints).
- 2026-02-28: `npm test` ✅ (11 suites, 54 tests).
- 2026-02-28: `npm run build` ✅ (post BE-5 completion).
- 2026-02-28: `npm run test:e2e` ✅ (5 suites, 26 tests).
- 2026-02-28: `npm run lint` ✅ (post inicio BE-6 domain baseline).
- 2026-02-28: `npm test` ✅ (12 suites, 56 tests).
- 2026-02-28: `npm run build` ✅ (post inicio BE-6 domain baseline).
- 2026-02-28: `npm run lint` ✅ (post BE-6 application/infrastructure/controllers/tests).
- 2026-02-28: `npm test -- tdee-calculator.service.spec.ts nutrition.service.spec.ts` ✅.
- 2026-02-28: `npm run test:e2e -- nutrition.e2e-spec.ts` ✅.
- 2026-02-28: `npm test` ✅ (14 suites, 61 tests).
- 2026-02-28: `npm run test:e2e` ✅ (6 suites, 30 tests).
- 2026-02-28: `npm run build` ✅ (post BE-6 slice funcional).
- 2026-02-28: `npx prisma generate` ✅ (post migración `bodyMode` en `UserPreferences`).
- 2026-02-28: `npm run lint` ✅ (post persistencia durable `bodyMode`).
- 2026-02-28: `npm test -- tdee-calculator.service.spec.ts nutrition.service.spec.ts` ✅ (post persistencia `bodyMode`).
- 2026-02-28: `npm run test:e2e -- nutrition.e2e-spec.ts` ✅ (post persistencia `bodyMode`).
- 2026-02-28: `npm test` ✅ (14 suites, 61 tests).
- 2026-02-28: `npm run test:e2e` ✅ (6 suites, 30 tests).
- 2026-02-28: `npm run build` ✅.
- 2026-02-28: `npm run lint` ✅ (post Open Food Facts real + cache persistente).
- 2026-02-28: `npm test -- nutrition.service.spec.ts tdee-calculator.service.spec.ts` ✅.
- 2026-02-28: `npm run test:e2e -- nutrition.e2e-spec.ts` ✅.
- 2026-02-28: `npm run build` ✅ (post integración Open Food Facts).
- 2026-02-28: `npm run lint` ✅ (post integración Supabase storage + provider factory).
- 2026-02-28: `npm test` ✅ (14 suites, 61 tests).
- 2026-02-28: `npm run test:e2e` ✅ (6 suites, 30 tests).
- 2026-02-28: `npm run build` ✅ (post integración storage).
- 2026-02-28: `npm run lint; npm test; npm run test:e2e; npm run build` ✅ (auditoría tech lead final, estado PR-ready).
