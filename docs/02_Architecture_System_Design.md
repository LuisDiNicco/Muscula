# Arquitectura del Sistema — Musculá v1.0

**Versión:** 1.0  
**Fecha:** 2026-02-27  
**Estado:** Aprobado para implementación  
**Patrón arquitectónico:** Clean/Hexagonal Architecture (Backend) + Feature-based (Frontend)  

---

## Tabla de Contenidos

1. [Visión Sistémica](#1-visión-sistémica)
2. [Decisiones Arquitectónicas (ADRs)](#2-decisiones-arquitectónicas-adrs)
3. [Diagrama C4 — Nivel 1: Contexto del Sistema](#3-diagrama-c4--nivel-1-contexto-del-sistema)
4. [Diagrama C4 — Nivel 2: Contenedores](#4-diagrama-c4--nivel-2-contenedores)
5. [Diagrama C4 — Nivel 3: Componentes](#5-diagrama-c4--nivel-3-componentes)
6. [Comunicación entre Componentes](#6-comunicación-entre-componentes)
7. [Modelo de Datos de Alto Nivel](#7-modelo-de-datos-de-alto-nivel)
8. [Estrategia de Sync Offline](#8-estrategia-de-sync-offline)

---

## 1. Visión Sistémica

### 1.1 Stack Tecnológico

| Capa | Tecnología | Justificación | Hosting (Free Tier) |
|---|---|---|---|
| **Frontend** | Next.js 14+ (App Router), TypeScript, TailwindCSS, shadcn/ui, Recharts, Workbox (PWA) | SSR/SSG para SEO, App Router para layouts, shadcn/ui para componentes accesibles, Recharts para gráficos, Workbox para Service Worker robusto | Vercel |
| **Backend** | NestJS 10+, TypeScript, Prisma ORM | Framework enterprise con DI nativo, decorators, módulos. Prisma para type-safe queries y migraciones | Render / Koyeb |
| **Base de datos** | PostgreSQL 15+ | Relacional, ACID, JSON support, full-text search, extensiones (pg_trgm para fuzzy match) | Supabase / Neon.tech |
| **Cache** | In-memory (NestJS CacheModule) | Para free tier no se usa Redis externo. Cache en memoria del proceso con TTL | Incluido en backend |
| **Almacenamiento** | Supabase Storage / Filesystem local | Para fotos de progreso y media de ejercicios. Supabase Storage tiene free tier generoso | Supabase |
| **Autenticación** | JWT custom (access + refresh) | Control total sobre el flujo, sin dependencia de auth providers de terceros | Backend |

### 1.2 Principios Arquitectónicos

1. **Clean/Hexagonal Architecture**: El dominio del negocio es independiente de frameworks, bases de datos y UI. Las dependencias apuntan hacia adentro.
2. **Dependency Inversion**: Las capas internas definen interfaces. Las capas externas las implementan.
3. **Feature-based Organization (Frontend)**: Cada módulo funcional (training, nutrition, analytics) tiene su propia carpeta con componentes, hooks, types y tests colocados.
4. **API-first Design**: El backend expone una API REST documentada con Swagger. El frontend consume esta API. No hay acoplamiento directo.
5. **Offline-first**: La PWA debe funcionar sin conexión. El Service Worker cachea assets estáticos y datos críticos en IndexedDB.
6. **No external paid services**: Todo el stack opera dentro de free tiers.

---

## 2. Decisiones Arquitectónicas (ADRs)

### ADR-001: PWA en lugar de App Nativa

**Contexto**: Se necesita funcionalidad móvil (offline, push notifications) con costo $0.  
**Decisión**: Progressive Web App con Next.js + Workbox.  
**Consecuencias**: (+) Un solo codebase. (+) Installable en móvil. (+) Sin costos de App Store. (-) Limitaciones de acceso a hardware comparado con nativo (mitigado con Web APIs modernas). (-) Push notifications en iOS requieren Safari 16.4+ (soporte ya maduro en 2026).

### ADR-002: Prisma en lugar de TypeORM

**Contexto**: Las reglas de desarrollo mencionan TypeORM, pero Prisma ofrece mejor DX, type-safety y migraciones declarativas.  
**Decisión**: Usar Prisma como ORM. Adaptar las reglas de Clean Architecture: las entidades de Prisma (`@prisma/client`) viven en infrastructure. Se mapean a domain entities en los repositorios.  
**Consecuencias**: (+) Schema declarativo. (+) Migraciones automáticas. (+) Queries 100% type-safe. (-) Requiere mapeo explícito Prisma → Domain (alineado con Clean Architecture). Las convenciones de `BaseEntity` se implementan en el schema de Prisma con campos `createdAt`, `updatedAt`, `deletedAt`.

### ADR-003: JWT Custom en lugar de Auth Provider

**Contexto**: Se necesita autenticación sin costos adicionales y con control total.  
**Decisión**: Implementación propia de JWT (access + refresh token) siguiendo las mejores prácticas de seguridad.  
**Consecuencias**: (+) Sin dependencia externa. (+) Control total del flujo. (-) Mayor responsabilidad en la implementación de seguridad (mitigado con reglas estrictas de development_rules).

### ADR-004: In-Memory Cache en lugar de Redis

**Contexto**: Redis requiere un servicio externo que puede no tener free tier suficiente.  
**Decisión**: Cache en memoria del proceso NestJS con `@nestjs/cache-manager` y TTL definidos. Se diseña con interfaz abstracta para migrar a Redis si escala.  
**Consecuencias**: (+) Sin costo ni dependencia externa. (-) Cache per-instance (aceptable para single instance en free tier). La interfaz `ICacheService` en application permite swap transparente a Redis.

### ADR-005: Supabase Storage para archivos

**Contexto**: Se necesitan almacenar fotos de progreso y media de ejercicios.  
**Decisión**: Supabase Storage (S3-compatible) con URLs firmadas para acceso privado.  
**Consecuencias**: (+) 1GB free tier. (+) APIs REST simples. (+) URLs firmadas para privacidad. (-) Dependencia de Supabase (mitigado con interfaz abstracta `IFileStorageService`).

---

## 3. Diagrama C4 — Nivel 1: Contexto del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTEXTO DEL SISTEMA                         │
│                                                                 │
│   ┌──────────┐         ┌──────────────────────┐                 │
│   │ Usuario  │────────▶│     Musculá PWA      │                 │
│   │ (Persona)│◀────────│  (Sistema Software)   │                 │
│   └──────────┘         └──────────┬───────────┘                 │
│                                   │                             │
│                    ┌──────────────┼──────────────┐              │
│                    ▼              ▼              ▼              │
│            ┌──────────┐  ┌──────────────┐ ┌──────────────┐     │
│            │Open Food │  │  ExerciseDB  │ │  Europe PMC  │     │
│            │ Facts API│  │   / wger     │ │  (Papers)    │     │
│            └──────────┘  └──────────────┘ └──────────────┘     │
│                                                                 │
│                          ┌──────────────┐                       │
│                          │  Google Fit  │                       │
│                          │  REST API    │                       │
│                          └──────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### Descripción de actores y sistemas externos

| Elemento | Tipo | Descripción |
|---|---|---|
| **Usuario** | Persona | Deportista que planifica, ejecuta y analiza sus entrenamientos y nutrición. Interactúa con el sistema vía navegador móvil o desktop (PWA instalada). |
| **Musculá PWA** | Sistema Software | Plataforma integral de entrenamiento y composición corporal. Frontend PWA + Backend API + Base de datos. |
| **Open Food Facts API** | Sistema Externo | Base de datos abierta de alimentos. Provee información nutricional por nombre o código de barras. |
| **ExerciseDB / wger** | Sistema Externo | APIs de ejercicios con GIFs, músculos trabajados y metadata. Se usan para seed inicial y enriquecimiento. |
| **Europe PMC** | Sistema Externo | API de acceso a papers científicos. Provee metadatos (título, autores, abstract) vía DOI para la sección "Ver Fuentes". |
| **Google Fit REST API** | Sistema Externo | API de salud de Google. Provee pasos diarios y calorías activas estimadas vía OAuth2. Integración opcional. |

### Flujos de comunicación de alto nivel

| Origen | Destino | Protocolo | Descripción |
|---|---|---|---|
| Usuario → Musculá PWA | HTTPS | Todas las interacciones del usuario: tracking, nutrición, wiki, analíticas |
| Musculá Backend → Open Food Facts | HTTPS REST | Búsqueda de alimentos por nombre o código de barras |
| Musculá Backend → ExerciseDB/wger | HTTPS REST | Enriquecimiento de datos de ejercicios (seed y actualizaciones) |
| Musculá Backend → Europe PMC | HTTPS REST | Resolución de DOIs para mostrar referencias bibliográficas |
| Musculá Backend → Google Fit | HTTPS REST (OAuth2) | Lectura de pasos diarios y calorías (usuario debe autorizar) |

---

## 4. Diagrama C4 — Nivel 2: Contenedores

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         MUSCULÁ - CONTENEDORES                           │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────┐             │
│  │                    FRONTEND (PWA)                        │             │
│  │  Next.js 14+ · TailwindCSS · shadcn/ui · Recharts       │             │
│  │  Service Worker (Workbox) · IndexedDB                    │             │
│  │  ─────────────────────────────────────────────           │             │
│  │  Responsabilidad: UI, interacciones, cache offline,      │             │
│  │  sync con backend, gráficos, notificaciones push         │             │
│  │  Hosting: Vercel (free tier)                             │             │
│  └────────────────────────┬────────────────────────────────┘             │
│                           │ HTTPS / REST (JSON)                          │
│                           ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐             │
│  │                    BACKEND (API)                          │             │
│  │  NestJS 10+ · TypeScript · Prisma · JWT                  │             │
│  │  ─────────────────────────────────────────────           │             │
│  │  Responsabilidad: Lógica de negocio, autorregulación,    │             │
│  │  TDEE dinámico, auth, validación, API REST, Swagger      │             │
│  │  Hosting: Render / Koyeb (free tier)                     │             │
│  └───────┬──────────────┬──────────────┬───────────────────┘             │
│          │              │              │                                  │
│          ▼              ▼              ▼                                  │
│  ┌──────────────┐ ┌──────────┐ ┌──────────────┐                         │
│  │  PostgreSQL  │ │ Supabase │ │   APIs       │                         │
│  │  (Database)  │ │ Storage  │ │  Externas    │                         │
│  │  Supabase/   │ │ (Files)  │ │  (Food,      │                         │
│  │  Neon.tech   │ │          │ │   Exercise,  │                         │
│  │              │ │          │ │   PMC, GFit) │                         │
│  └──────────────┘ └──────────┘ └──────────────┘                         │
└──────────────────────────────────────────────────────────────────────────┘
```

### Descripción de Contenedores

| Contenedor | Tecnología | Responsabilidad | Puerto/Protocolo |
|---|---|---|---|
| **Frontend PWA** | Next.js, TailwindCSS, shadcn/ui, Recharts, Workbox | Renderizado de UI, interacción del usuario, cache offline con Service Worker + IndexedDB, gráficos de analíticas, notificaciones push | HTTPS (443) |
| **Backend API** | NestJS, TypeScript, Prisma, JWT, class-validator | Toda la lógica de negocio: CRUD de mesociclos/sesiones/nutrición, algoritmos (autorregulación, TDEE dinámico, calentamiento), autenticación/autorización, validación, documentación Swagger | HTTPS (443), REST JSON |
| **PostgreSQL** | PostgreSQL 15+ (Supabase/Neon) | Persistencia de todos los datos del dominio: usuarios, mesociclos, sesiones, ejercicios, nutrición, medidas, configuraciones | TCP (5432), conexión directa desde backend |
| **Supabase Storage** | S3-compatible object storage | Almacenamiento de archivos binarios: fotos de progreso, media de ejercicios (GIFs/videos) | HTTPS REST, URLs firmadas |
| **APIs Externas** | Open Food Facts, ExerciseDB, wger, Europe PMC, Google Fit | Proveen datos externos: alimentos, ejercicios, papers científicos, datos de salud | HTTPS REST |

---

## 5. Diagrama C4 — Nivel 3: Componentes

### 5.1 Backend — Componentes Internos

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     BACKEND API (NestJS) - COMPONENTES                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────┐                         │
│  │                  DOMAIN LAYER                    │                         │
│  │  (Sin dependencias externas)                     │                         │
│  │  ┌──────────────┐ ┌───────────┐ ┌────────────┐  │                         │
│  │  │   Entities   │ │   Enums   │ │   Errors   │  │                         │
│  │  │  ──────────  │ │ ────────  │ │ ─────────  │  │                         │
│  │  │  User        │ │ MuscleGr  │ │ NotFound   │  │                         │
│  │  │  Mesocycle   │ │ Movement  │ │ Conflict   │  │                         │
│  │  │  TrainingDay │ │ Equipment │ │ Validation │  │                         │
│  │  │  Session     │ │ BodyMode  │ │ Auth       │  │                         │
│  │  │  Set         │ │ RIR       │ │            │  │                         │
│  │  │  Exercise    │ │ UnitSys   │ │            │  │                         │
│  │  │  FoodEntry   │ │           │ │            │  │                         │
│  │  │  BodyMetric  │ │           │ │            │  │                         │
│  │  │  Article     │ │           │ │            │  │                         │
│  │  └──────────────┘ └───────────┘ └────────────┘  │                         │
│  └─────────────────────────────────────────────────┘                         │
│                             ▲                                                │
│                             │ depends on                                     │
│  ┌─────────────────────────────────────────────────┐                         │
│  │               APPLICATION LAYER                  │                         │
│  │  (Orquestación, Puertos/Interfaces)              │                         │
│  │                                                   │                         │
│  │  ┌─ Interfaces (Ports) ────────────────────────┐ │                         │
│  │  │  IUserRepository                             │ │                         │
│  │  │  IMesocycleRepository                        │ │                         │
│  │  │  ISessionRepository                          │ │                         │
│  │  │  IExerciseRepository                         │ │                         │
│  │  │  IFoodRepository                             │ │                         │
│  │  │  IBodyMetricRepository                       │ │                         │
│  │  │  IArticleRepository                          │ │                         │
│  │  │  IAchievementRepository                      │ │                         │
│  │  │  IFileStorageService                         │ │                         │
│  │  │  ICacheService                               │ │                         │
│  │  │  IFoodApiClient                              │ │                         │
│  │  │  IExerciseApiClient                          │ │                         │
│  │  │  IHealthApiClient                            │ │                         │
│  │  │  IPaperApiClient                             │ │                         │
│  │  └──────────────────────────────────────────────┘ │                         │
│  │                                                   │                         │
│  │  ┌─ Services (Use Cases) ──────────────────────┐ │                         │
│  │  │  AuthService                                 │ │                         │
│  │  │  UserService                                 │ │                         │
│  │  │  MesocycleService                            │ │                         │
│  │  │  TrainingSessionService                      │ │                         │
│  │  │  ExerciseService                             │ │                         │
│  │  │  WarmupGeneratorService                      │ │                         │
│  │  │  ExerciseSubstitutionService                 │ │                         │
│  │  │  AutoregulationService                       │ │                         │
│  │  │  NutritionService                            │ │                         │
│  │  │  TdeeCalculatorService                       │ │                         │
│  │  │  BodyMetricService                           │ │                         │
│  │  │  ProgressPhotoService                        │ │                         │
│  │  │  AnalyticsService                            │ │                         │
│  │  │  VolumeTrackerService                        │ │                         │
│  │  │  ImportExportService                         │ │                         │
│  │  │  RoutineSharingService                       │ │                         │
│  │  │  AchievementService                          │ │                         │
│  │  │  ArticleService                              │ │                         │
│  │  │  ReadinessService                            │ │                         │
│  │  └──────────────────────────────────────────────┘ │                         │
│  └─────────────────────────────────────────────────┘                         │
│                             ▲                                                │
│                             │ depends on (implements interfaces)              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                      INFRASTRUCTURE LAYER                               │ │
│  │                                                                         │ │
│  │  ┌─ Primary Adapters (Input) ──────────────────────────────────────┐   │ │
│  │  │  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────┐  │   │ │
│  │  │  │ AuthController   │ │ TrainingController│ │ NutritionCtrl  │  │   │ │
│  │  │  │ POST /auth/login │ │ POST /sessions    │ │ POST /meals    │  │   │ │
│  │  │  │ POST /auth/signup│ │ GET /mesocycles   │ │ GET /foods     │  │   │ │
│  │  │  │ POST /auth/refres│ │ PUT /sessions/:id │ │ GET /tdee      │  │   │ │
│  │  │  └──────────────────┘ └──────────────────┘ └────────────────┘  │   │ │
│  │  │  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────┐  │   │ │
│  │  │  │ ExerciseCtrl     │ │ AnalyticsCtrl    │ │ UserController │  │   │ │
│  │  │  │ GET /exercises   │ │ GET /analytics/* │ │ GET /profile   │  │   │ │
│  │  │  │ GET /exercises/:i│ │ GET /volume      │ │ PUT /profile   │  │   │ │
│  │  │  └──────────────────┘ └──────────────────┘ └────────────────┘  │   │ │
│  │  │  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────┐  │   │ │
│  │  │  │ BodyMetricCtrl   │ │ ImportExportCtrl │ │ ArticleCtrl    │  │   │ │
│  │  │  │ POST /metrics    │ │ POST /import     │ │ GET /articles  │  │   │ │
│  │  │  │ GET /metrics     │ │ GET /export      │ │ GET /articles/:│  │   │ │
│  │  │  └──────────────────┘ └──────────────────┘ └────────────────┘  │   │ │
│  │  │                                                                 │   │ │
│  │  │  ┌──────────────────┐ ┌──────────────────┐                     │   │ │
│  │  │  │   Guards         │ │   Filters        │                     │   │ │
│  │  │  │  JwtAuthGuard    │ │  GlobalException │                     │   │ │
│  │  │  │  RolesGuard      │ │  Filter          │                     │   │ │
│  │  │  └──────────────────┘ └──────────────────┘                     │   │ │
│  │  │  ┌──────────────────┐ ┌──────────────────┐                     │   │ │
│  │  │  │  Interceptors    │ │    Pipes         │                     │   │ │
│  │  │  │  LoggingIntrcptr │ │  ValidationPipe  │                     │   │ │
│  │  │  │  TimeoutIntrcptr │ │                  │                     │   │ │
│  │  │  └──────────────────┘ └──────────────────┘                     │   │ │
│  │  └─────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                         │ │
│  │  ┌─ Secondary Adapters (Output) ───────────────────────────────────┐   │ │
│  │  │  ┌──────────────────────────────────────────┐                   │   │ │
│  │  │  │           Database (Prisma)               │                   │   │ │
│  │  │  │  PrismaUserRepository → IUserRepository   │                   │   │ │
│  │  │  │  PrismaMesocycleRepo → IMesocycleRepo     │                   │   │ │
│  │  │  │  PrismaSessionRepo  → ISessionRepo        │                   │   │ │
│  │  │  │  PrismaExerciseRepo → IExerciseRepo       │                   │   │ │
│  │  │  │  PrismaFoodRepo     → IFoodRepo           │                   │   │ │
│  │  │  │  PrismaBodyMetricRp → IBodyMetricRepo     │                   │   │ │
│  │  │  │  PrismaArticleRepo  → IArticleRepo        │                   │   │ │
│  │  │  │  PrismaAchievmentRp → IAchievementRepo    │                   │   │ │
│  │  │  │  ──────────────────────────────────────── │                   │   │ │
│  │  │  │  Prisma Entities (DB models)              │                   │   │ │
│  │  │  │  Mappers: PrismaEntity ↔ DomainEntity     │                   │   │ │
│  │  │  └──────────────────────────────────────────┘                   │   │ │
│  │  │                                                                 │   │ │
│  │  │  ┌──────────────────────────────────────────┐                   │   │ │
│  │  │  │         HTTP Clients (External APIs)      │                   │   │ │
│  │  │  │  OpenFoodFactsClient → IFoodApiClient     │                   │   │ │
│  │  │  │  ExerciseDbClient    → IExerciseApiClient  │                   │   │ │
│  │  │  │  EuropePmcClient     → IPaperApiClient     │                   │   │ │
│  │  │  │  GoogleFitClient     → IHealthApiClient    │                   │   │ │
│  │  │  └──────────────────────────────────────────┘                   │   │ │
│  │  │                                                                 │   │ │
│  │  │  ┌──────────────────────────────────────────┐                   │   │ │
│  │  │  │         File Storage                      │                   │   │ │
│  │  │  │  SupabaseStorageService → IFileStorage    │                   │   │ │
│  │  │  └──────────────────────────────────────────┘                   │   │ │
│  │  │                                                                 │   │ │
│  │  │  ┌──────────────────────────────────────────┐                   │   │ │
│  │  │  │         Cache                             │                   │   │ │
│  │  │  │  InMemoryCacheService → ICacheService     │                   │   │ │
│  │  │  └──────────────────────────────────────────┘                   │   │ │
│  │  └─────────────────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─ Base (Cross-cutting) ───────────────────────────────────────────────┐   │
│  │  ConfigModule (registerAs) · PrismaModule · LoggerModule             │   │
│  │  HealthModule (@nestjs/terminus) · ThrottlerModule                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Backend — Módulos NestJS y su Mapeo a Capas

Cada módulo funcional de NestJS encapsula las tres capas para su dominio específico:

| Módulo NestJS | Domain Entities | Application Services | Infrastructure |
|---|---|---|---|
| `AuthModule` | User, RefreshToken | AuthService | AuthController, JwtAuthGuard, PrismaUserRepo |
| `UserModule` | User, UserPreferences | UserService | UserController, PrismaUserRepo |
| `MesocycleModule` | Mesocycle, TrainingDay, PlannedExercise | MesocycleService | MesocycleController, PrismaMesocycleRepo |
| `TrainingModule` | Session, WorkingSet, WarmupSet | TrainingSessionService, WarmupGeneratorService, AutoregulationService, ReadinessService | TrainingController, PrismaSessionRepo |
| `ExerciseModule` | Exercise, MuscleGroup, MovementPattern | ExerciseService, ExerciseSubstitutionService | ExerciseController, PrismaExerciseRepo, ExerciseDbClient |
| `NutritionModule` | FoodEntry, Meal, DailyNutrition, CustomFood | NutritionService, TdeeCalculatorService | NutritionController, PrismaFoodRepo, OpenFoodFactsClient |
| `BodyModule` | BodyMetric, ProgressPhoto | BodyMetricService, ProgressPhotoService | BodyMetricController, PrismaBodyMetricRepo, SupabaseStorageService |
| `AnalyticsModule` | (consume otros domain entities) | AnalyticsService, VolumeTrackerService | AnalyticsController |
| `ArticleModule` | Article, Reference | ArticleService | ArticleController, PrismaArticleRepo, EuropePmcClient |
| `ImportExportModule` | (consume otros domain entities) | ImportExportService, RoutineSharingService | ImportExportController |
| `AchievementModule` | Achievement, UserAchievement | AchievementService | (listeners internos), PrismaAchievementRepo |
| `EquipmentModule` | EquipmentProfile | EquipmentProfileService | EquipmentController, PrismaEquipmentRepo |
| `HealthModule` | — | — | HealthController (@nestjs/terminus) |

### 5.3 Frontend — Componentes Internos

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     FRONTEND PWA (Next.js) - COMPONENTES                     │
│                                                                              │
│  ┌─ App Shell ────────────────────────────────────────────────────────────┐ │
│  │  Layout (Header + BottomNav + Main)                                    │ │
│  │  ThemeProvider (dark/light/system)                                      │ │
│  │  AuthProvider (JWT context + refresh logic)                             │ │
│  │  I18nProvider (español/inglés)                                          │ │
│  │  OfflineStatusBanner                                                    │ │
│  │  SyncManager (IndexedDB ↔ API)                                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─ Features ─────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  ┌─ auth/ ─────────┐  ┌─ training/ ────────────────────────────────┐  │ │
│  │  │ LoginPage        │  │ MesocycleListPage   SessionLivePage        │  │ │
│  │  │ RegisterPage     │  │ MesocyclePlanPage   SessionHistoryPage     │  │ │
│  │  │ ForgotPassword   │  │ TrainingDayEditor   SetInputRow            │  │ │
│  │  │ OnboardingWizard │  │ RestTimerOverlay    WarmupPreview          │  │ │
│  │  └─────────────────┘  │ ExerciseSwapModal   DiscCalculator         │  │ │
│  │                        │ ReadinessModal      SessionNoteModal       │  │ │
│  │                        │ SupersetGroup       HistoryReference       │  │ │
│  │                        └────────────────────────────────────────────┘  │ │
│  │                                                                         │ │
│  │  ┌─ exercises/ ────┐  ┌─ nutrition/ ───────────────────────────────┐  │ │
│  │  │ ExerciseListPage │  │ DailyNutritionPage  MealSection            │  │ │
│  │  │ ExerciseDetail   │  │ FoodSearchModal     MacroProgressRing      │  │ │
│  │  │ MuscleFilter     │  │ TdeeDisplay         BodyModeSelector       │  │ │
│  │  │ ExerciseCard     │  │ BarcodeScannerBtn   CustomFoodForm         │  │ │
│  │  └─────────────────┘  └────────────────────────────────────────────┘  │ │
│  │                                                                         │ │
│  │  ┌─ body/ ─────────┐  ┌─ analytics/ ──────────────────────────────┐  │ │
│  │  │ BodyDashboard    │  │ VolumeDashboard     OneRmChart             │  │ │
│  │  │ WeightTracker    │  │ MuscleHeatmap       TonnageChart           │  │ │
│  │  │ MeasurementsPage │  │ TrendCompare        CorrelationGraphs      │  │ │
│  │  │ ProgressGallery  │  │ PrTable             WeeklyVolumeBar        │  │ │
│  │  │ PhotoCompare     │  └────────────────────────────────────────────┘  │ │
│  │  └─────────────────┘                                                    │ │
│  │                                                                         │ │
│  │  ┌─ academy/ ──────┐  ┌─ social/ ─────────────────────────────────┐  │ │
│  │  │ ArticleListPage  │  │ ImportPage          ExportPage             │  │ │
│  │  │ ArticleDetail    │  │ ShareRoutineModal   ImportPreview          │  │ │
│  │  │ SourcesDrawer    │  │ SettingsPage        AchievementsPage       │  │ │
│  │  └─────────────────┘  └────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─ Shared / Core ────────────────────────────────────────────────────────┐ │
│  │  ┌─ ui/ ─────────────────────────┐  ┌─ hooks/ ────────────────────┐   │ │
│  │  │ shadcn/ui components           │  │ useAuth()                    │   │ │
│  │  │ (Button, Input, Dialog,        │  │ useOffline()                 │   │ │
│  │  │  Sheet, Select, Card,          │  │ useSync()                    │   │ │
│  │  │  Tabs, Progress, etc.)         │  │ useDebounce()                │   │ │
│  │  │ MuscleBodySvg                  │  │ useTimer()                   │   │ │
│  │  │ BarWithDiscs                   │  │ usePagination()              │   │ │
│  │  └────────────────────────────────┘  │ useLocalStorage()            │   │ │
│  │                                       └────────────────────────────┘   │ │
│  │  ┌─ lib/ ────────────────────────┐  ┌─ types/ ────────────────────┐   │ │
│  │  │ api-client (fetch wrapper)     │  │ API response types           │   │ │
│  │  │ indexed-db (Dexie.js)          │  │ Domain model types           │   │ │
│  │  │ sync-manager                   │  │ Form types                   │   │ │
│  │  │ unit-converter                 │  │ Chart data types             │   │ │
│  │  │ formulas (1RM, TDEE, warmup)   │  │                              │   │ │
│  │  │ csv-parser                     │  │                              │   │ │
│  │  └────────────────────────────────┘  └────────────────────────────┘   │ │
│  │                                                                        │ │
│  │  ┌─ Service Worker ─────────────────────────────────────────────────┐ │ │
│  │  │  Workbox: precache static assets + runtime cache API responses   │ │ │
│  │  │  Background Sync: queue offline mutations for replay             │ │ │
│  │  │  Push: receive and display notifications                         │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Frontend — Estructura de Carpetas

```text
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: login, register, forgot-password
│   ├── (main)/                   # Route group: authenticated pages
│   │   ├── dashboard/
│   │   ├── training/
│   │   │   ├── mesocycles/
│   │   │   ├── session/
│   │   │   └── history/
│   │   ├── exercises/
│   │   ├── nutrition/
│   │   ├── body/
│   │   ├── analytics/
│   │   ├── academy/
│   │   └── settings/
│   ├── onboarding/
│   ├── share/[code]/             # Public route for shared routines
│   ├── layout.tsx
│   ├── manifest.json
│   └── sw.ts                     # Service Worker registration
├── features/                     # Feature modules (pages + components + hooks)
│   ├── auth/
│   ├── training/
│   ├── exercises/
│   ├── nutrition/
│   ├── body/
│   ├── analytics/
│   ├── academy/
│   └── social/
├── shared/
│   ├── components/ui/            # shadcn/ui + custom shared components
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── constants/
├── i18n/                         # Internationalization files
│   ├── es.json
│   └── en.json
└── public/
    ├── icons/                    # PWA icons
    ├── exercises/                # Cached exercise media
    └── muscles/                  # SVG muscle diagrams
```

---

## 6. Comunicación entre Componentes

### 6.1 Flujo de Request (Frontend → Backend)

```
Usuario interactúa con UI
  │
  ▼
Feature Component (React)
  │  Llama a hook personalizado (ej. useCreateSession)
  ▼
API Client (lib/api-client.ts)
  │  Construye request con token JWT del AuthContext
  │  Si offline → encola en IndexedDB (Background Sync queue)
  │  Si online → fetch directo
  ▼
[Internet / HTTPS]
  │
  ▼
NestJS Pipeline:
  ThrottlerGuard → JwtAuthGuard → ValidationPipe → LoggingInterceptor
  │
  ▼
Controller (Primary Adapter)
  │  Parsea DTO de request → llama toEntity() si aplica
  │  Delega a Application Service
  ▼
Application Service
  │  Orquesta lógica de negocio con Domain Entities
  │  Usa Interfaces (Repositories, External Clients)
  ▼
Infrastructure Adapter (Secondary)
  │  PrismaRepository → PostgreSQL
  │  o HttpClient → API Externa
  ▼
Respuesta fluye de vuelta:
  Repository → Service → Controller (ResponseDTO.fromEntity()) → JSON Response
  │
  ▼
Frontend recibe JSON → actualiza estado local → re-render UI
```

### 6.2 Flujo Offline (PWA)

```
Usuario completa una serie offline
  │
  ▼
Feature Component → API Client
  │  Detecta navigator.onLine === false
  ▼
IndexedDB (Dexie.js)
  │  Almacena la mutación como pending operation
  │  {id, method, url, body, timestamp}
  ▼
UI se actualiza desde IndexedDB (optimistic update)
  │
═══════════════════════════════════
  [Conexión restaurada]
═══════════════════════════════════
  │
  ▼
Service Worker: Background Sync
  │  Lee pending operations de IndexedDB
  │  Replay en orden cronológico
  ▼
Backend API procesa cada request
  │  Si conflict (timestamp) → last-write-wins
  ▼
IndexedDB: marca operations como synced
  │
  ▼
UI muestra indicador "Sincronizado ✓"
```

### 6.3 Tabla de Mensajes y Contratos entre Contenedores

| Origen | Destino | Método | Formato | Autenticación | Descripción |
|---|---|---|---|---|---|
| Frontend → Backend | API REST | HTTP (GET/POST/PUT/PATCH/DELETE) | JSON | Bearer JWT (access token) | Todas las operaciones CRUD y consultas |
| Frontend → Backend | Auth | POST /auth/* | JSON | Sin auth (login/register) o Refresh Cookie | Autenticación y rotación de tokens |
| Backend → PostgreSQL | Database | Prisma Client | SQL | Connection string (env var) | Persistencia de datos |
| Backend → Supabase Storage | File Storage | HTTP REST | Multipart / Binary | Supabase API Key | Upload/download de fotos y media |
| Backend → Open Food Facts | External API | HTTP GET | JSON | Sin auth (API pública) | Búsqueda de alimentos |
| Backend → ExerciseDB/wger | External API | HTTP GET | JSON | API Key (header) | Datos de ejercicios |
| Backend → Europe PMC | External API | HTTP GET | JSON/XML | Sin auth (API pública) | Metadatos de papers científicos |
| Backend → Google Fit | External API | HTTP GET | JSON | OAuth2 Bearer Token | Pasos y calorías del usuario |
| Service Worker → Backend | Background Sync | HTTP (varios) | JSON | Bearer JWT | Replay de operaciones offline |
| Backend → Frontend | Push API | Web Push Protocol | JSON Notification payload | VAPID keys | Notificaciones push |

### 6.4 Visibilidad y Acceso entre Módulos Backend

| Módulo | Puede inyectar de | No puede acceder a |
|---|---|---|
| AuthModule | UserRepo, ConfigService | Ningún otro application service |
| TrainingModule | MesocycleRepo, SessionRepo, ExerciseRepo, UserRepo | NutritionService (son independientes) |
| NutritionModule | FoodRepo, BodyMetricRepo, FoodApiClient | TrainingService (son independientes) |
| AnalyticsModule | SessionRepo, BodyMetricRepo, ExerciseRepo (read-only) | Ningún service de escritura |
| AchievementModule | Todos los repos (read-only, para evaluar condiciones) | Ningún service de escritura directa |
| ImportExportModule | Todos los repos (lectura para export, escritura para import) | — |

**Principio**: Ningún módulo de application accede directamente a Prisma models. Todo pasa por interfaces.

---

## 7. Modelo de Datos de Alto Nivel

### 7.1 Entidades Principales y Relaciones

```
User (1) ─────────── (*) Mesocycle
  │                        │
  │                        ├── (*) TrainingDay
  │                        │       │
  │                        │       └── (*) PlannedExercise
  │                        │               │
  │                        │               └── → Exercise (referencia)
  │                        │
  │                        └── (*) Session
  │                                │
  │                                ├── (*) SessionExercise
  │                                │       │
  │                                │       ├── (*) WorkingSet
  │                                │       │     (weight, reps, rir, notes)
  │                                │       │
  │                                │       └── (*) WarmupSet
  │                                │             (weight, reps)
  │                                │
  │                                └── ReadinessScore (1:1 optional)
  │
  ├── (*) Meal
  │       │
  │       └── (*) FoodEntry
  │               │
  │               └── → Food (referencia a alimento)
  │
  ├── (*) BodyMetric
  │       (weight, neck, chest, biceps, waist, hip, thigh, calf)
  │
  ├── (*) ProgressPhoto
  │       (url, category, date)
  │
  ├── (*) UserAchievement
  │       │
  │       └── → Achievement (referencia)
  │
  ├── (*) EquipmentProfile
  │       │
  │       └── (*) ProfileEquipment (referencia a Equipment)
  │
  └── UserPreferences (1:1)
        (units, language, theme, restTimers, notifications)

Exercise (independiente, compartido)
  ├── muscleGroups[] (primary, secondary)
  ├── movementPattern
  ├── equipment[]
  ├── difficulty
  ├── media (gif/video URL)
  └── instructions (setup, execution, errors)

Article (independiente)
  ├── category
  ├── content (rich text)
  └── (*) Reference (doi, title, authors)

Food (catálogo, seed + user-custom)
  ├── name
  ├── calories, protein, carbs, fat (per 100g)
  ├── barcode (optional)
  └── source (api | user)
```

### 7.2 Campos Base (Todas las Entidades)

Siguiendo las reglas de development:

```typescript
// Implementado en Prisma schema con @default y @updatedAt
{
  id:        String    @id @default(cuid())
  createdAt: DateTime  @default(now())
  updatedAt: DateTime  @updatedAt
  deletedAt: DateTime? // Soft delete
}
```

---

## 8. Estrategia de Sync Offline

### 8.1 Datos Cacheados Localmente (IndexedDB)

| Dato | Estrategia | Frecuencia de sync |
|---|---|---|
| Mesociclo activo (completo) | Cache-first, actualizar en background | Al abrir app + cada 15 min |
| Historial de sesiones (últimas 4 semanas) | Cache-first | Al abrir app |
| Directorio de ejercicios (metadata, sin media pesada) | Cache-first, stale acceptable 7 días | Semanal |
| Preferencias del usuario | Cache-first | Al modificar |
| Pendientes de sync (mutaciones offline) | Write-through a IndexedDB + Background Sync | Inmediato al recuperar conexión |

### 8.2 Resolución de Conflictos

**Estrategia**: Last-Write-Wins con timestamp del cliente (UTC).

1. Cada mutación local almacena `clientTimestamp` (Date.now() UTC).
2. Al sincronizar, el backend compara `clientTimestamp` con `updatedAt` del registro.
3. Si `clientTimestamp > updatedAt` del server → se aplica el cambio.
4. Si `clientTimestamp ≤ updatedAt` → se descarta y se loguea como conflicto resuelto.
5. Conflictos raros (un solo usuario, un solo dispositivo normalmente) se loguean para auditoría pero no bloquean.

### 8.3 Indicadores de Estado para el Usuario

| Estado | Indicador Visual |
|---|---|
| Online, sincronizado | Nada (estado normal) |
| Online, sincronizando | Spinner pequeño en header |
| Offline | Banner amarillo sutil: "Modo offline — tus datos se guardan localmente" |
| Offline → Online, sincronizando | Banner azul: "Sincronizando datos..." con barra de progreso |
| Error de sync | Banner rojo: "Error al sincronizar. Se reintentará automáticamente." |

---

*Fin del documento de Arquitectura. Versión 1.0 — 2026-02-27.*
