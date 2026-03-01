# Musculá — Implementation Progress Tracker

**Last update:** 2026-02-28  
**Source of truth:** `docs/05_Implementation_Plan.md`  
**Project context:** `.github/project-context.md`

---

## Summary Dashboard

| Component | Progress | Phases | Tests | Notes |
|---|---|---|---|---|
| **Backend** | 🟢 ~95% | BE-1 to BE-8 ✅, BE-9 🟡 | 20 suites, 88 unit + 10 suites, 52 e2e | Push notifications + cron jobs pending |
| **Frontend** | 🔴 0% | Not started | — | 9 phases planned (FE-1 to FE-9) |
| **Documentation** | 🟢 Updated | — | — | Aligned with `.github/` structure |

### Key Metrics (Backend)

| Metric | Value |
|---|---|
| Domain entities | 17 |
| Application services | 20 |
| Application interfaces | 19 |
| Controllers | 14 |
| Prisma models | 22 |
| Domain enums | 18 |
| Domain errors | 5 |
| Unit test suites | 20 (88 tests) |
| E2E test suites | 10 (52 tests) |
| Architecture tests | 1 suite (layer boundaries) |

---

## Backend Phases

### BE-1 — Base Backend Setup ✅
- NestJS 11 project with Clean Architecture folder structure
- Config module (`@nestjs/config` with `registerAs`), Prisma 6 with PostgreSQL
- Global ValidationPipe, Exception Filter, Logging Interceptor
- Helmet, CORS, Rate limiting (`@nestjs/throttler`)
- Health check (`@nestjs/terminus`), Swagger at `/api/docs`
- Domain errors: `EntityNotFound`, `Conflict`, `Validation`, `Authentication`, `Authorization`
- 18 domain enums defined

### BE-2 — Authentication and User Management ✅
- JWT auth (access 15min + refresh 7d with rotation)
- Register, Login, Refresh, Logout, Forgot/Reset Password
- User profile CRUD, preferences management
- bcrypt password hashing, JWT guards, `@Public()` decorator
- Unit + integration tests passing

### BE-3 — Exercises and Equipment ✅
- Exercise catalog: search, filter by muscle/pattern/equipment/difficulty
- Equipment profiles CRUD with active profile selection
- Custom exercise creation
- Seed with exercises + preset equipment profiles + volume landmarks
- Domain error mapping and DB-level filtering/pagination

### BE-4 — Mesocycles and Planning ✅
- Full CRUD: create (with nested days+exercises), update, delete, duplicate
- State machine: DRAFT → ACTIVE → COMPLETED. Only one active at a time.
- Prisma 6 config with `prisma.config.ts` + seed configuration

### BE-5 — Training Sessions (Tracking Core) ✅
- Session lifecycle: start → track → complete/abandon
- Weight suggestion algorithm (autoregulation based on RIR history)
- Warmup generator (escalation algorithm based on working weight)
- Exercise substitution (same pattern + same primary muscle + user equipment)
- Readiness Score (sleep 40%, stress 30%, DOMS 30%)
- State safeguards: reject operations on non-IN_PROGRESS sessions

### BE-6 — Nutrition and Body Composition ✅
- Daily nutrition with meal slots and food entries
- Open Food Facts integration (search + barcode) with persistent cache
- Custom food creation, body mode (bulking/cutting/maintenance/recomp)
- TDEE calculator: static (Mifflin-St Jeor) + dynamic (14-day EMA)
- Body metrics tracking, weight trend with 7-day moving average
- Progress photos: Supabase Storage (compressed upload, signed URLs) + local fallback
- Prisma migration for `bodyMode` in UserPreferences

### BE-7 — Analytics and Dashboard ✅
- Weekly volume tracker per muscle group (effective sets count)
- Muscle heatmap (recovery status by muscle group)
- Strength trends (1RM estimated via Epley + Brzycki average)
- Tonnage trends per exercise
- Personal records (best 1RM, best set, best volume)
- Correlations (body weight vs. strength, volume vs. readiness)
- Deload check algorithm (volume MRV + readiness + 1RM trend)
- In-memory cache with 5-min TTL for heavy queries
- Optimized SQL via `$queryRaw` for aggregations

### BE-8 — Import/Export, Sharing, Achievements and Academy ✅
- **Academy**: articles with categories, references, pagination. 6-article seed.
- **Routine Sharing**: generate share code (MUSC-XXXXXX, 30d expiry), preview (public), import.
- **Achievements**: 10+ achievement definitions, event-driven evaluation (SESSION_COMPLETED, MESOCYCLE_COMPLETED, NUTRITION_LOGGED, WEIGHT_LOGGED, PROGRESS_PHOTO_UPLOADED).
- **Import/Export**: ZIP export with CSVs (sessions, nutrition, body-metrics). Import from Strong/Hevy with fuzzy exercise matching and preview/confirm flow.

### BE-9 — Onboarding, Notifications and Final Hardening 🟡
**Completed:**
- `POST /users/me/onboarding` endpoint with onboarding wizard data
- User profile + preferences + equipment profile creation in one operation
- Unit + e2e tests for onboarding flow

**Pending:**
- [ ] Push notifications: `POST /notifications/subscribe`, `NotificationService` with Web Push/VAPID
- [ ] Cron jobs (`@nestjs/schedule`): daily weight reminder, daily deload evaluation
- [ ] Edge cases: active session handling when starting new session
- [ ] Final Swagger audit: verify all endpoints have @ApiTags, @ApiOperation, @ApiResponse
- [ ] Final coverage audit: ensure >80% in domain/ and application/

---

## Frontend Phases

| Phase | Description | Status | Dependencies |
|---|---|---|---|
| FE-1 | Scaffolding: Next.js, TailwindCSS, shadcn/ui, PWA, i18n, theme | 🔴 Not started | None |
| FE-2 | Auth: login, register, forgot password, onboarding wizard | 🔴 Not started | BE-1 + BE-2 |
| FE-3 | Exercises: catalog, search/filter, detail, equipment profiles | 🔴 Not started | BE-3 |
| FE-4 | Mesocycles: CRUD, day editor, exercise search, drag & drop | 🔴 Not started | BE-4 |
| FE-5 | **Live Tracking** (core): session UI, sets, timer, warmup, substitution, calculator | 🔴 Not started | BE-5 |
| FE-6 | Nutrition: daily meals, food search, macros, body metrics, progress photos | 🔴 Not started | BE-6 |
| FE-7 | Analytics: volume dashboard, heatmap SVG, strength charts, PRs, correlations | 🔴 Not started | BE-7 |
| FE-8 | Academy, import/export, sharing, achievements, settings | 🔴 Not started | BE-8 + BE-9 |
| FE-9 | PWA polish: offline, push notifications, empty states, accessibility, performance | 🔴 Not started | All backend |

---

## Drift / Technical Debt Log

### Active deviations
- None confirmed at this checkpoint.

### Planned / accepted technical debt

| ID | Description | Impact | Owner | Mitigation |
|---|---|---|---|---|
| TD-001 | In-memory cache (not Redis) | Single-instance only | — | Interface abstraction allows Redis swap |
| TD-002 | Password reset logs token (no email) | Cannot reset in production | — | Integrate email service (TD-004 in backlog) |
| TD-003 | Rate limiting by IP only | Shared NAT users share limits | — | TD-002 in backlog: per-user rate limiting |
| TD-004 | Seed has base exercises, not 150+ | Incomplete catalog for launch | — | TD-009 in backlog: complete exercise seed with media |

### Documentation corrections applied (2026-02-28)
- `project-context.md`: Updated from NotiFinance template to Musculá-specific context
- `copilot-instructions.md`: Updated header and section 0 to reference Musculá
- `.github/README.md`: Customized for Musculá with project state dashboard
- `02_Architecture_System_Design.md`: Corrected NestJS version from 10+ to 11
- `05_Implementation_Plan.md`: Updated to v1.1 with backlog section (10 new features + 10 tech improvements)

---

## Verification Log (Condensed)

### Phase completion gates

| Phase | Date | Build | Lint | Unit Tests | E2E Tests | Notes |
|---|---|---|---|---|---|---|
| BE-1 | 2026-02-27 | ✅ | ✅ | ✅ | ✅ (health) | Base setup green |
| BE-2 | 2026-02-27 | ✅ | ✅ | ✅ | ✅ | Auth + user complete |
| BE-3 | 2026-02-27 | ✅ | ✅ | ✅ | ✅ | Exercises + equipment |
| BE-4 | 2026-02-27 | ✅ | ✅ | ✅ | ✅ | Mesocycles + planning |
| BE-5 | 2026-02-28 | ✅ | ✅ | 11 suites, 54 tests | 5 suites, 26 tests | Training core + substitution |
| BE-6 | 2026-02-28 | ✅ | ✅ | 14 suites, 61 tests | 6 suites, 30 tests | Nutrition + body + OpenFoodFacts + storage |
| BE-7 | 2026-02-28 | ✅ | ✅ | — | — | Analytics full (volume + heatmap + trends + PRs + correlations) |
| BE-8 | 2026-02-28 | ✅ | ✅ | 20 suites, 86 tests | 10 suites, 51 tests | Academy + sharing + achievements + import/export |
| BE-9 | 2026-02-28 | ✅ | ✅ | 20 suites, 88 tests | 10 suites, 52 tests | Onboarding slice only |

### Latest full gate (BE-9 partial)
```
npm run build ✅
npm run lint  ✅
npm test      ✅ (20 suites, 88 tests)
npm run test:e2e ✅ (10 suites, 52 tests)
```
