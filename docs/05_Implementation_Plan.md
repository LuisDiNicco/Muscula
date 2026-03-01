# Plan de Implementación — Musculá v1.0

**Versión:** 1.1  
**Fecha original:** 2026-02-27  
**Última actualización:** 2026-02-28  
**Reglas de desarrollo:** Las definidas en `.github/development_rules/` se aplican al 100% del código generado. No hay excepciones.  
**Estado actual:** Backend BE-1 a BE-8 completadas. BE-9 en progreso. Frontend no iniciado.

---

## Tabla de Contenidos

1. [Protocolo General de Implementación](#1-protocolo-general-de-implementación)
2. [Fases del Backend](#2-fases-del-backend)
3. [Fases del Frontend](#3-fases-del-frontend)
4. [Checklist de Compliance por Fase](#4-checklist-de-compliance-por-fase)
5. [Estrategia de Testing](#5-estrategia-de-testing)
6. [Convenciones de Git](#6-convenciones-de-git)
7. [Backlog de Mejoras Post-v1.0 (v1.1+)](#7-backlog-de-mejoras-post-v10-v11)
6. [Convenciones de Git](#6-convenciones-de-git)

---

## 1. Protocolo General de Implementación

### 1.1 Proceso Obligatorio por Fase

Cada fase sigue este flujo estricto:

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUJO POR FASE                          │
│                                                             │
│  1. IMPLEMENTAR                                             │
│     └─ Escribir código según las especificaciones           │
│     └─ Commits periódicos (cada funcionalidad completada)   │
│                                                             │
│  2. TESTING                                                 │
│     └─ Escribir unit tests (domain, application)            │
│     └─ Escribir integration tests (API endpoints)           │
│     └─ Verificar cobertura > 80%                            │
│                                                             │
│  3. VALIDACIÓN INTERNA                                      │
│     └─ Ejecutar la Checklist de Compliance (Sección 4)      │
│     └─ Detectar desvíos del plan                            │
│     └─ Corregir desvíos antes de avanzar                    │
│                                                             │
│  4. CODE REVIEW (100% Compliance)                           │
│     └─ Verificar CADA regla de .github/development_rules/   │
│     └─ Verificar cumplimiento de SRS (criterios aceptación) │
│     └─ Si compliance < 100% → volver a paso 1 e iterar     │
│     └─ Si compliance = 100% → aprobar fase                  │
│                                                             │
│  5. GIT PUSH                                                │
│     └─ Confirmar que tests pasan                            │
│     └─ Push al repositorio remoto                           │
│     └─ Tag de la fase: "phase-BE-X" o "phase-FE-X"         │
│                                                             │
│  ═══════════════════════════════════════════                 │
│                                                             │
│  SIGUIENTE FASE  ──────────────────────────→                │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Reglas de Commits

- **Formato**: Conventional Commits (ver `.github/development_rules/06_devops_git_testing.md`).
- **Frecuencia**: Un commit por cada funcionalidad atómica completada. NO acumular múltiples funcionalidades en un solo commit.
- **Mensajes**:
  - `feat: add user registration endpoint` — Nueva funcionalidad.
  - `fix: correct TDEE formula overflow for extreme weights` — Corrección.
  - `refactor: extract warmup algorithm to domain service` — Refactor sin cambio de comportamiento.
  - `test: add unit tests for AutoregulationService` — Tests.
  - `chore: configure Prisma schema and initial migration` — Config/tooling.
- **Push por fase**: Al completar cada fase exitosamente (compliance 100%), se hace push.

### 1.3 Reglas de .github/development_rules/ Aplicables

El código generado DEBE cumplir con TODAS estas reglas sin excepción:

#### Del archivo `01_architecture.md`:
- Clean/Hexagonal Architecture con 3 capas: domain, application, infrastructure.
- domain NO depende de NINGUNA otra capa, framework o librería.
- application depende SOLO de domain.
- infrastructure implementa interfaces de application.
- Estructura de carpetas exacta (src/domain/, src/application/, src/infrastructure/).
- Primary-adapters NO dependen de secondary-adapters.

#### Del archivo `02_typing_dtos_patterns.md`:
- `any` PROHIBIDO. Usar `unknown` con type guards si es necesario.
- Request DTOs con class-validator + class-transformer. Método `toEntity()`.
- Response DTOs con método estático `fromEntity()`.
- Domain entities NUNCA se exponen fuera del backend. Siempre se mapean a DTOs.
- Constructor Injection con string constant Tokens.
- Repositories con métodos específicos de negocio, NO CRUD genérico.
- Controladores: máximo 80 líneas.
- Services: máximo 200 líneas.

#### Del archivo `03_api_errors_docs.md`:
- RESTful standards: HTTP methods correctos, status codes correctos.
- Paginación obligatoria para colecciones unbounded.
- Custom domain errors en domain/errors/.
- NUNCA swallow exceptions.
- Global Exception Filter.
- Swagger completo: @ApiTags, @ApiOperation, @ApiResponse, @ApiProperty en TODO DTO.

#### Del archivo `04_observability_integrations.md`:
- Global Interceptor para logging de requests/responses.
- Context logging: userId en cada log. NUNCA loguear PII.
- Health check endpoint con @nestjs/terminus.
- External API clients en secondary-adapters/http/ con tipos estrictos.

#### Del archivo `05_config_security_conventions.md`:
- NUNCA leer process.env directamente. Usar @nestjs/config con registerAs.
- ValidationPipe global: whitelist: true, forbidNonWhitelisted: true.
- CORS con orígenes explícitos. Helmet habilitado.
- Rate limiting con @nestjs/throttler.
- JWT Guards. Role-based access con @Roles().
- Contraseñas NUNCA en texto plano.
- camelCase variables, PascalCase clases, SCREAMING_SNAKE_CASE constantes.

#### Del archivo `06_devops_git_testing.md`:
- Dockerfile multi-stage si se genera.
- Conventional Commits.
- Unit tests en test/unit/: obligatorios para application/services y domain/entities.
- Integration tests en test/integration/: obligatorios para API endpoints.
- Architecture tests en test/architecture/: obligatorios.

#### Del archivo `07_frontend_best_practices.md`:
- Feature-based folders con tests y estilos colocados.
- TypeScript strict. `any` prohibido.
- Validar datos externos en el boundary (API responses).
- Unidirectional data flow.
- WCAG: HTML semántico, labels, keyboard nav, focus visible.
- Responsive: mobile, tablet, desktop.
- Lazy-load rutas pesadas. Optimizar imágenes.
- Sanitizar input del usuario.
- No secrets en frontend.
- Integration tests (Playwright). Unit tests para lógica compleja.
- Prettier + ESLint.

---

## 2. Fases del Backend

### Fase BE-1: Scaffolding y Configuración Base

**Objetivo**: Crear el proyecto NestJS con toda la configuración transversal lista. Al finalizar, el proyecto compila, tiene health check, y la arquitectura de carpetas está creada.

**Commits esperados**: 3-5

#### Tareas (en orden):

1. **Inicializar proyecto NestJS**:
   - `nest new muscula-api --strict --package-manager pnpm`
   - TypeScript strict habilitado en `tsconfig.json`: `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`.
   - Eliminar archivos de ejemplo generados (app.controller.ts, app.service.ts, app.controller.spec.ts).

2. **Crear estructura de carpetas**:
   ```
   src/
   ├── main.ts
   ├── app.module.ts
   ├── domain/
   │   ├── entities/
   │   ├── enums/
   │   └── errors/
   ├── application/
   │   ├── interfaces/
   │   └── services/
   └── infrastructure/
       ├── base/
       │   ├── config/
       │   ├── filters/
       │   ├── interceptors/
       │   └── pipes/
       ├── primary-adapters/
       │   ├── controllers/
       │   └── guards/
       └── secondary-adapters/
           ├── database/
           │   └── prisma/
           ├── http/
           └── storage/
   ```
   - Crear un archivo `.gitkeep` en cada carpeta vacía para que Git las trackee.

3. **Instalar dependencias core**:
   - `pnpm add @nestjs/config @nestjs/terminus @nestjs/throttler @nestjs/swagger class-validator class-transformer helmet`
   - `pnpm add @prisma/client`
   - `pnpm add -D prisma @types/node`
   - `pnpm add bcrypt jsonwebtoken`
   - `pnpm add -D @types/bcrypt @types/jsonwebtoken`

4. **Configurar módulo de Config**:
   - Crear `src/infrastructure/base/config/app.config.ts`:
     ```typescript
     import { registerAs } from '@nestjs/config';
     export const appConfig = registerAs('app', () => ({
       port: parseInt(process.env.PORT || '3000', 10),
       nodeEnv: process.env.NODE_ENV || 'development',
       frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
     }));
     ```
   - Crear `src/infrastructure/base/config/database.config.ts`: DATABASE_URL.
   - Crear `src/infrastructure/base/config/jwt.config.ts`: JWT_SECRET, JWT_EXPIRATION, REFRESH_TOKEN_EXPIRATION.
   - Crear `src/infrastructure/base/config/index.ts`: exportar todos.
   - Crear archivo `.env.example` con todas las variables necesarias (sin valores reales).
   - Crear archivo `.env` en `.gitignore`.

5. **Configurar Prisma**:
   - `npx prisma init` → genera `prisma/schema.prisma`.
   - Configurar el schema con el DER completo definido en `docs/04_UX_Design_Data_Governance.md` sección 5.
   - Crear `src/infrastructure/secondary-adapters/database/prisma/prisma.service.ts`: NestJS injectable que extiende PrismaClient con onModuleInit/onModuleDestroy.
   - Crear `src/infrastructure/secondary-adapters/database/prisma/prisma.module.ts`: Global module.
   - Configurar connection pool: `{ connection_limit: 10 }`.

6. **Configurar middleware global** en `main.ts`:
   - `app.enableCors({ origin: configService.get('app.frontendUrl'), credentials: true })`.
   - `app.use(helmet())`.
   - `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))`.
   - `app.setGlobalPrefix('api/v1')`.
   - Swagger setup: `SwaggerModule.setup('api/docs', app, document)`.

7. **Crear Global Exception Filter**:
   - `src/infrastructure/base/filters/global-exception.filter.ts`.
   - Mapear domain errors a HTTP status codes:
     - `EntityNotFoundError` → 404
     - `ConflictError` → 409
     - `ValidationError` → 400 (del dominio, no de class-validator)
     - `AuthenticationError` → 401
     - `AuthorizationError` → 403
   - El filtro loguea el error con context y retorna el formato de error estándar: `{ statusCode, message, error, details? }`.

8. **Crear Global Logging Interceptor**:
   - `src/infrastructure/base/interceptors/logging.interceptor.ts`.
   - Loguea: method, URL, userId (del JWT si existe), duration, status code.
   - NO loguea: body de request/response (puede contener PII), passwords, tokens.

9. **Crear Health Check**:
   - `src/infrastructure/primary-adapters/controllers/health.controller.ts`.
   - Usa @nestjs/terminus. Checks: database (Prisma ping).
   - Endpoint: `GET /api/v1/health`.

10. **Crear Throttler config**:
    - Global: 100 req/min por IP para endpoints públicos.
    - Autenticados: 300 req/min.
    - Decorador custom `@Public()` + `@Throttle()` overrides por controller.

11. **Crear domain errors base**:
    - `src/domain/errors/entity-not-found.error.ts`
    - `src/domain/errors/conflict.error.ts`
    - `src/domain/errors/validation.error.ts`
    - `src/domain/errors/authentication.error.ts`
    - `src/domain/errors/authorization.error.ts`
    - Cada uno extiende `Error` con name y message descriptivo.

12. **Crear domain enums**:
    - Definir TODOS los enums del sistema en `src/domain/enums/`:
      - `gender.enum.ts`, `activity-level.enum.ts`, `experience-level.enum.ts`, `unit-system.enum.ts`, `language.enum.ts`, `theme.enum.ts`, `training-objective.enum.ts`, `mesocycle-status.enum.ts`, `session-status.enum.ts`, `movement-pattern.enum.ts`, `muscle-group.enum.ts`, `difficulty-level.enum.ts`, `equipment-type.enum.ts`, `meal-type.enum.ts`, `photo-category.enum.ts`, `article-category.enum.ts`, `food-source.enum.ts`.
    - Convención: PascalCase para nombres de enum, SCREAMING_SNAKE_CASE para valores.
    - Export barrel: `src/domain/enums/index.ts`.

13. **Crear primer migration de Prisma**:
    - `npx prisma migrate dev --name initial_schema`
    - Verificar que la migración se genera correctamente y aplica sin errores.

14. **Verificación**:
    - `pnpm build` → compila sin errores.
    - `pnpm start:dev` → arranca, health check responde 200.
    - Swagger UI accesible en `/api/docs`.

#### Testing de esta fase:
- Test unitario del GlobalExceptionFilter: verificar mapeo de domain errors a HTTP status codes.
- Test de integración: `GET /api/v1/health` → 200 con `{ status: 'ok' }`.
- Test de arquitectura: verificar que domain/ no importa de infrastructure/ ni application/ no importa de infrastructure/.

#### Commit final de fase:
```
git tag phase-BE-1
git push origin main --tags
```

---

### Fase BE-2: Autenticación y Gestión de Usuario

**Objetivo**: Sistema completo de autenticación (registro, login, refresh, logout, reset password) y gestión de perfil/preferencias. Al finalizar, un usuario puede registrarse, loguearse, y editar su perfil.

**Commits esperados**: 6-8

#### Tareas:

1. **Domain entities**:
   - `src/domain/entities/user.entity.ts`: Clase pura TS con campos del User. Métodos de negocio: `verifyPassword(hash, plain)` (retorna boolean, delega a bcrypt pero recibe como parámetro), `isEmailVerified()`, `canLogin()`.
   - `src/domain/entities/refresh-token.entity.ts`: Clase con `isExpired()`.
   - No importar bcrypt en domain. Pasar el hasher como interfaz si es necesario para lógica de negocio.

2. **Application interfaces (Ports)**:
   - `src/application/interfaces/user-repository.interface.ts`:
     ```typescript
     export const USER_REPOSITORY = 'USER_REPOSITORY';
     export interface IUserRepository {
       findByEmail(email: string): Promise<UserEntity | null>;
       findByUsername(username: string): Promise<UserEntity | null>;
       findById(id: string): Promise<UserEntity | null>;
       create(user: UserEntity): Promise<UserEntity>;
       update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;
       softDelete(id: string): Promise<void>;
     }
     ```
   - `src/application/interfaces/refresh-token-repository.interface.ts`: create, findByToken, deleteByToken, deleteAllByUserId.
   - `src/application/interfaces/password-hasher.interface.ts`: hash(plain), compare(plain, hashed).
   - `src/application/interfaces/token-service.interface.ts`: generateAccessToken(payload), generateRefreshToken(), verifyAccessToken(token).

3. **Application services**:
   - `src/application/services/auth.service.ts` (< 200 líneas):
     - `register(email, password, username)`: validar unicidad, hashear password, crear user, generar tokens.
     - `login(email, password)`: buscar user, verificar password, check cuenta activa, generar tokens. Implementar rate limiting de intentos (5 en 15 min).
     - `refreshToken(token)`: validar refresh token, rotar (eliminar viejo, crear nuevo), generar nuevo access token.
     - `logout(token)`: eliminar refresh token.
     - `forgotPassword(email)`: generar token de reset, (en v1, loguear el token; email service es mock).
     - `resetPassword(token, newPassword)`: validar token, verificar que no sea igual a últimas 3 passwords, actualizar, invalidar todos los refresh tokens.
   - `src/application/services/user.service.ts` (< 200 líneas):
     - `getProfile(userId)`: retornar user entity.
     - `updateProfile(userId, data)`: actualizar campos permitidos.
     - `getPreferences(userId)`: retornar preferences.
     - `updatePreferences(userId, data)`: actualizar preferences.
     - `deleteAccount(userId, confirmPassword)`: verificar password, soft delete.

4. **Infrastructure - Database adapters**:
   - `src/infrastructure/secondary-adapters/database/user/prisma-user.repository.ts`: implementa IUserRepository.
   - Incluir mappers: `src/infrastructure/secondary-adapters/database/user/maps/user.mapper.ts`: PrismaUser ↔ UserEntity.
   - `src/infrastructure/secondary-adapters/database/auth/prisma-refresh-token.repository.ts`: implementa IRefreshTokenRepository.
   - `src/infrastructure/secondary-adapters/database/auth/prisma-password-history.repository.ts`.

5. **Infrastructure - Auth utilities**:
   - `src/infrastructure/base/auth/bcrypt-password-hasher.ts`: implementa IPasswordHasher.
   - `src/infrastructure/base/auth/jwt-token.service.ts`: implementa ITokenService. Usa @nestjs/config para JWT_SECRET.

6. **Infrastructure - Guards**:
   - `src/infrastructure/primary-adapters/guards/jwt-auth.guard.ts`: extrae y verifica JWT del header Authorization.
   - `src/infrastructure/primary-adapters/guards/roles.guard.ts`: verifica roles del usuario.
   - Decorador `@Public()`: marca endpoints que no requieren auth.
   - Decorador `@CurrentUser()`: extrae userId del request.

7. **Infrastructure - Controllers**:
   - `src/infrastructure/primary-adapters/controllers/auth.controller.ts` (< 80 líneas):
     - POST /auth/register: RegisterDto → AuthService.register → responde 201 con token.
     - POST /auth/login: LoginDto → AuthService.login → responde 200 con token + set-cookie.
     - POST /auth/refresh: cookie → AuthService.refreshToken.
     - POST /auth/logout: cookie → AuthService.logout → 204.
     - POST /auth/forgot-password: ForgotPasswordDto → AuthService.forgotPassword → 200.
     - POST /auth/reset-password: ResetPasswordDto → AuthService.resetPassword → 200.
   - `src/infrastructure/primary-adapters/controllers/user.controller.ts` (< 80 líneas):
     - GET /users/me: → UserService.getProfile.
     - PATCH /users/me: UpdateProfileDto → UserService.updateProfile.
     - GET /users/me/preferences: → UserService.getPreferences.
     - PUT /users/me/preferences: UpdatePreferencesDto → UserService.updatePreferences.
     - DELETE /users/me: DeleteAccountDto → UserService.deleteAccount → 204.

8. **DTOs** (con class-validator, @ApiProperty, toEntity/fromEntity):
   - `RegisterDto`: email (IsEmail), password (MinLength 8, Matches regex), username (MinLength 3, MaxLength 30, IsAlphanumeric).
   - `LoginDto`: email, password.
   - `ForgotPasswordDto`: email.
   - `ResetPasswordDto`: token, newPassword.
   - `UpdateProfileDto`: username?, dateOfBirth?, gender?, heightCm?, currentWeightKg?, activityLevel?, experience?.
   - `UpdatePreferencesDto`: unitSystem?, language?, theme?, restTimeCompoundSec?, restTimeIsolationSec?, etc.
   - `DeleteAccountDto`: confirmPassword.
   - `UserProfileResponseDto`: static fromEntity().
   - `UserPreferencesResponseDto`: static fromEntity().
   - `AuthResponseDto`: user (UserProfileResponseDto), accessToken.

9. **NestJS Module wiring**:
   - `AuthModule`: providers (AuthService, PrismaUserRepo, PrismaRefreshTokenRepo, BcryptPasswordHasher, JwtTokenService con tokens de inyección), controllers (AuthController), exports (JwtAuthGuard).
   - `UserModule`: providers (UserService, PrismaUserRepo), controllers (UserController).
   - Registrar modules en AppModule.

#### Testing:
- **Unit tests** (domain/entities):
  - `User.isEmailVerified()` → true/false cases.
  - `User.canLogin()` → false si deletedAt !== null, false si emailVerified === false.
  - `RefreshToken.isExpired()` → true si expiresAt < now.
- **Unit tests** (application/services):
  - `AuthService.register`: mock repo, verify hasheo llamado, verify user creado, verify tokens generados.
  - `AuthService.login`: mock repo, verify password comparison, verify error en user no encontrado, verify error en password incorrecta.
  - `AuthService.refreshToken`: verify token rotation.
  - `UserService.updateProfile`: verify solo campos permitidos se actualizan.
- **Integration tests**:
  - POST /auth/register → 201 con token.
  - POST /auth/register con email duplicado → 409.
  - POST /auth/login → 200 con token y cookie.
  - POST /auth/login con password incorrecta → 401.
  - GET /users/me sin token → 401.
  - GET /users/me con token → 200 con perfil.
  - PATCH /users/me → 200 con datos actualizados.
- **Architecture tests**:
  - Verificar que auth.service.ts no importa de infrastructure/.
  - Verificar que user.entity.ts no importa de ninguna capa.

---

### Fase BE-3: Ejercicios y Equipamiento

**Objetivo**: Directorio de ejercicios buscable/filtrable, perfiles de equipamiento, y seed de datos. Al finalizar, se pueden listar, buscar y filtrar ejercicios, y crear/seleccionar perfiles de equipamiento.

**Commits esperados**: 4-6

#### Tareas:

1. **Domain entities**:
   - `Exercise` entity: con métodos `isCompound()`, `matchesPattern(pattern)`, `matchesMuscle(muscle)`.
   - `EquipmentProfile` entity: con método `hasEquipment(type)`, `filterExercises(exercises[])`.

2. **Application interfaces**:
   - `IExerciseRepository`: findAll(filters, pagination), findById(id), findSubstitutes(exerciseId, equipmentTypes[]), search(query, filters), create(exercise).
   - `IEquipmentProfileRepository`: findAllByUser(userId), findActiveByUser(userId), create, update, delete, setActive(userId, profileId).

3. **Application services**:
   - `ExerciseService`: listExercises(filters, pagination), getExerciseDetail(id), getSubstitutes(exerciseId, userId), createCustomExercise(userId, data).
   - `EquipmentProfileService`: listProfiles(userId), createProfile(userId, data), updateProfile(userId, id, data), deleteProfile(userId, id), activateProfile(userId, id).

4. **Infrastructure - Database adapters**:
   - `PrismaExerciseRepository`: implementar búsqueda con filtros chain, full-text search para nombre, JOIN con músculos y equipamiento.
   - `PrismaEquipmentProfileRepository`.
   - Mappers para Exercise y EquipmentProfile.

5. **Controllers + DTOs**:
   - `ExerciseController`: GET /exercises (con query params de filtros), GET /exercises/:id, GET /exercises/:id/substitutes, POST /exercises (custom).
   - `EquipmentController`: GET /equipment-profiles, POST, PATCH /:id, DELETE /:id, POST /:id/activate.
   - DTOs completos con class-validator y Swagger decorators.

6. **Seed de ejercicios** (`prisma/seed.ts`):
   - Implementar un script de seed que inserte los 150+ ejercicios definidos en `docs/03_Additional_Context_Domain_Knowledge.md` sección 5.1.
   - Cada ejercicio con: nameEs, nameEn, movementPattern, difficulty, equipmentType, isCompound, primaryMuscles[], secondaryMuscles[].
   - Insertar perfiles de equipamiento preset: "Gimnasio Comercial Completo", "Home Gym Básico", "Solo Peso Corporal".
   - Insertar los landmarks de volumen por defecto (UserVolumeLandmark seedable defaults).
   - Configurar `prisma/seed.ts` en `package.json`: `"prisma": { "seed": "ts-node prisma/seed.ts" }`.

7. **Seed de logros** (incluir en el mismo seed.ts):
   - Insertar los 10+ achievements definidos en RF-SY-003.

#### Testing:
- **Unit tests**: ExerciseService con mocks (filtrado, búsqueda de sustitutos).
- **Integration tests**: GET /exercises (paginación, filtros), GET /exercises/:id (404 para no existente), POST /exercises (custom, con auth).
- **Seed test**: Ejecutar seed en DB de test, verificar que los 150+ ejercicios se insertaron.

---

### Fase BE-4: Mesociclos y Planificación

**Objetivo**: CRUD completo de mesociclos con días de entrenamiento y ejercicios planificados. Al finalizar, un usuario puede crear, editar, duplicar y activar mesociclos.

**Commits esperados**: 5-7

#### Tareas:

1. **Domain entities**:
   - `Mesocycle`: métodos `canActivate()`, `canComplete()`, `isActive()`, `isDraft()`.
   - `TrainingDay`: método `getExercisesInOrder()`, `hasSupersets()`.
   - `PlannedExercise`: validaciones de negocio (targetSets > 0, targetRepsMin ≤ targetRepsMax, targetRir 0-5).

2. **Application interfaces**:
   - `IMesocycleRepository`: findAllByUser(userId, filters, pagination), findById(id), findActiveByUser(userId), create, update, softDelete, duplicate(id).

3. **Application services**:
   - `MesocycleService`:
     - `listMesocycles(userId, filters, pagination)`.
     - `getMesocycleDetail(userId, id)`: retorna mesociclo completo con días y ejercicios.
     - `createMesocycle(userId, data)`: crea mesociclo con días y ejercicios en una sola operación (transacción).
     - `updateMesocycle(userId, id, data)`: solo si está en DRAFT.
     - `deleteMesocycle(userId, id)`: soft delete.
     - `duplicateMesocycle(userId, id)`: crea copia en DRAFT.
     - `activateMesocycle(userId, id)`: desactiva el activo actual, activa el nuevo. Solo si está en DRAFT.
     - `completeMesocycle(userId, id)`: solo si está ACTIVE.

4. **Infrastructure y Controllers**:
   - `PrismaMesocycleRepository` con transacciones para create (mesocycle + days + exercises en una transacción).
   - `MesocycleController` + `TrainingDayController` (anidado).
   - DTOs: CreateMesocycleDto (nested), MesocycleSummaryResponseDto, MesocycleDetailResponseDto, TrainingDayDto, PlannedExerciseDto.

5. **Validaciones de negocio**:
   - Solo un mesociclo activo a la vez por usuario.
   - No se puede editar un mesociclo activo (solo completar o archivar).
   - La duración debe estar entre 3 y 16 semanas.
   - Máximo 7 días de entrenamiento por semana.

#### Testing:
- **Unit tests**: Mesocycle.canActivate() (solo si DRAFT), duplicación (genera nueva ID), validaciones de PlannedExercise.
- **Integration tests**: CRUD completo de mesociclos, activación (verificar que el anterior se desactiva), duplicación.

---

### Fase BE-5: Sesiones de Entrenamiento (Tracking Core)

**Objetivo**: Iniciar sesiones, registrar series, sugerir peso, generar calentamiento, sustituir ejercicios, readiness score. Este es el corazón del backend. Al finalizar, un usuario puede completar una sesión de entrenamiento completa.

**Commits esperados**: 8-10

#### Tareas:

1. **Domain entities**:
   - `Session`: métodos `isInProgress()`, `getDuration()`, `complete(notes?)`, `abandon()`.
   - `WorkingSet`: métodos `isEffective()` (RIR ≤ 4 y completed), `getEstimated1RM()` (Epley + Brzycki promedio).
   - `WarmupSet`: solo datos, sin lógica compleja.
   - `ReadinessScore`: método `calculateTotal()` (ponderado: sueño 40%, estrés 30%, DOMS 30%), `getAdjustmentFactor()`.

2. **Application services**:
   - `TrainingSessionService`:
     - `startSession(userId, mesocycleId?, trainingDayId?, weekNumber?)`: crear sesión, cargar template con sugerencias predictivas.
     - `getActiveSession(userId)`: retornar sesión en progreso o null.
     - `getSessionDetail(userId, sessionId)`.
     - `addExerciseToSession(userId, sessionId, exerciseId, order)`.
     - `removeExerciseFromSession(userId, sessionId, exerciseId)`.
     - `addSet(userId, sessionId, exerciseId, data)`: crear nueva serie de trabajo.
     - `updateSet(userId, sessionId, setId, data)`: actualizar serie.
     - `deleteSet(userId, sessionId, setId)`.
     - `completeSession(userId, sessionId, notes?)`: marcar como completada, calcular duración.
     - `abandonSession(userId, sessionId)`.
     - `listSessions(userId, filters, pagination)`: historial.
   - `AutoregulationService` (ver algoritmo en doc 03, sección 2.1):
     - `suggestWeight(userId, exerciseId, readinessScore?)`: implementar el algoritmo de sugerencia predictiva exactamente como está documentado.
     - `getLastSessionData(userId, exerciseId)`: obtener última sesión para referencia.
   - `WarmupGeneratorService` (ver algoritmo en doc 03, sección 2.2):
     - `generateWarmup(workWeight, barWeight?)`: retorna array de WarmupSet.
   - `ExerciseSubstitutionService`:
     - `findSubstitutes(exerciseId, userId)`: buscar ejercicios con mismo movementPattern + mismo primaryMuscle, filtrado por equipamiento activo del usuario.
     - `substituteExercise(userId, sessionId, oldExerciseId, newExerciseId)`: reemplazar en la sesión, guardar referencia al original.
   - `ReadinessService`:
     - `recordReadiness(userId, sessionId, sleep, stress, doms)`: calcular score, almacenar.

3. **Infrastructure**:
   - `PrismaSessionRepository`: queries complejas con includes (exercises, sets, warmups, readiness).
   - Controladores: `TrainingController` con sub-rutas para exercises y sets.
   - DTOs: SessionDetailResponseDto (completo con sugerencias y últimos datos), AddSetDto, UpdateSetDto, todas con validaciones estrictas.

4. **Temporizador de descanso**:
   - El temporizador es puramente frontend. El backend solo recibe y persiste `restTimeSec` en cada WorkingSet.

5. **Notas granulares**:
   - Serie notes (max 200 chars, validated en DTO).
   - Session notes (max 1000 chars, on complete).

#### Testing:
- **Unit tests**:
  - AutoregulationService: todos los branches del algoritmo (deltaRIR > 0, == 0, < 0, con/sin readiness, redondeo).
  - WarmupGeneratorService: peso < 40 (vacío), peso normal (3 series), peso > 80 (4 series), edge cases.
  - WorkingSet.isEffective(): RIR 0-4 → true, RIR 5+ → false.
  - WorkingSet.getEstimated1RM(): verificar con valores conocidos (ej. 100kg × 5 ≈ 116.7kg).
  - ReadinessScore.calculateTotal(): verificar ponderación.
- **Integration tests**:
  - Flujo completo: crear sesión → agregar sets → completar.
  - Sugerencia de peso con y sin historial.
  - Generación de calentamiento.
  - Sustitución de ejercicio.
  - GET /sessions/active → correcta con sesión en progreso.
  - Edge case: completar sesión ya completada → error.

---

### Fase BE-6: Nutrición y Composición Corporal

**Objetivo**: Diario de comidas con búsqueda de alimentos, TDEE dinámico, métricas corporales, y galería de progreso. Al finalizar, un usuario puede registrar comidas, ver su TDEE, y subir fotos de progreso.

**Commits esperados**: 7-9

#### Tareas:

1. **Domain entities**:
   - `Meal`, `FoodEntry`, `Food`, `BodyMetric`, `ProgressPhoto`.
   - `DailyNutrition` (value object): calculateTotals(entries[]) → { calories, protein, carbs, fat }.

2. **Application services**:
   - `NutritionService`:
     - `getDailyNutrition(userId, date)`: meals + entries + totales + targets (basados en modo y TDEE).
     - `addFoodEntry(userId, mealId, data)`.
     - `deleteFoodEntry(userId, entryId)`.
     - `searchFoods(query, page, limit)`: proxy a Open Food Facts API (con cache).
     - `searchFoodByBarcode(barcode)`: proxy a API.
     - `createCustomFood(userId, data)`.
     - `getBodyMode(userId)`.
     - `setBodyMode(userId, mode)`: calcula nuevo rango calórico según modo.
   - `TdeeCalculatorService` (ver algoritmo en doc 03, sección 2.3):
     - `calculateTdee(userId)`: implementar algoritmo exacto (estático para < 14 días, dinámico para ≥ 14 días).
     - `getStaticTdee(user)`: Mifflin-St Jeor × factor de actividad.
   - `BodyMetricService`:
     - `recordMetrics(userId, date, data)`.
     - `getMetrics(userId, from, to, type?)`.
     - `getWeightTrend(userId, days)`: puntos diarios + media móvil de 7 días.
   - `ProgressPhotoService`:
     - `uploadPhoto(userId, file, date, category)`: comprimir, subir a storage, guardar referencia.
     - `getPhotos(userId, filters)`.
     - `deletePhoto(userId, photoId)`.

3. **Infrastructure - External API Clients**:
   - `src/infrastructure/secondary-adapters/http/open-food-facts.client.ts`: implementa IFoodApiClient.
     - GET product by barcode.
     - GET search by query.
     - Parsear respuesta, validar campos obligatorios (descartar si faltan macros), mapear a Food entity.
     - Cachear resultados en DB (Food table con source = 'API').
   - `src/infrastructure/secondary-adapters/storage/supabase-storage.service.ts`: implementa IFileStorageService.
     - upload(file, path): comprimir imagen (max 1920px, max 1MB), subir.
     - getSignedUrl(path, expiresIn): URL firmada.
     - delete(path).

4. **Controllers + DTOs**:
   - `NutritionController`, `BodyMetricController`.
   - Todos los DTOs con validaciones completas.

5. **Macro targets según body mode**:
   - Volumen: TDEE + 15%. Protein: 1.8g/kg. Fat: 25% kcal. Carbs: resto.
   - Definición: TDEE - 20%. Protein: 2.4g/kg. Fat: 25% kcal. Carbs: resto.
   - Mantenimiento: TDEE ± 0%. Protein: 2.0g/kg. Fat: 25% kcal. Carbs: resto.
   - Recomposición: TDEE - 10%. Protein: 2.4g/kg. Fat: 25% kcal. Carbs: resto.

#### Testing:
- **Unit tests**:
  - TdeeCalculatorService: estático con valores conocidos (verificar con calculadora manual). Dinámico con set de datos de 28 días (verificar resultado razonable).
  - DailyNutrition.calculateTotals: sumas correctas.
  - Macro targets: verificar cálculos para cada modo.
- **Integration tests**:
  - Crear meal, agregar entries, obtener daily nutrition con totales correctos.
  - Buscar alimentos (mock de API externa).
  - Subir foto (mock de storage).
  - Weight trend con media móvil.

---

### Fase BE-7: Analíticas y Dashboard

**Objetivo**: Volumen semanal, heatmap muscular, tendencias de fuerza, PRs, correlaciones, detección de deload. Al finalizar, todos los endpoints de analítica funcionan correctamente.

**Commits esperados**: 5-7

#### Tareas:

1. **Application services**:
   - `VolumeTrackerService`:
     - `getWeeklyVolume(userId, weekOffset)`: cuenta series efectivas por grupo muscular en la semana solicitada. Compara con MEV/MRV del usuario.
     - `getVolumeHistory(userId, weeks)`: array de semanas con volumen por grupo.
   - `AnalyticsService`:
     - `getMuscleHeatmap(userId)`: para cada grupo muscular → última vez entrenado, series esta semana, estado de recuperación (color).
     - `getStrengthTrend(userId, exerciseId, period)`: array de puntos (date, estimated1RM) usando promedio Epley+Brzycki.
     - `getTonnageTrend(userId, exerciseId, period)`: array de puntos (date, tonnage).
     - `getPersonalRecords(userId, exerciseId)`: best1RM, bestSet, bestVolumeSession.
     - `getCorrelations(userId, type, params)`: según el tipo, calcular y retornar los datos.
     - `checkDeload(userId)`: implementar algoritmo de detección (doc 03, sección 2.5).

2. **Queries optimizadas**:
   - Las queries de analíticas pueden ser costosas. Usar aggregaciones SQL directas vía Prisma.$queryRaw para las más pesadas.
   - Cachear resultados de heatmap y volumen semanal con TTL de 5 minutos (in-memory cache).

3. **Controllers + DTOs**:
   - `AnalyticsController`: todos los endpoints de GET /analytics/*.
   - DTOs de respuesta bien tipados.

#### Testing:
- **Unit tests**: VolumeTrackerService con datos de ejemplo (n series con distintos RIR, verificar conteo correcto). DeloadCheck con escenarios positivos y negativos.
- **Integration tests**: Crear sesiones con datos, luego consultar analytics endpoints y verificar que los cálculos son correctos.

---

### Fase BE-8: Import/Export, Sharing, Logros y Academia

**Objetivo**: Importación de Strong/Hevy, exportación CSV, compartir rutinas, sistema de logros, artículos de academia. Al finalizar, todos los módulos complementarios están funcionales.

**Commits esperados**: 6-8

#### Tareas:

1. **ImportExportService**:
   - `exportData(userId)`: generar CSVs (sesiones, nutrición, métricas), comprimir en ZIP, subir a storage, retornar URL temporal (24h).
   - `previewImport(userId, file, source)`: parsear CSV de Strong o Hevy. Mapear ejercicios por nombre (fuzzy match con pg_trgm). Retornar preview con exercise mappings y unmapped.
   - `confirmImport(userId, previewId, customMappings?)`: persistir datos importados. Crear ejercicios custom para los no mapeados.

2. **RoutineSharingService**:
   - `generateShareCode(userId, mesocycleId)`: generar código único (format MUSC-XXXXXX), crear SharedRoutine con expiración 30 días.
   - `getSharedRoutine(code)`: retornar preview pública (sin auth).
   - `importSharedRoutine(userId, code)`: copiar como nuevo mesociclo en DRAFT.

3. **AchievementService**:
   - `evaluateAchievements(userId, event)`: cuando ocurre un evento (session completed, PR, etc.), evaluar todas las condiciones de logros no desbloqueados.
   - `getAchievements(userId)`: retornar todos con estado unlocked/locked.
   - Integrar: llamar a `evaluateAchievements` después de completar sesión, subir foto, etc.

4. **ArticleService**:
   - `listArticles(category?, page, limit)`.
   - `getArticleDetail(id)`: incluir references.
   - Seed de artículos: agregar los 6 artículos definidos en doc 03, sección 5.2 al seed.ts.

5. **Europe PMC Client** (optional enrichment):
   - `EuropePmcClient`: buscar metadatos de paper por DOI.
   - Usado para enriquecer las referencias de artículos (título, autores, journal).

6. **Import parsers**:
   - `StrongCsvParser`: parsear formato Strong (Exercise Name, Date, Set Order, Weight, Reps, etc.).
   - `HevyCsvParser`: parsear formato Hevy.
   - Validar cada fila. Descartar filas con datos inconsistentes (peso negativo, reps = 0). Reportar filas descartadas.

#### Testing:
- **Unit tests**: Parsers de CSV con archivos de ejemplo. Fuzzy matching de ejercicios. Generación de códigos de share.
- **Integration tests**: Flujo completo de import (preview → confirm). Export → descargar CSV. Share → import por otro usuario.

---

### Fase BE-9: Onboarding, Notificaciones y Pulimiento

**Objetivo**: Flujo de onboarding, push notifications (VAPID), deload notifications, y cualquier edge case pendiente. Al finalizar, el backend está 100% funcional.

**Commits esperados**: 4-6

#### Tareas:

1. **Onboarding**:
   - Endpoint `POST /api/v1/users/me/onboarding`: recibe todos los datos del wizard (peso, altura, edad, género, objetivo, experiencia, equipamiento, unidades).
   - Crea el perfil, las preferencias, el TDEE inicial, el perfil de equipamiento, y opcionalmente sugiere un mesociclo template.

2. **Push Notifications**:
   - Endpoint `POST /api/v1/notifications/subscribe`: recibe la push subscription del frontend (endpoint, keys).
   - `NotificationService`: enviar notificaciones via web-push library.
   - Tipos: rest timer done (trigger desde frontend, no backend), training reminder (cron diario), deload suggestion, weight reminder, achievement unlocked.

3. **Cron jobs** (usando @nestjs/schedule):
   - Daily: evaluar si usuario debe registrar peso (no registró hoy y tiene la notificación habilitada).
   - Daily: evaluar deload para usuarios activos.

4. **Edge cases finales**:
   - Sesión sin finalizar: al iniciar nueva sesión, si hay una en progreso, preguntar (el backend retorna la sesión activa al GET /sessions/active).
   - Conversión de unidades: todas las veces que se guarda, se almacena en KG internamente. La conversión a LBS es solo de presentación.

5. **Revisión final de Swagger**:
   - Verificar que TODOS los endpoints tienen @ApiTags, @ApiOperation, @ApiResponse.
   - Verificar que TODOS los DTOs tienen @ApiProperty con ejemplo y tipo.

#### Testing:
- **Unit tests**: Onboarding service, notification service.
- **Integration tests**: Flujo de onboarding completo. Subscribe a push. GET /sessions/active edge cases.
- **Full regression**: Ejecutar TODOS los tests del backend. Cobertura > 80% global en application/ y domain/.
- **Architecture tests finales**: Verificar las reglas de Clean Architecture completas.

---

## 3. Fases del Frontend

### Fase FE-1: Scaffolding y Configuración Base

**Objetivo**: Crear el proyecto Next.js con toda la config base: TailwindCSS, shadcn/ui, i18n, PWA (Service Worker), tema oscuro/claro, layout principal. Al finalizar, la app compila, tiene el shell visual, y es instalable como PWA.

**Commits esperados**: 4-6

#### Tareas:

1. **Inicializar proyecto**:
   - `npx create-next-app@latest muscula-web --typescript --tailwind --eslint --app --src-dir`
   - Configurar TypeScript strict: `"strict": true, "noImplicitAny": true`.
   - Instalar y configurar: `pnpm add -D prettier eslint-config-prettier`.
   - `.prettierrc` y `.eslintrc` según estándares.

2. **Instalar dependencias core**:
   - `pnpm dlx shadcn@latest init` → configurar tema oscuro con los colores de doc 04.
   - Instalar componentes shadcn/ui iniciales: Button, Input, Card, Dialog, Sheet, Tabs, Progress, Badge, Select, Toast (sonner), Label, Form.
   - `pnpm add recharts dexie dexie-react-hooks lucide-react next-themes`
   - `pnpm add -D @playwright/test`

3. **Crear estructura de carpetas**:
   ```
   src/
   ├── app/
   │   ├── (auth)/
   │   │   ├── login/page.tsx
   │   │   ├── register/page.tsx
   │   │   └── layout.tsx
   │   ├── (main)/
   │   │   ├── dashboard/page.tsx
   │   │   ├── training/
   │   │   ├── exercises/
   │   │   ├── nutrition/
   │   │   ├── body/
   │   │   ├── analytics/
   │   │   ├── academy/
   │   │   ├── settings/
   │   │   └── layout.tsx (con BottomNav)
   │   ├── onboarding/page.tsx
   │   ├── share/[code]/page.tsx
   │   ├── layout.tsx (root: ThemeProvider, AuthProvider, i18n)
   │   └── manifest.ts
   │── features/
   │── shared/
   │   ├── components/ui/
   │   ├── hooks/
   │   ├── lib/
   │   ├── types/
   │   └── constants/
   │── i18n/
   └── public/
   ```

4. **Configurar tema con variables CSS**:
   - Implementar las paletas completas definidas en doc 04, sección 1.1.
   - Configurar `next-themes` con ThemeProvider: default 'dark', enableSystem: true.
   - Extender tailwind.config.ts con los colores custom del dominio (rir-*, volume-*, muscle-*, macro-*).

5. **Configurar internacionalización (i18n)**:
   - Usar `next-intl` o similar.
   - Crear `src/i18n/es.json` y `src/i18n/en.json` con las traducciones base del shell.
   - Configurar middleware para detección de idioma.

6. **Layout principal**:
   - Root layout: `<ThemeProvider>` → `<AuthProvider>` → `<I18nProvider>` → children.
   - Auth layout (sin bottom nav, centrado vertical).
   - Main layout: Header (optional, per-page) + Content (scrollable) + BottomNav (fixed).
   - BottomNav: 5 tabs con iconos Lucide (Home, Dumbbell, Timer, BarChart3, User).
   - Responsive: < 1024px = BottomNav. ≥ 1024px = Sidebar izquierda.

7. **Configurar PWA**:
   - Crear `src/app/manifest.ts`: nombre, iconos, theme_color, background_color, display: 'standalone'.
   - Configurar Service Worker con `next-pwa` o Workbox manual.
   - Precache: shell HTML, CSS, JS bundles.
   - Runtime cache: API responses con NetworkFirst strategy para datos mutables, CacheFirst para datos estáticos (ejercicios, artículos).

8. **Configurar API Client**:
   - `src/shared/lib/api-client.ts`: wrapper de fetch con:
     - Inyección automática de Authorization header desde AuthContext.
     - Refresh automático de token en 401 responses.
     - Base URL configurable.
     - Tipado genérico: `api.get<T>(url): Promise<T>`.
     - Serialización/deserialización JSON con validación de respuesta.

9. **Configurar IndexedDB (Dexie.js)**:
   - `src/shared/lib/indexed-db.ts`: definir schema de Dexie para datos offline.
   - Tablas: pendingOperations, cachedMesocycle, cachedExercises, cachedSessions.
   - `src/shared/lib/sync-manager.ts`: lógica de replay de pending operations al detectar online.

10. **Configurar hooks base**:
    - `useAuth()`: token, user, login(), logout(), isAuthenticated.
    - `useOffline()`: isOnline, lastSyncedAt.
    - `useSync()`: pendingCount, syncNow(), isSyncing.
    - `useTheme()`: theme, setTheme().

#### Testing:
- Verificar que `pnpm build` compila sin errores.
- Verificar que la PWA es instalable (manifest válido).
- Verificar tema oscuro y claro toggle.
- Verificar BottomNav navegación entre páginas.
- Playwright: smoke test — la app carga, el shell es visible.

---

### Fase FE-2: Autenticación y Onboarding

**Objetivo**: Páginas de login, registro, forgot password, reset password, y wizard de onboarding. Al finalizar, un usuario puede registrarse e iniciar sesión con persistencia del token.

**Commits esperados**: 4-6

#### Tareas:

1. **Páginas de auth**:
   - `/login`: formulario email + password. Link a registro y forgot password. Botón submit → llama a API → almacena token en AuthContext → redirige a onboarding (si primer login) o dashboard.
   - `/register`: formulario email + password + username. Validaciones inline (min length, regex, available check con debounce). Submit → register → auto login → onboarding.
   - `/forgot-password`: formulario con email. Submit → mostrar "Si el email existe, recibirás un enlace".
   - `/reset-password?token=xxx`: formulario nueva contraseña. Submit → redirige a login.

2. **AuthContext/Provider**:
   - Almacenar access token en memory (no localStorage por seguridad).
   - Refresh token en httpOnly cookie (manejado por el backend).
   - Interceptar 401 → intentar refresh → si falla → logout.
   - Persistir info mínima del user en localStorage para UX (username, avatar).
   - AuthGuard wrapper para rutas protegidas: redirige a /login si no autenticado.

3. **Onboarding Wizard** (`/onboarding`):
   - Paso 1: Datos personales (peso, altura, fecha de nacimiento, género).
   - Paso 2: Objetivo (hipertrofia/fuerza/resistencia/recomposición) — cards seleccionables.
   - Paso 3: Nivel de experiencia (principiante/intermedio/avanzado) — cards con descripción.
   - Paso 4: Equipamiento disponible (selección múltiple de equipment types).
   - Paso 5: Preferencias (unidades kg/lbs, idioma).
   - Barra de progreso arriba: paso X de 5.
   - Botón "Saltar" en cada paso no esencial.
   - Al completar: POST /users/me/onboarding → redirige a dashboard.

4. **Componentes**:
   - NumberInput custom: input numérico con botones +/- a los lados (para peso, altura).
   - StepIndicator: barra de progreso del wizard.

#### Testing:
- Playwright: flujo completo de registro → onboarding → llegar a dashboard.
- Playwright: login → dashboard.
- Playwright: login con credenciales incorrectas → error visible.

---

### Fase FE-3: Ejercicios y Equipamiento

**Objetivo**: Página de directorio de ejercicios con búsqueda/filtro, ficha de detalle, y gestión de perfiles de equipamiento. Al finalizar, se explora el catálogo completo.

**Commits esperados**: 3-5

#### Tareas:

1. **Página de ejercicios** (`/exercises`):
   - Barra de búsqueda con debounce (300ms).
   - Filtros colapsables: por grupo muscular (chips multi-select), por patrón de movimiento, por equipamiento, por dificultad.
   - Lista paginada (infinite scroll o load more).
   - ExerciseCard: GIF thumbnail, nombre, badges de músculos y equipamiento.
   - Empty state si no hay resultados.

2. **Detalle de ejercicio** (`/exercises/[id]`):
   - Header: nombre + dificultad badge.
   - GIF/Video loop (lazy load con placeholder skeleton).
   - Diagrama muscular (SVG estático, músculos primarios y secundarios coloreados).
   - Secciones expandibles: Setup, Ejecución, Errores Comunes, Variaciones.
   - Sección "Tu historial": última vez, mejor 1RM, mini gráfico de progresión (si hay datos).

3. **Perfiles de equipamiento** (en `/settings/equipment`):
   - Lista de perfiles con botón "Activar".
   - Crear perfil: nombre + selección de equipamiento (grid de chips).
   - Editar/eliminar perfil.
   - Indicador de perfil activo en el header.

4. **Componentes custom**:
   - MuscleChip: chip con color del grupo muscular.
   - EquipmentGrid: grid de iconos de equipamiento seleccionables.

#### Testing:
- Playwright: búsqueda de ejercicio → resultados visibles. Filtrar por músculo → resultados filtrados. Ver detalle.

---

### Fase FE-4: Mesociclos y Planificación

**Objetivo**: CRUD de mesociclos con editor visual de días y ejercicios. Al finalizar, el usuario puede crear y gestionar sus planes de entrenamiento.

**Commits esperados**: 4-6

#### Tareas:

1. **Lista de mesociclos** (`/training/mesocycles`):
   - Cards por mesociclo: nombre, objetivo, semanas, status badge (draft/active/completed).
   - Mesociclo activo destacado visualmente (borde primario).
   - Acciones: Activar, Duplicar, Eliminar.
   - Botón "Crear Mesociclo" prominente.
   - Empty state para usuarios nuevos con CTA.

2. **Crear/Editar mesociclo** (`/training/mesocycles/new` y `/training/mesocycles/[id]/edit`):
   - Paso 1: Info general (nombre, duración semanas, objetivo, incluir deload).
   - Paso 2: Configurar días (agregar/eliminar/reordenar días).
   - Para cada día:
     - Nombre del día (input).
     - Lista de ejercicios (agregar desde buscador de ejercicios).
     - Cada ejercicio: target sets, reps min-max, RIR, tempo (colapsable), superset toggle, notas de setup.
     - Drag & drop para reordenar ejercicios (dnd-kit o similar).
   - Vista previa del mesociclo antes de guardar.
   - Guardar → redirige a detalle.

3. **Detalle de mesociclo** (`/training/mesocycles/[id]`):
   - Resumen: nombre, objetivo, semanas, status.
   - Tabs o lista de días con ejercicios visibles.
   - Botones: Activar, Completar, Duplicar, Compartir, Editar (solo si DRAFT).

4. **Componentes custom**:
   - ExerciseSearchModal: sheet desde abajo con buscador inline de ejercicios.
   - DraggableExerciseList: lista reordenable.
   - SetConfigRow: inputs de sets, reps, RIR en una fila compacta.

#### Testing:
- Playwright: crear mesociclo completo con 2 días y 3 ejercicios cada uno. Verificar persistencia. Activar. Duplicar.

---

### Fase FE-5: Sesión de Entrenamiento en Vivo (Tracking Core)

**Objetivo**: Pantalla de tracking en vivo con registro de series, temporizador, calentamiento, sustitución, readiness, calculadora de discos. AL finalizar, esta es la funcionalidad estrella operativa end-to-end.

**Commits esperados**: 7-10

#### Tareas:

1. **Iniciar sesión** (`/training/session`):
   - Si hay sesión activa: preguntar "Tenés una sesión sin terminar. ¿Continuar o descartar?"
   - Si no hay sesión: mostrar el próximo día del mesociclo activo como sugerencia. Botón "Iniciar Sesión".
   - Opción: iniciar sesión vacía (sin mesociclo vinculado).

2. **Readiness Modal**:
   - Se muestra al iniciar sesión (opcional, botón "Saltar").
   - 3 preguntas con emojis (1-5): sueño, estrés, DOMS.
   - Submit → backend calcula y almacena el score.

3. **Pantalla de tracking en vivo**:
   - Cronómetro de sesión (arriba a la derecha, siempre visible).
   - Lista de ejercicios en orden con:
     - Nombre del ejercicio + historial último (inline reference).
     - Sugerencia de peso (resaltada).
     - WarmupSets colapsables (generados automáticamente, botón "Generar calentamiento").
     - WorkingSet rows: cada fila es `[#] [Peso +-] [Reps +-] [RIR select] [✓ check]`.
       - Peso: NumberInput con incrementos de 0.5/1 kg. Pre-rellenado con sugerencia.
       - Reps: NumberInput. Pre-rellenado con target del plan.
       - RIR: Select dropdown (0, 1, 2, 3, 4, 5+). Pre-rellenado con target.
       - Check: al tocar, marca serie como completada → activar animación → iniciar temporizador.
     - Botón "📝 Nota" por serie (abre input inline o mini modal).
     - Botón "+ Serie" al final de cada ejercicio.
   - Botones de contexto: "Sustituir" (abre modal de sustitución), "Calculadora ⚖️" (abre calculadora de discos).

4. **Rest Timer Overlay**:
   - Se activa automáticamente al completar una serie.
   - Overlay fijo en la parte inferior (entre content y bottom nav).
   - Muestra: tiempo transcurrido / tiempo total, barra de progreso.
   - Botones: Pausar, Reiniciar, Saltar (+30s / -30s).
   - Vibración + animación al llegar a 30s antes del fin y al terminar.
   - Al terminar: se oculta suavemente.

5. **Calculadora de Discos Modal**:
   - Input: peso total deseado.
   - Config: peso de barra (selectable: 20, 15, 10 kg o custom).
   - Config: discos disponibles (del perfil de equipamiento del usuario).
   - Output: SVG de la barra con discos visuales a cada lado (colores por peso).
   - Si peso inexacto: mostrar peso alcanzable más cercano.

6. **Sustitución de Ejercicio Modal**:
   - Lista de sustitutos (mismos patrón + músculo, filtrados por equipamiento activo).
   - Cada sustituto muestra: nombre, equipamiento, dificultad.
   - Al seleccionar: reemplaza en la sesión, muestra toast "Ejercicio sustituido".

7. **Finalizar sesión**:
   - Botón "Finalizar Entrenamiento" al final de la lista.
   - Modal de confirmación con: resumen de la sesión (ejercicios, series totales, duración), input de nota de sesión (opcional).
   - Submit → POST /sessions/:id/complete → redirige a historial o dashboard.

8. **Modo Offline**:
   - Toda la lógica de tracking funciona con IndexedDB si offline.
   - Las series se guardan localmente.
   - Al recuperar conexión → SyncManager replay.
   - Indicador de estado offline visible.

#### Testing:
- Playwright: flujo completo end-to-end — iniciar sesión → readiness → completar 3 series de un ejercicio → completar sesión → verificar en historial.
- Playwright: temporizador de descanso funciona.
- Playwright: sustitución de ejercicio.
- Playwright: calculadora de discos.
- Test offline: simular offline → registrar serie → simular online → verificar sync.

---

### Fase FE-6: Nutrición y Composición Corporal

**Objetivo**: Diario de comidas, búsqueda de alimentos, macros dashboard, tracking de peso y medidas, galería de progreso.

**Commits esperados**: 5-7

#### Tareas:

1. **Nutrición diaria** (`/nutrition`):
   - Header con anillo circular de calorías (consumidas/objetivo).
   - Mini barras de macros debajo (P, C, G con colores custom).
   - Secciones por comida (Desayuno, Almuerzo, etc.) con botón "+ Agregar" cada una.
   - Cada FoodEntry: nombre, calorías, botón eliminar (swipe o icon).
   - Navegación por fecha: flechas izq/der + selector de fecha.

2. **Modal de búsqueda de alimentos**:
   - Sheet desde abajo.
   - Input de búsqueda con debounce.
   - Resultados paginados: nombre, marca, calorías per 100g.
   - Al seleccionar: input de cantidad (g/ml) → calcular macros proporcionalmente → agregar.
   - Botón de escáner de código de barras (usar API de cámara del navegador si disponible).
   - Tab "Recientes" con últimos 20 alimentos.
   - Tab "Crear personalizado" con formulario manual de macros.

3. **TDEE Display**:
   - Card en el dashboard de nutrición: "Tu TDEE: ~2,450 kcal/día".
   - Badge de confianza: "Estimado" (gris), "Calibrando" (amarillo), "Preciso" (verde).
   - Tooltip explicativo breve.

4. **Body Mode Selector**:
   - En settings de nutrición: radio buttons/cards para Volumen/Definición/Mantenimiento/Recomposición.
   - Al cambiar: recalcular targets de macros, mostrar nuevos valores.

5. **Body Metrics** (`/body`):
   - Peso corporal: input diario. Card con peso actual + tendencia (flecha arriba/abajo + delta).
   - Gráfico de peso: puntos diarios + línea de media móvil 7 días (Recharts).
   - Medidas: formulario con campos por zona corporal. Frecuencia menor (semanal/quincenal).
   - Gráficos de tendencia por medida.

6. **Galería de Progreso** (`/body/photos`):
   - Grid de fotos por fecha.
   - Subir foto: seleccionar categoría (frontal/lateral/trasero) + fecha.
   - Comparador lado a lado: seleccionar 2 fechas → mostrar misma categoría juntas.

#### Testing:
- Playwright: agregar alimento a una comida → macros actualizados.
- Playwright: registrar peso → visible en gráfico.
- Playwright: subir foto de progreso.

---

### Fase FE-7: Analíticas y Dashboard

**Objetivo**: Dashboard principal, volumen tracker, heatmap muscular, gráficos de fuerza y tonelaje, PRs, correlaciones.

**Commits esperados**: 5-7

#### Tareas:

1. **Dashboard Home** (`/dashboard`):
   - Card "Próximo Entrenamiento" con CTA.
   - Mini cards: peso de hoy, TDEE, calorías consumidas.
   - Mini volumen tracker (barras horizontales resumidas).
   - Mini heatmap (SVG del cuerpo humano reducido).

2. **Volume Dashboard** (`/analytics`):
   - Gráfico de barras horizontales por grupo muscular.
   - Cada barra: coloreada según zona (verde/amarillo/rojo vs MEV/MRV).
   - Tocar barra → expandir: desglose de ejercicios y sesiones que contribuyeron.
   - Alerta visual si algún grupo está en rojo por 2+ semanas.
   - Sugerencia de deload con botón "Ver recomendación".

3. **Muscle Heatmap** (`/analytics/heatmap`):
   - SVG del cuerpo humano (frontal y posterior) con regiones interactivas.
   - Colores degradados según recencia de entrenamiento (rojo → naranja → amarillo → verde → gris).
   - Tocar músculo → sheet con info: última vez, series semana, próximo día planificado.
   - Leyenda de colores.

4. **Strength Trends** (`/analytics/strength`):
   - Selector de ejercicio.
   - Gráfico de línea: 1RM estimado a lo largo del tiempo (Recharts Line chart).
   - Selector de periodo: 30d, 90d, 180d, 1y, todo.
   - Tabla de PRs: best 1RM, best set, best volume session.

5. **Correlaciones** (optional views in analytics):
   - Peso corporal vs. 1RM (scatter plot).
   - Volumen semanal vs. readiness (scatter plot).

6. **Componentes custom**:
   - MuscleHeatmapSvg: SVG con regiones definidas, props de colores dinámicos.
   - WeeklyVolumeBar: barra horizontal con zonas coloreadas y label.
   - OneRmChart: wrapper de Recharts Line.
   - MacroRing: anillo circular con porcentaje (SVG o canvas).

#### Testing:
- Playwright: navegar a analytics → volumen visible con datos. Heatmap renderiza. Gráficos cargan.
- Componentes: unit tests para MuscleHeatmapSvg (props → colores correctos).

---

### Fase FE-8: Academia, Import/Export, Social, Settings

**Objetivo**: Artículos de academia, importación/exportación, compartir rutinas, logros, y página de settings. Al finalizar, la app está completa.

**Commits esperados**: 4-6

#### Tareas:

1. **Academia** (`/academy`):
   - Lista de artículos: cards con título, resumen, categoría badge, tiempo de lectura.
   - Filtro por categoría.
   - Detalle de artículo: contenido rendered (Markdown o rich text), botón "Ver Fuentes" → drawer con referencias bibliográficas.

2. **Import/Export** (`/settings/data`):
   - Exportar: botón "Exportar mis datos" → loading → link de descarga.
   - Importar: seleccionar archivo CSV + source (Strong/Hevy) → preview (tabla con ejercicios mapeados y no mapeados) → confirmar → resultado (importados/skipped/errores).

3. **Compartir rutinas**:
   - En el detalle de mesociclo: botón "Compartir" → genera código → modal con código copyable y URL.
   - Ruta pública `/share/[code]`: vista resumida del mesociclo (días + ejercicios) con botón "Importar" (requiere login).

4. **Logros** (`/settings/achievements`):
   - Grid de Achievement cards: icono, título, descripción.
   - Desbloqueados: a color. Bloqueados: greyscale + texto "Aún no desbloqueado".
   - Toast de celebración al desbloquear (confetti animación sutil).

5. **Settings** (`/settings`):
   - Perfil: editar datos personales, avatar.
   - Preferencias: unidades, idioma, tema, tiempos de descanso, notificaciones.
   - Equipamiento: gestión de perfiles.
   - Datos: import/export.
   - Cuenta: cambiar contraseña, eliminar cuenta (con confirmación).

#### Testing:
- Playwright: ver artículo → sección de fuentes visible.
- Playwright: exportar datos.
- Playwright: compartir mesociclo → copiar código.

---

### Fase FE-9: PWA, Offline, Notificaciones, y Pulimiento Final

**Objetivo**: Asegurar que la PWA funciona perfectamente offline, notificaciones push configuradas, estados vacíos, loading states, animaciones, y QA final.

**Commits esperados**: 4-6

#### Tareas:

1. **Refinar PWA / Service Worker**:
   - Verificar: precache de assets estáticos.
   - Verificar: runtime cache de API responses (NetworkFirst).
   - Verificar: Background Sync para mutaciones offline.
   - Verificar: indicador de estado online/offline.
   - Test: poner en modo avión → navegar → registrar series → reconectar → sync.

2. **Push Notifications**:
   - Solicitar permiso (no en el primer load, sino contextualmente: antes de iniciar primera sesión o en settings).
   - Registrar subscription en backend.
   - Manejar: notification click → abrir la app en la vista correcta.

3. **Empty states**:
   - Cada pantalla sin datos: ilustración (puede ser un icono Lucide grande) + texto explicativo + CTA.
   - Verificar: dashboard vacío, mesociclos vacíos, historial vacío, ejercicios sin resultados, nutrición sin comidas, analytics sin datos.

4. **Loading states**:
   - Skeletons en todas las páginas con datos asíncronos.
   - Shimmer animation en skeletons.
   - Spinner en botones durante submit.

5. **Animaciones** (según doc 04, sección 3.2):
   - Transiciones de página (slide).
   - Bounce al completar serie.
   - Fade en heatmap.
   - Toast slide up.

6. **Accessibility audit**:
   - Verificar todos los inputs tienen labels.
   - Verificar contraste ≥ 4.5:1.
   - Verificar keyboard navigation en todos los flujos críticos.
   - Verificar focus visible en todos los elementos interactivos.
   - Verificar alt text en imágenes.

7. **Responsive audit**:
   - Verificar en 360px, 390px, 414px (mobile).
   - Verificar en 768px (tablet).
   - Verificar en 1024px+ (desktop con sidebar).

8. **Performance audit**:
   - Lighthouse: target ≥ 90 en Performance, Accessibility, Best Practices, PWA.
   - Bundle analysis: verificar code splitting por ruta.
   - Lazy load de componentes pesados (gráficos, calculadora de discos).

#### Testing:
- Playwright: flujo offline completo.
- Lighthouse CI: verificar scores.
- Accessibility tests: verificar con axe-playwright.
- Full regression: todos los tests de las fases anteriores siguen pasando.

---

## 4. Checklist de Compliance por Fase

Esta checklist se ejecuta al final de CADA fase. Si algún ítem falla, se corrige ANTES de avanzar.

### 4.1 Backend Compliance Checklist

```
ARQUITECTURA:
[ ] domain/ NO importa de application/ ni infrastructure/ ni ningún framework externo
[ ] application/ NO importa de infrastructure/
[ ] infrastructure/ implementa interfaces definidas en application/
[ ] Controllers NO dependen de secondary-adapters directamente
[ ] Comunicación cross-layer vía interfaces con Tokens de DI

TIPADO:
[ ] NO existe ningún uso de `any` en todo el código
[ ] Todos los Request DTOs usan class-validator + class-transformer
[ ] Todos los Request DTOs tienen método toEntity()
[ ] Todos los Response DTOs tienen método estático fromEntity()
[ ] DB entities (Prisma) NUNCA se retornan directamente — siempre se mapean

API:
[ ] HTTP methods correctos (GET para lectura, POST para creación, etc.)
[ ] Status codes correctos (201 para creación, 204 para delete, etc.)
[ ] Todas las colecciones están paginadas (PaginatedResponse)
[ ] Custom domain errors existen para cada caso de error de negocio
[ ] Global Exception Filter mapea domain errors a HTTP status codes
[ ] NO hay catch blocks vacíos (nunca swallow exceptions)

SWAGGER:
[ ] Todos los controllers tienen @ApiTags()
[ ] Todos los endpoints tienen @ApiOperation({ summary })
[ ] Todos los endpoints tienen @ApiResponse (éxito + errores posibles)
[ ] Todas las propiedades de DTOs tienen @ApiProperty() con type, description, example

OBSERVABILIDAD:
[ ] Global Logging Interceptor registra method, url, userId, duration, status
[ ] NUNCA se loguea: passwords, tokens, PII
[ ] Health check en /api/v1/health funciona y reporta estado de DB

SEGURIDAD:
[ ] process.env NUNCA se lee directamente — siempre @nestjs/config
[ ] ValidationPipe global con whitelist: true, forbidNonWhitelisted: true
[ ] CORS configurado con orígenes explícitos
[ ] Helmet habilitado
[ ] Rate limiting configurado
[ ] JWT Guard protege todos los endpoints excepto @Public()
[ ] Row-level security: cada query filtra por userId del token
[ ] Contraseñas hasheadas con bcrypt (cost >= 12)

CONVENCIONES:
[ ] camelCase para variables y funciones
[ ] PascalCase para clases e interfaces
[ ] SCREAMING_SNAKE_CASE para constantes globales
[ ] Controllers < 80 líneas
[ ] Services < 200 líneas
[ ] Prettier + ESLint pasa sin errores

TESTING:
[ ] Unit tests para domain/entities y application/services
[ ] Integration tests para todos los endpoints nuevos
[ ] Cobertura > 80% en las capas domain + application
[ ] Tests de arquitectura verifican boundaries
[ ] Todos los tests pasan (0 failures)
```

### 4.2 Frontend Compliance Checklist

```
ARQUITECTURA:
[ ] Feature-based folders con tests colocados
[ ] Separación UI / state / data access
[ ] Datos de API validados en el boundary (parseo/validación al recibir)
[ ] Unidirectional data flow

TIPADO:
[ ] NO existe ningún uso de `any`
[ ] TypeScript strict habilitado
[ ] Todos los API responses tienen tipos definidos

UI/UX:
[ ] HTML semántico (header, main, nav, section, article)
[ ] Todos los inputs tienen labels visibles
[ ] Contraste >= 4.5:1
[ ] Keyboard navigation funciona en flujos críticos
[ ] Focus visible en todos los elementos interactivos
[ ] Responsive: mobile (360-428px), tablet (640-1023px), desktop (1024px+)
[ ] Empty states para todas las pantallas sin datos
[ ] Loading states (skeletons) para todas las cargas asíncronas
[ ] Error states con mensajes claros y acción de retry

PWA:
[ ] Manifest válido
[ ] Service Worker registrado
[ ] App es instalable
[ ] Funciona offline para funcionalidades cacheadas
[ ] Background sync para mutaciones offline
[ ] Indicadores de estado online/offline

PERFORMANCE:
[ ] Code splitting por ruta
[ ] Lazy load de componentes pesados
[ ] Imágenes optimizadas
[ ] Lighthouse Performance >= 90

SEGURIDAD:
[ ] No hay secrets en código frontend
[ ] Input sanitizado donde necesario
[ ] Tokens no en localStorage (access en memory, refresh en httpOnly cookie)

TESTING:
[ ] Integration tests (Playwright) para flujos críticos
[ ] Unit tests para lógica compleja (formularios, cálculos)
[ ] Prettier + ESLint pasa sin errores
[ ] Todos los tests pasan
```

---

## 5. Estrategia de Testing

### 5.1 Backend

| Tipo | Ubicación | Framework | Target |
|---|---|---|---|
| **Unit** | `test/unit/` | Jest + ts-jest | domain/entities, application/services. Mocks para repos y external clients. |
| **Integration** | `test/integration/` | Jest + Supertest | API endpoints end-to-end contra DB real (testcontainers o DB de test). |
| **Architecture** | `test/architecture/` | tsarch o custom import scanner | Verificar reglas de dependencia entre capas. |
| **Cobertura** | — | Jest --coverage | > 80% en domain/ y application/. |

### 5.2 Frontend

| Tipo | Ubicación | Framework | Target |
|---|---|---|---|
| **E2E / Integration** | `tests/e2e/` | Playwright | Flujos de usuario completos: registro, tracking, nutrición, analytics. |
| **Component Unit** | Colocados en features/ | Vitest + React Testing Library | Componentes complejos, hooks con lógica. |
| **Accessibility** | Dentro de e2e/ | axe-playwright | WCAG 2.1 AA compliance. |
| **Performance** | CI | Lighthouse CI | Scores ≥ 90 en todas las categorías. |

---

## 6. Convenciones de Git

### 6.1 Branching

Para este proyecto (single developer/agent), se trabaja sobre `main` con commits frecuentes y tags por fase. Si se desea, se puede crear un branch por fase:

- `main`: branch principal.
- Tags: `phase-BE-1`, `phase-BE-2`, ..., `phase-FE-1`, `phase-FE-2`, ...

### 6.2 Commit Messages

Conventional Commits obligatorio:

```
feat: add mesocycle creation endpoint
fix: handle null readiness score in weight suggestion
refactor: move TDEE calculation to domain service
test: add integration tests for nutrition endpoints
chore: configure Prisma seed script
docs: update API contracts in Swagger
```

### 6.3 Push Points

| Momento | Acción |
|---|---|
| Al completar cada fase con compliance 100% | `git push origin main` |
| Al completar cada fase | `git tag phase-XX-N` + `git push origin main --tags` |
| Hotfix crítico entre fases | Push inmediato con tag `hotfix-XX` |

### 6.4 Orden de Implementación Global

```
BE-1 → BE-2 → BE-3 → BE-4 → BE-5 → BE-6 → BE-7 → BE-8 → BE-9
                                                                 │
FE-1 → FE-2 → FE-3 → FE-4 → FE-5 → FE-6 → FE-7 → FE-8 → FE-9
```

**Nota**: El frontend puede comenzar en paralelo al backend a partir de FE-1 (scaffolding no depende del backend). Sin embargo, las funcionalidades de FE que consumen API (FE-2 en adelante) requieren que la fase BE correspondiente esté completa. Específicamente:

| Fase Frontend | Requiere Backend |
|---|---|
| FE-1 | Ninguno |
| FE-2 | BE-1 + BE-2 |
| FE-3 | BE-3 |
| FE-4 | BE-4 |
| FE-5 | BE-5 |
| FE-6 | BE-6 |
| FE-7 | BE-7 |
| FE-8 | BE-8 + BE-9 |
| FE-9 | Todo el backend |

---

## 7. Backlog de Mejoras Post-v1.0 (v1.1+)

Las siguientes funcionalidades y mejoras están fuera del scope de v1.0 pero se consideran valiosas para iteraciones posteriores. Se documentan aquí para que no se pierdan y para facilitar la priorización futura.

### 7.1 Funcionalidades Nuevas Propuestas

#### BL-001: Plantillas de Mesociclo Predefinidas (Prioridad: Alta)

| Campo | Valor |
|---|---|
| **Descripción** | El sistema debería incluir un catálogo de mesociclos plantilla diseñados por nivel de experiencia y objetivo. Al completar el onboarding, se sugiere una plantilla automáticamente. |
| **Justificación** | El usuario principiante (STK-02) no sabe diseñar un mesociclo. Sin plantillas, el onboarding es un callejón sin salida. Los usuarios avanzados también las valoran como punto de partida. |
| **Scope estimado** | Backend: seed de 8-12 plantillas. Service: `getRecommendedTemplate(experience, objective)`. Frontend: selector de plantillas en onboarding (paso 6 post-equipamiento). |
| **Dependencias** | BE-4 (Mesocycles), BE-9 (Onboarding) |

#### BL-002: Historial de Sesiones con Vista de Calendario (Prioridad: Alta)

| Campo | Valor |
|---|---|
| **Descripción** | Vista de calendario mensual con indicadores visuales de días entrenados (puntos/colores según tipo de entrenamiento). Tap en un día muestra las sesiones de ese día. |
| **Justificación** | RF-EN-012 especifica esta vista pero no hay endpoint dedicado. El frontend necesita un endpoint `GET /sessions/calendar?month=YYYY-MM` que retorne un mapa `{date: sessionSummary[]}`. |
| **Scope estimado** | Backend: endpoint de calendario con aggregación por día. Frontend: componente Calendar con dots colored por grupo muscular dominante. |
| **Dependencias** | BE-5 (Sessions) |

#### BL-003: Búsqueda Global Unificada (Prioridad: Media)

| Campo | Valor |
|---|---|
| **Descripción** | Barra de búsqueda global que busca simultáneamente en ejercicios, artículos, sesiones pasadas y notas. Feedback instantáneo con categorías de resultados. |
| **Justificación** | La navegación por módulos obliga al usuario a saber exactamente dónde está lo que busca. Una búsqueda global reduce fricción significativamente, especialmente para notas y sesiones históricas. |
| **Scope estimado** | Backend: `GET /search?q=...` con resultados agrupados por tipo. Frontend: SearchBar component en el header. |
| **Dependencias** | Todos los módulos de lectura |

#### BL-004: Streaks y Consistencia (Prioridad: Media)

| Campo | Valor |
|---|---|
| **Descripción** | Tracking de "rachas" de entrenamiento y nutrición: días consecutivos con sesión registrada, días consecutivos con comidas registradas, semanas sin faltar al plan. Se integra con el sistema de logros existente. |
| **Justificación** | La consistencia es el factor #1 de resultados. Visualizarla motiva la adherencia al programa. Se complementa con los achievements existentes. |
| **Scope estimado** | Backend: `GET /users/me/streaks` con cálculo de rachas actuales y mejores. Achievement conditions nuevas. Frontend: widget en dashboard. |
| **Dependencias** | BE-5, BE-6, BE-8 (Achievements) |

#### BL-005: Estimación de Tiempo de Sesión (Prioridad: Media)

| Campo | Valor |
|---|---|
| **Descripción** | Al planificar un mesociclo o antes de iniciar una sesión, mostrar una estimación del tiempo total basada en: número de series × tiempo promedio por serie (del historial del usuario) + descansos configurados. |
| **Justificación** | El usuario quiere saber "¿cuánto me va a llevar hoy?" antes de ir al gym. Es información de alto valor con bajo costo de implementación. |
| **Scope estimado** | Backend: método en `TrainingSessionService`. Frontend: badge de duración estimada en la pantilla del día. |
| **Dependencias** | BE-5 |

#### BL-006: Modo "Quick Log" (Prioridad: Media)

| Campo | Valor |
|---|---|
| **Descripción** | Modo alternativo de registro rápido: en lugar de seguir la plantilla del mesociclo, el usuario selecciona ejercicios ad-hoc y registra series. Para sesiones no planificadas (cardio, stretching, o entrenamientos improvisados). |
| **Justificación** | No todos los entrenamientos siguen el mesociclo. Si el usuario no puede registrar un entrenamiento fuera de plan, pierde datos o deja de usar la app. |
| **Scope estimado** | Backend: ya soportado parcialmente (sesión sin mesocycle vinculado). Frontend: flujo alternativo de inicio de sesión. |
| **Dependencias** | BE-5 |

#### BL-007: Notas de Ejercicio Persistentes (Prioridad: Baja)

| Campo | Valor |
|---|---|
| **Descripción** | Notas permanentes a nivel de ejercicio (no de serie/sesión): "En este gym, la polea alta está al lado de la ventana", "Usar agarre D para este ejercicio". Se muestran siempre que aparece ese ejercicio en una sesión. |
| **Justificación** | Las notas de serie son efímeras. Un setup tip que aplica siempre debería persistir a nivel de ejercicio-usuario. |
| **Scope estimado** | Backend: `PATCH /exercises/:id/user-notes`. Frontend: input en la ficha del ejercicio. |
| **Dependencias** | BE-3 |

#### BL-008: Integración con Google Fit (Prioridad: Baja)

| Campo | Valor |
|---|---|
| **Descripción** | Importar pasos diarios y calorías activas estimadas desde Google Fit vía OAuth2 REST API. Los datos alimentan el cálculo de TDEE como factor de actividad real. |
| **Justificación** | RF-NU-006 lo define como SHOULD. Mejora la precisión del TDEE al usar actividad real en lugar de un factor estático. |
| **Scope estimado** | Backend: `GoogleFitClient` implementando `IHealthApiClient`. Endpoint OAuth2 flow. Frontend: settings de integración. |
| **Dependencias** | BE-6 |

#### BL-009: Modo Coach / Entrenador Personal (Prioridad: Baja — v2)

| Campo | Valor |
|---|---|
| **Descripción** | Un coach puede crear mesociclos para clientes, ver su progreso en un dashboard dedicado, y recibir alertas de adherencia. |
| **Justificación** | STK-03 lo define como stakeholder terciario. Es un diferenciador competitivo fuerte pero requiere modelo multi-tenant. |
| **Scope estimado** | Roles `COACH`/`ATHLETE`, relación coach-athlete, dashboard de coach, permissions model. Gran refactor. |
| **Dependencias** | Todo v1 completo |

#### BL-010: Exportación a PDF de Mesociclo (Prioridad: Baja)

| Campo | Valor |
|---|---|
| **Descripción** | Generar un PDF printable del mesociclo con la estructura de días, ejercicios, series objetivo, y espacio para anotar a mano. Para usuarios que prefieren papel en el gym como backup. |
| **Justificación** | Algunos usuarios intermedios/avanzados imprimen su programa como respaldo o para entrenar sin el teléfono. Bajo esfuerzo, alto valor percibido. |
| **Scope estimado** | Backend: endpoint `GET /mesocycles/:id/pdf`. Librería: PDFKit o puppeteer-html-to-pdf. |
| **Dependencias** | BE-4 |

### 7.2 Mejoras Técnicas Propuestas

| ID | Mejora | Prioridad | Justificación |
|---|---|---|---|
| TD-001 | Migrar cache in-memory a Redis cuando se escale | Baja | Actual cache per-instance es suficiente para single instance. Redis necesario para horizontal scaling. |
| TD-002 | Rate limiting por usuario (no solo por IP) | Media | Actualmente por IP. Usuarios detrás de NAT comparten límite. |
| TD-003 | Soft delete con cleanup job (GDPR compliance) | Media | Soft delete implementado. Falta job que purge datos después de 30 días de gracia. |
| TD-004 | Email service real (SendGrid/Resend free tier) | Alta | Actualmente el password reset loguea el token. Necesitamos email real para producción. |
| TD-005 | API versioning strategy | Baja | Actualmente `/api/v1/`. Definir estrategia cuando v2 sea necesario. |
| TD-006 | Database backup automático | Media | Depende del provider (Supabase/Neon lo incluyen). Verificar que esté activo. |
| TD-007 | CI/CD pipeline completo | Alta | Definir GitHub Actions: lint → test → build → deploy. |
| TD-008 | Monitoring y alertas básicas | Media | Health check existe. Falta alerting en caso de downtime. |
| TD-009 | Seed de 150+ ejercicios con media | Alta | Seed actual tiene ejercicios base. Completar hasta 150+ con GIFs/videos para producción. |
| TD-010 | Audit log para operaciones sensibles | Baja | Registrar cambios de password, eliminación de cuenta, exports de datos. |

### 7.3 Correcciones Detectadas en Documentación vs. Implementación

| Área | Discrepancia | Estado | Resolución |
|---|---|---|---|
| Architecture doc | Referenciaba NestJS 10+ | ✅ Corregido | Actualizado a NestJS 11 |
| project-context.md | Referenciaba NotiFinance | ✅ Corregido | Actualizado a Musculá con datos reales |
| Backend structure | `src/modules/` en prompts vs. `src/` real | Documentado | La estructura es `src/domain/`, `src/application/`, `src/infrastructure/` (no module-based) |
| Prisma version | SRS no especifica versión | Documentado | Prisma 6.16 en uso |
| Test framework | Plan dice Jest pero el proyecto usa Jest 30 | Documentado | Jest 30 + ts-jest 29 + Supertest 7 |

---

*Fin del Plan de Implementación. Versión 1.1 — 2026-02-28.*

*Fin del Plan de Implementación. Versión 1.0 — 2026-02-27.*
