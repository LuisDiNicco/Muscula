# Musculá — Implementation Progress Tracker

**Last update:** 2026-02-27
**Source of truth:** `docs/05_Implementation_Plan.md`

**Checkpoint:** Cierre de jornada con BE-5 parcialmente completada (sesiones + readiness + tracking e2e), continuidad pendiente para sustituciones y casos de integración restantes.

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
- **Status:** 🟡 In progress
- **Completed in this phase:**
  - Domain entities implemented: `Session`, `WorkingSet`, `WarmupSet`, `ReadinessScore`.
  - Application services implemented: `WarmupGeneratorService`, `AutoregulationService`, `TrainingSessionService`, `ReadinessService`.
  - Infrastructure implemented: `PrismaSessionRepository`, `TrainingController`, BE-5 DTOs, `TrainingModule` wiring in `AppModule`.
  - Unit tests added for tracking entities, warmup generation, and autoregulation branches.
  - Integration tests added for sessions flow: start, active session, list, detail, readiness, complete.
- **Current pending in BE-5:**
  - `ExerciseSubstitutionService` and substitution endpoints/flow.
  - Integration tests pending from plan: weight suggestion with/without history, warmup generation integration, substitution flow, completed-session edge case.

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
