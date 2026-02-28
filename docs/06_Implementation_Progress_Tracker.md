# Musculá — Implementation Progress Tracker

**Last update:** 2026-02-28
**Source of truth:** `docs/05_Implementation_Plan.md`

**Checkpoint:** BE-7 backend funcional cerrada. BE-8 backend en progreso con slices funcionales de Academia + Routine Sharing + Achievements + Import/Export (API + evaluación por eventos + tests).

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

### BE-7 — Analytics and Dashboard
- **Status:** ✅ Done
- **Completed in this phase (initial slice):**
  - Application interface implemented: `IAnalyticsRepository`.
  - Application services implemented: `VolumeTrackerService` (volumen semanal + historial con cache in-memory TTL 5 minutos) y `AnalyticsService.checkDeload` (volumen MRV, readiness y tendencia de 1RM semanal).
  - Infrastructure implemented: `AnalyticsController`, DTOs de analytics, `AnalyticsPersistenceModule`, `AnalyticsModule` y wiring en `AppModule`.
  - Prisma implementation extended: `PrismaSessionRepository` ahora expone queries optimizadas (`$queryRaw`) para volumen efectivo por grupo muscular, landmarks por usuario, readiness promedio y 1RM semanal por grupo muscular.
  - Tests added: unit (`volume-tracker.service.spec.ts`, `analytics.service.spec.ts`) + integration/e2e (`analytics.e2e-spec.ts`).
- **Completed in this phase (extended slice):**
  - `AnalyticsService` extendido con: `getMuscleHeatmap`, `getStrengthTrend`, `getTonnageTrend`, `getPersonalRecords`, `getCorrelations` (incluye cache TTL para heatmap y resolución de periodos `30d/90d/180d/1y/all`).
  - `AnalyticsController` extendido con endpoints: `GET /analytics/heatmap`, `GET /analytics/strength`, `GET /analytics/tonnage`, `GET /analytics/prs`, `GET /analytics/correlations`.
  - DTOs de query/response agregados para periodos, correlaciones, trends, heatmap y PRs.
  - `PrismaSessionRepository` extendido con queries pesadas para trends/PRs/correlaciones y snapshot de heatmap.
  - Tests fortalecidos: unit con más escenarios y e2e con validación de query params obligatorios y endpoints nuevos.
- **Current pending in BE-7:**
  - No pendientes críticos de backend detectados en esta fase.

### BE-8 — Import/Export, Sharing, Achievements and Academy
- **Status:** 🟡 In progress
- **Completed in this phase (current slice):**
  - Application interfaces implemented: `IArticleRepository`, `IRoutineSharingRepository`.
  - Application services implemented: `ArticleService`, `RoutineSharingService`.
  - Infrastructure repositories implemented: `PrismaArticleRepository`, `PrismaRoutineSharingRepository`.
  - API layer implemented: `AcademyController` y `RoutineSharingController` con endpoints:
    - `GET /academy/articles`
    - `GET /academy/articles/:id`
    - `POST /sharing/mesocycles/:mesocycleId`
    - `GET /sharing/:code` (public)
    - `POST /sharing/:code/import`
  - DTOs de request/response añadidos para academia y sharing, con validación de paginación.
  - Seed ampliado con 6 artículos base de academia + referencias bibliográficas mínimas.
  - Wiring completado: `AcademySharingPersistenceModule` + `AcademySharingModule` registrado en `AppModule`.
  - Tests added:
    - unit: `article.service.spec.ts`, `routine-sharing.service.spec.ts`
    - integration/e2e: `academy-sharing.e2e-spec.ts`
  - Corrección de consistencia de dominio aplicada: enum `ArticleCategory` alineado con `schema.prisma` y documentación (`FUNDAMENTALS`, `TRAINING`, `NUTRITION`, `RECOVERY`, `PERIODIZATION`).
  - Sistema de logros implementado:
    - Application interface + Prisma repository: `IAchievementRepository`, `PrismaAchievementRepository`.
    - Application service: `AchievementService` con `getAchievements` y `evaluateAchievements(event)`.
    - API: `GET /achievements`.
    - Integración de eventos: evaluación automática tras `SESSION_COMPLETED`, `MESOCYCLE_COMPLETED`, `NUTRITION_LOGGED`, `WEIGHT_LOGGED`, `PROGRESS_PHOTO_UPLOADED`.
    - Wiring completado: `AchievementPersistenceModule` + `AchievementModule` (con export de servicio para consumo cross-module).
  - Tests añadidos para logros:
    - unit: `achievement.service.spec.ts`
    - integration/e2e: `achievements.e2e-spec.ts`
  - Import/Export implementado:
    - Application interface + Prisma repository: `IImportExportRepository`, `PrismaImportExportRepository`.
    - Application service: `ImportExportService` con `exportData`, `previewImport`, `confirmImport`.
    - API de datos: `POST /data/export`, `POST /data/import/preview`, `POST /data/import/confirm`.
    - Exportación real ZIP con CSVs (`sessions.csv`, `nutrition.csv`, `body-metrics.csv`) y URL temporal por storage.
    - Import preview/confirm para fuentes `STRONG` y `HEVY`, con mapeo difuso de ejercicios y creación opcional de ejercicios custom.
  - Tests añadidos para import/export:
    - unit: `import-export.service.spec.ts`
    - integration/e2e: `import-export.e2e-spec.ts`
- **Current pending in BE-8:**
  - Completar sub-bloques restantes de la fase: trigger automático de `FIRST_PR` desde evento real de PR y endurecimiento de fuzzy matching SQL (`pg_trgm`) para imports masivos.

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
- 2026-02-28: `npm run lint; npm test; npm run test:e2e; npm run build` ✅ (inicio BE-7 analytics slice: volume tracker + deload check + endpoints + tests).
- 2026-02-28: `npm run lint; npm test; npm run test:e2e; npm run build` ✅ (BE-7 extended slice: heatmap + strength + tonnage + PRs + correlations + tests robustos).
- 2026-02-28: `npm run test -- test/unit/services/article.service.spec.ts test/unit/services/routine-sharing.service.spec.ts` ✅.
- 2026-02-28: `npm run test:e2e -- test/integration/academy-sharing.e2e-spec.ts` ✅.
- 2026-02-28: `npm run lint` ✅ (post slice BE-8 academy + sharing + seed + tests).
- 2026-02-28: `npm run test` ✅ (18 suites, 78 tests).
- 2026-02-28: `npm run test:e2e` ✅ (8 suites, 46 tests).
- 2026-02-28: `npm run build` ✅.
- 2026-02-28: `npm run test -- test/unit/services/achievement.service.spec.ts test/unit/services/nutrition.service.spec.ts` ✅.
- 2026-02-28: `npm run test:e2e -- test/integration/achievements.e2e-spec.ts` ✅.
- 2026-02-28: `npm run lint` ✅ (post slice BE-8 achievements + event integration).
- 2026-02-28: `npm run test` ✅ (19 suites, 83 tests).
- 2026-02-28: `npm run test:e2e` ✅ (9 suites, 48 tests).
- 2026-02-28: `npm run build` ✅.
- 2026-02-28: `npm run test -- test/unit/services/import-export.service.spec.ts` ✅.
- 2026-02-28: `npm run test:e2e -- test/integration/import-export.e2e-spec.ts` ✅.
- 2026-02-28: `npm run lint` ✅ (post slice BE-8 import/export).
- 2026-02-28: `npm run test` ✅ (20 suites, 86 tests).
- 2026-02-28: `npm run test:e2e` ✅ (10 suites, 51 tests).
- 2026-02-28: `npm run build` ✅.
