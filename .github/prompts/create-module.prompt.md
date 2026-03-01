---
mode: agent
description: Genera un módulo backend completo siguiendo la arquitectura del proyecto (Clean/Hexagonal). Lee project-context.md para el framework y ORM actuales.
tools:
  - codebase
  - create_file
  - run_in_terminal
---

# Crear módulo backend

Crea un módulo backend completo para la funcionalidad: **[NOMBRE_DEL_MÓDULO]**

## Contexto obligatorio a leer primero

1. `.github/project-context.md` — framework, ORM, estructura de carpetas del proyecto
2. `.github/development_rules/01_architecture.md` — estructura de capas y reglas de dependencia
3. `.github/development_rules/02_typing_dtos_patterns.md` — tipado, DTOs, patrones
4. Buscar un servicio/entidad existente similar en `backend/src/` para mantener consistencia de estilo

## Qué debe generar

### 1. Domain layer (`backend/src/domain/`)
- Entidad de dominio en `entities/`: clase TypeScript pura con métodos de negocio relevantes
- Enum(s) en `enums/` si aplica: `PascalCase` nombre, `SCREAMING_SNAKE_CASE` valores
- Error(es) en `errors/`: clases extendiendo `Error` nativo

### 2. Application layer (`backend/src/application/`)
- Interface(s) del repositorio en `interfaces/` (`I<Nombre>Repository`) con tokens de inyección
- Servicio(s) de caso de uso en `services/` (< 200 líneas, fail-fast, early returns)

### 3. Infrastructure layer (`backend/src/infrastructure/`)
- Modelo en Prisma schema (`backend/prisma/schema.prisma`) con campos de auditoría (`createdAt`, `updatedAt`, `deletedAt`)
- Repositorio concreto en `secondary-adapters/` que implementa la interfaz
- Mapper integrado: `toEntity()` (DB → Domain) y `toPersistence()` (Domain → DB)
- Controller en `primary-adapters/` con:
  - DTOs de request (`class-validator` + método `toEntity()`)
  - DTOs de response (factory estático `fromEntity()`)
  - Decoradores Swagger: `@ApiTags`, `@ApiOperation`, `@ApiResponse`
  - < 80 líneas

### 4. Módulo NestJS / DI
- Módulo de persistencia en `secondary-adapters/` para registrar repositorios
- Módulo de feature en `primary-adapters/` con controller + wiring
- Registrar providers con tokens de inyección
- Exportar lo necesario para otros módulos

### 5. Tests
- Unit test del servicio en `backend/test/unit/services/` con todos los casos: ruta feliz, errores de dominio, casos límite
- E2E test en `backend/test/integration/` con Supertest
- Mocks de todas las dependencias

## Criterios de aceptación

- Sin `any`
- Pasa `npm run lint` y `npm run build` sin errores
- Separación de capas estricta (domain sin imports de framework)
- Swagger actualizado
- Test con cobertura del servicio > 80%
