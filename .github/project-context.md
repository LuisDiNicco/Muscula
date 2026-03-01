# Project Context — Musculá

> Este archivo define el contexto real del repositorio de **Musculá**, una plataforma integral de entrenamiento de fuerza y composición corporal basada en evidencia científica.

## 1) Project profile

- Name: `Musculá`
- Description: PWA mobile-first con planificación de mesociclos, tracking en vivo con autorregulación algorítmica (RIR/RPE), nutrición con TDEE dinámico, analíticas avanzadas (heatmap muscular, tendencias de fuerza, MRV tracker) y modo offline completo.
- Main stack: `NestJS 11 + TypeScript 5.7 + Prisma 6 (backend), Next.js 14+ + React 19 + TailwindCSS + shadcn/ui (frontend — pendiente), PostgreSQL`
- Architecture style: `Clean/Hexagonal Architecture (Backend) + Feature-based (Frontend)`
- Main language(s): `TypeScript`
- Current state: **Backend casi completo** (BE-1 a BE-8 ✅, BE-9 en progreso). Frontend no iniciado.

## 2) Source-of-truth documents

Rutas reales del proyecto:

- Requirements (SRS): `docs/01_SRS_Software_Requirements_Specification.md`
- Architecture & System Design: `docs/02_Architecture_System_Design.md`
- Domain Knowledge & Algorithms: `docs/03_Additional_Context_Domain_Knowledge.md`
- UX Design & Data Governance: `docs/04_UX_Design_Data_Governance.md`
- Implementation Plan: `docs/05_Implementation_Plan.md`
- Progress Tracker: `docs/06_Implementation_Progress_Tracker.md`
- Development rules (detalle): `.github/development_rules/`
- Copilot instructions: `.github/copilot-instructions.md`

## 3) Mandatory quality commands

Comandos reales del proyecto (ejecutar desde `backend/`):

- Backend build: `cd backend && npm run build`
- Backend test (unit): `cd backend && npm test`
- Backend test (e2e): `cd backend && npm run test:e2e`
- Backend lint: `cd backend && npm run lint`
- Backend format: `cd backend && npm run format`
- Prisma generate: `cd backend && npx prisma generate`
- Prisma migrate: `cd backend && npx prisma migrate dev --name <nombre>`
- Prisma seed: `cd backend && npx prisma db seed`
- Frontend build: `cd frontend && npm run build` *(pendiente — no existe aún)*
- Frontend test: `cd frontend && npm run test` *(pendiente)*
- Frontend lint: `cd frontend && npm run lint` *(pendiente)*
- Frontend e2e: `cd frontend && npx playwright test --reporter=line --timeout=45000` *(pendiente)*

## 4) Scope and constraints

### In-scope modules/features (Backend — implementados o en progreso):

| Módulo | Estado | Fase |
|---|---|---|
| Auth (JWT + refresh tokens) | ✅ Completo | BE-2 |
| User (perfil + preferencias + onboarding) | ✅ Completo | BE-2 / BE-9 |
| Exercises (catálogo + búsqueda + filtros) | ✅ Completo | BE-3 |
| Equipment Profiles | ✅ Completo | BE-3 |
| Mesocycles (planificación + días + ejercicios) | ✅ Completo | BE-4 |
| Training Sessions (tracking en vivo) | ✅ Completo | BE-5 |
| Autoregulation (sugerencia de peso) | ✅ Completo | BE-5 |
| Warmup Generator | ✅ Completo | BE-5 |
| Exercise Substitution | ✅ Completo | BE-5 |
| Readiness Score | ✅ Completo | BE-5 |
| Nutrition (comidas, alimentos, TDEE) | ✅ Completo | BE-6 |
| Body Metrics + Progress Photos | ✅ Completo | BE-6 |
| Analytics (volumen, heatmap, trends, PRs, correlaciones) | ✅ Completo | BE-7 |
| Academy (artículos + referencias) | ✅ Completo | BE-8 |
| Routine Sharing | ✅ Completo | BE-8 |
| Achievements (gamificación) | ✅ Completo | BE-8 |
| Import/Export (Strong, Hevy, CSV) | ✅ Completo | BE-8 |
| Onboarding endpoint | ✅ Completo | BE-9 |
| Push Notifications | 🟡 Pendiente | BE-9 |
| Cron Jobs (recordatorios) | 🟡 Pendiente | BE-9 |
| Swagger final review | 🟡 Pendiente | BE-9 |

### In-scope modules/features (Frontend — pendiente):

- FE-1 a FE-9 según `docs/05_Implementation_Plan.md`
- PWA con Service Worker (Workbox) + offline support
- Internacionalización (ES/EN)
- Tema oscuro/claro
- shadcn/ui + TailwindCSS + Recharts

### Out-of-scope:

- Funcionalidad de coach/entrenador personal (STK-03 — futuro v2)
- Macrociclos explícitos (futuro v2)
- Trading/pagos/monetización
- App nativa (es PWA)
- Features no definidas en la documentación funcional/técnica

### Security/compliance constraints:

- No hardcodear secretos, tokens o PII en ningún archivo del repositorio
- Validación estricta de inputs con class-validator (whitelist + forbidNonWhitelisted)
- Tipado estricto: `any` prohibido
- JWT con refresh token rotation
- Row-level security: cada query filtra por userId del token
- Contraseñas hasheadas con bcrypt (cost ≥ 12)
- PII nunca en logs
- Helmet + CORS restrictivo + Rate limiting

### Performance constraints:

- Paginación obligatoria para colecciones
- Cache in-memory con TTL para analytics (5 min)
- Queries pesadas con `$queryRaw` para aggregaciones SQL directas
- Sin N+1 queries
- Frontend: LCP < 2.5s, code splitting por ruta, lazy load

### Infrastructure constraints:

- Costo operativo: **$0** (solo free tiers)
- Frontend: Vercel
- Backend: Render / Koyeb
- DB: Supabase PostgreSQL / Neon.tech
- Storage: Supabase Storage (con fallback a filesystem local)
- Sin Redis (cache in-memory del proceso NestJS)
- Sin message broker (comunicación directa entre servicios)

## 5) Delivery policy

- Commit strategy: `Conventional Commits` (inglés)
- Push policy: `AT_END_OF_PHASE`
- Branch strategy: `main` (single developer). Tags por fase: `phase-BE-X`, `phase-FE-X`
- Notes:
	- En fases largas, commits parciales cada ~500 líneas modificadas para trazabilidad.
	- Si commit/push no es posible por permisos/política del entorno, informar bloqueo y proponer comandos exactos.

## 6) Key technical decisions (ADRs)

| ADR | Decisión | Justificación |
|---|---|---|
| ADR-001 | PWA en lugar de app nativa | Un solo codebase, $0 App Store, installable en móvil |
| ADR-002 | Prisma 6 en lugar de TypeORM | Mejor DX, type-safety, migraciones declarativas. Mapeo explícito Prisma→Domain |
| ADR-003 | JWT custom en lugar de auth provider | Sin dependencia externa, control total del flujo |
| ADR-004 | In-memory cache en lugar de Redis | Sin costo externo. Interfaz abstracta permite migrar a Redis |
| ADR-005 | Supabase Storage para archivos | 1GB free tier, S3-compatible, URLs firmadas |
| ADR-006 | NestJS 11 + Jest 30 | Última versión estable con DI nativo y testing maduro |

## 7) Domain glossary (resumen)

| Término | Definición |
|---|---|
| Mesociclo | Bloque de entrenamiento de 3-16 semanas con objetivo específico |
| Serie efectiva | Serie con RIR 0-4 con carga significativa |
| RIR | Repetitions in Reserve (0-5+) |
| RPE | Rate of Perceived Exertion (10 − RIR) |
| 1RM | One Rep Max — estimado con promedio Epley + Brzycki |
| MEV/MRV | Minimum Effective Volume / Maximum Recoverable Volume (series/semana) |
| TDEE | Total Daily Energy Expenditure — dinámico tras 14 días de datos reales |
| Readiness Score | Puntuación pre-entrenamiento ponderada (sueño 40%, estrés 30%, DOMS 30%) |
| Patrón de movimiento | Clasificación biomecánica: empuje H/V, tirón H/V, sentadilla, bisagra, aislamiento |
| Deload | Semana de reducción planificada del volumen (~50%) para facilitar recuperación |
| Tonelaje | Volumen total en kg: Σ(peso × repeticiones) por ejercicio o sesión |
