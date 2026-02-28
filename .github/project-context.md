# Contexto del Proyecto — Musculá

> Este archivo define el contexto operativo real del repositorio para el agente.

## 1) Perfil del proyecto

- Nombre: `Musculá`
- Estado del repo actual: `backend NestJS implementado + documentación funcional/técnica completa`
- Stack implementado en código: `NestJS 11, TypeScript, Prisma ORM, PostgreSQL, Swagger, Jest`
- Stack objetivo de producto (según docs): `PWA mobile-first con frontend Next.js + backend NestJS + PostgreSQL`
- Estilo arquitectónico: `Clean/Hexagonal Architecture (backend)`
- Lenguaje principal: `TypeScript`

## 2) Fuentes de verdad (source of truth)

Orden de lectura recomendado:

1. `docs/01_SRS_Software_Requirements_Specification.md`
2. `docs/02_Architecture_System_Design.md`
3. `docs/03_Additional_Context_Domain_Knowledge.md`
4. `docs/04_UX_Design_Data_Governance.md`
5. `docs/05_Implementation_Plan.md`
6. `docs/06_Implementation_Progress_Tracker.md`
7. `.github/development_rules.md` y `.github/development_rules/*.md`

## 3) Comandos de calidad obligatorios

Ejecutar desde la raíz del repo:

- Build backend: `cd backend && npm run build`
- Lint backend: `cd backend && npm run lint`
- Test backend (unit/integration): `cd backend && npm run test`
- Test e2e backend: `cd backend && npm run test:e2e`

Notas:
- Actualmente no existe carpeta frontend en este workspace.
- Si en fases futuras se agrega frontend, añadir sus comandos reales en este archivo antes de implementar UI.

## 4) Alcance y restricciones

- En alcance (repo actual):
	- Autenticación y usuario
	- Ejercicios y perfiles de equipamiento
	- Mesociclos y sesiones de entrenamiento
	- Readiness / autorregulación / warmup
	- Persistencia con Prisma + PostgreSQL
- En alcance (producto según docs):
	- Módulos de entrenamiento, nutrición, analítica, educación y capacidades offline de PWA
- Fuera de alcance por defecto:
	- Cualquier funcionalidad no documentada explícitamente en `docs/`
	- Integraciones no especificadas en SRS/arquitectura
- Restricciones clave:
	- No hardcodear secretos
	- Validación estricta de entrada + tipado estricto
	- No exponer PII/tokens en logs
	- Mantener paginación en colecciones no acotadas

## 5) Política de entrega

- Estrategia de commits: `Conventional Commits`
- Política de push: `al cierre de fase o bloque funcional coherente`
- Si hay desalineación entre documentación antigua y estado actual del repo:
	- Priorizar: pedido del usuario > `docs/` > código existente
	- Reportar la desalineación y aplicar corrección mínima consistente
