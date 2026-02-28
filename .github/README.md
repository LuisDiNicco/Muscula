# Configuración de Agente — Musculá

Esta carpeta `.github` es la única fuente de configuración activa para el agente en este repositorio.

## Qué incluye (personalizado)

- `copilot-instructions.md`: reglas globales + flujo obligatorio por fases para Musculá.
- `project-context.md`: contexto real del repo (stack, alcance, docs y comandos reales).
- `development_rules.md`: índice de reglas de desarrollo.
- `development_rules/*.md`: reglas segmentadas de backend/frontend/testing.
- `instructions/00-global.instructions.md`: reglas base aplicables a todo archivo.
- `instructions/backend.instructions.md`: guía backend reutilizable.
- `instructions/frontend.instructions.md`: guía frontend reutilizable.
- `instructions/tests*.instructions.md`: guías de testing reutilizables.
- `prompts/`: prompts reutilizables del equipo.
- `chatmodes/`: modos de chat personalizados.
- `skills/`: skills/capacidades reutilizables del agente.
- `workflows/`: automatizaciones CI/CD (GitHub Actions).
- `ISSUE_TEMPLATE/` y `DISCUSSION_TEMPLATE/`: plantillas de colaboración.

## Qué afecta directamente al agente

- Sí, directo: `project-context.md`, `copilot-instructions.md`, `instructions/*.instructions.md`, `development_rules/*.md`.
- Depende del entorno: `prompts/`, `chatmodes/`, `skills/`.
- Indirecto (proceso/calidad): `workflows/`, `ISSUE_TEMPLATE/`, `DISCUSSION_TEMPLATE/`.

Carpetas vacías no afectan el comportamiento por sí solas; el impacto aparece cuando contienen archivos con formato reconocido.

## Convenciones para este repo

1. La documentación funcional y técnica vive en `docs/01..06`.
2. Las reglas del agente viven en `.github`.
3. Si se agregan nuevos módulos o carpetas, actualizar primero:
	- `project-context.md`
	- `instructions/*.instructions.md` (campos `applyTo`)
	- `development_rules.md` (si cambia la estructura de reglas)

## Recomendaciones

- Mantener una única fuente de verdad para requisitos y diseño (idealmente `docs/`).
- Evitar reglas duplicadas o contradictorias entre archivos.
- En E2E/Playwright usar siempre timeout explícito para evitar bloqueos.
- Si detectás referencias históricas desactualizadas en la documentación, priorizar siempre las reglas vigentes en `.github`.
