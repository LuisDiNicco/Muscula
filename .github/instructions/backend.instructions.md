---
applyTo: "backend/src/**/*.ts"
---
# Reglas backend (NestJS)

- Aplicar reglas de desarrollo del repositorio (`development_rules.md` o equivalente).
- Mantener separación de capas y responsabilidades (dominio/aplicación/infra o arquitectura definida en el proyecto).
- Considerar Prisma como capa de persistencia en infraestructura (sin filtrar modelos de DB hacia dominio/aplicación).
- Evitar dependencias cruzadas y lógica de negocio en controladores/adapters de entrada.
- No exponer entidades de persistencia fuera de su capa; mapear a modelos/DTOs.
- Usar validación de entrada y tipado estricto.
- Priorizar servicios enfocados, testeables y sin duplicación.
- Seguir el flujo por fases definido en `.github/copilot-instructions.md` (gate técnico, auditoría de compliance, corrección iterativa y cierre).
