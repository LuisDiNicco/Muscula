# Especificación de Requisitos de Software (SRS) — Musculá v1.0

**Versión:** 1.0  
**Fecha:** 2026-02-27  
**Estado:** Aprobado para implementación  
**Metodología de referencia:** IEEE 830 / ISO/IEC/IEEE 29148  

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Definición de Stakeholders](#2-definición-de-stakeholders)
3. [Análisis de Necesidades y Puntos de Dolor](#3-análisis-de-necesidades-y-puntos-de-dolor)
4. [Requisitos Funcionales](#4-requisitos-funcionales)
5. [Requisitos No Funcionales](#5-requisitos-no-funcionales)
6. [Matriz de Trazabilidad Stakeholder-Requisito](#6-matriz-de-trazabilidad-stakeholder-requisito)
7. [Glosario de Dominio](#7-glosario-de-dominio)

---

## 1. Introducción

### 1.1 Propósito

Este documento define de forma completa, no ambigua y verificable todos los requisitos funcionales y no funcionales de **Musculá**, una plataforma integral de entrenamiento de fuerza y composición corporal basada en evidencia científica. Está destinado a servir como contrato técnico entre los stakeholders y los agentes de implementación.

### 1.2 Alcance del Producto

Musculá es una **Progressive Web Application (PWA)** mobile-first que integra:

- Planificación y tracking de entrenamientos con autorregulación algorítmica (RIR/RPE).
- Gestión de mesociclos con sobrecarga progresiva y deloads automáticos.
- Seguimiento nutricional con cálculo dinámico de TDEE.
- Composición corporal, antropometría y galería de progreso.
- Wiki de ejercicios con multimedia y base de evidencia científica.
- Analíticas avanzadas: heatmaps musculares, gráficos de tendencias, MRV/MEV tracker.
- Modo offline completo para entornos con mala conectividad.

### 1.3 Fundamento Científico

Toda la lógica algorítmica del sistema se sustenta en literatura peer-reviewed:

| Principio | Fuente primaria | Aplicación en el sistema |
|---|---|---|
| Tensión mecánica como motor primario de hipertrofia | Schoenfeld, B. J. (2010). *J Strength Cond Res.* | Priorización del tracking de carga × reps (sobrecarga progresiva) |
| Autorregulación RIR/RPE | Helms, E. R. et al. (2016). *Strength Cond J.* | Escala RIR en cada serie; algoritmo predictivo de carga |
| Landmarks de volumen (MEV, MRV) | Israetel, M. & Hoffmann, J. (Renaissance Periodization) | Conteo de series efectivas/semana/grupo muscular; alertas de deload |
| TDEE dinámico y adaptación metabólica | Trexler, E. T. et al. (2014). *JISSN.* | Ajuste calórico basado en media móvil de peso real vs. calorías ingeridas |
| Fórmulas de estimación 1RM | Epley (1985); Brzycki (1993) | Gráficos de tendencias de fuerza estimada |

### 1.4 Definiciones y Convenciones

- **MUST / DEBE**: Requisito obligatorio. Su ausencia impide la aceptación.
- **SHOULD / DEBERÍA**: Requisito altamente recomendado. Se implementa salvo justificación técnica documentada.
- **MAY / PUEDE**: Requisito deseable. Se implementa si el presupuesto temporal lo permite.
- **RIR**: Repetitions in Reserve — repeticiones que quedan antes del fallo muscular.
- **RPE**: Rate of Perceived Exertion — escala subjetiva de esfuerzo (10 = fallo).
- **MEV**: Minimum Effective Volume — volumen mínimo para generar adaptación.
- **MRV**: Maximum Recoverable Volume — volumen máximo del que el cuerpo puede recuperarse.
- **TDEE**: Total Daily Energy Expenditure — gasto calórico diario total.
- **Serie Efectiva**: Serie realizada entre RIR 0 y RIR 4 con carga significativa.

---

## 2. Definición de Stakeholders

### STK-01: Usuario Intermedio/Avanzado de Gimnasio (Primario)

| Atributo | Descripción |
|---|---|
| **Perfil** | Persona con 1-10+ años de experiencia en entrenamiento de fuerza. Entiende conceptos como series, repeticiones, RIR, mesociclos. Busca optimización y datos concretos, no "motivación genérica". |
| **Motivación** | Maximizar progresión de fuerza e hipertrofia. Tener control total sobre sus datos históricos. Automatizar la toma de decisiones (cuánto peso poner hoy, cuándo descargar). |
| **Contexto de uso** | En el gimnasio (conexión intermitente), entre series (manos sudadas, pantalla con guantes). También revisa analíticas en casa. |
| **Capacidad técnica** | Media-alta. Comfortable con apps fitness. Espera UX rápida y sin fricción. |

### STK-02: Usuario Principiante Motivado (Secundario)

| Atributo | Descripción |
|---|---|
| **Perfil** | Persona que empieza a entrenar (0-12 meses) y quiere "hacerlo bien desde el principio". Necesita guía, educación y estructura. |
| **Motivación** | Aprender a entrenar correctamente. Tener una rutina estructurada. Entender terminología y conceptos. |
| **Contexto de uso** | Idéntico al STK-01 pero con mayor dependencia del módulo educativo y fichas de ejercicios. |
| **Capacidad técnica** | Media. Puede necesitar onboarding guiado. |

### STK-03: Coach / Entrenador Personal (Terciario - Futuro)

| Atributo | Descripción |
|---|---|
| **Perfil** | Profesional que diseña rutinas para clientes y necesita monitorear su adherencia y progresión. |
| **Motivación** | Herramienta para enviar mesociclos a clientes y ver sus métricas en un dashboard. |
| **Contexto de uso** | Desktop para planificación, mobile para supervisión en sala. |
| **Capacidad técnica** | Alta. Necesita funcionalidades de exportación y análisis granular. |

### STK-04: Desarrollador / Agente de Implementación (Interno)

| Atributo | Descripción |
|---|---|
| **Perfil** | Agente de IA o desarrollador humano que construirá e iterará sobre el sistema. |
| **Motivación** | Documentación clara, requisitos no ambiguos, reglas de desarrollo estrictas y verificables. |
| **Contexto de uso** | IDE, terminal, pipeline CI/CD. |
| **Capacidad técnica** | Experta. Requiere contratos técnicos precisos. |

### STK-05: Propietario del Producto (Interno)

| Atributo | Descripción |
|---|---|
| **Perfil** | El creador/dueño del proyecto con la visión del producto final. |
| **Motivación** | Producto de calidad profesional, costo operativo $0, diferenciación basada en evidencia científica. |
| **Contexto de uso** | Revisión de entregables, feedback sobre UX y funcionalidad. |
| **Capacidad técnica** | Media-alta en desarrollo, experta en dominio fitness. |

---

## 3. Análisis de Necesidades y Puntos de Dolor

### 3.1 Puntos de Dolor Identificados por Stakeholder

#### STK-01 y STK-02: Usuarios Finales

| ID | Punto de Dolor | Descripción | Cómo Musculá lo Aborda |
|---|---|---|---|
| PD-01 | **Registro lento en el gimnasio** | Las apps existentes requieren demasiados toques para registrar una serie. El tiempo entre series es limitado (60-180s). | Interfaz de tracking con mínima fricción: taps rápidos, sugerencia predictiva de peso/reps, temporizador automático post-serie. |
| PD-02 | **Sin conexión en el gimnasio** | Muchos gimnasios subterráneos o con mala cobertura. La app deja de funcionar sin internet. | Modo offline completo con Service Workers. Sync automático al recuperar conexión. |
| PD-03 | **No sé cuánto peso poner hoy** | El usuario llega al gym sin saber si debe subir peso o mantener. Depende de la memoria. | Algoritmo predictivo de carga basado en historial + RIR reportado + Readiness Score. |
| PD-04 | **Máquina ocupada, ¿qué hago?** | Llega al gym y el equipo planificado está ocupado. Pierde tiempo buscando alternativa. | Botón "Sustituir": sugiere ejercicios equivalentes (mismo patrón de movimiento y grupo muscular). |
| PD-05 | **No sé cuántos discos poner** | Cálculo mental de discos bajo fatiga. Errores frecuentes. | Calculadora de discos visual con representación gráfica de la barra y discos a cada lado. |
| PD-06 | **Sobreentrenamiento sin darme cuenta** | Acumular volumen excesivo sin tracking lleva a estancamiento y lesiones. | MRV/MEV tracker por grupo muscular. Alertas visuales y sugerencia de deload automática. |
| PD-07 | **Datos atrapados en otra app** | Años de historial en Strong/Hevy. Migrar manualmente es imposible. | Importador de CSV de Strong y Hevy. Exportador universal a CSV. |
| PD-08 | **Información fitness de baja calidad** | Las apps no citan fuentes. Recomendaciones basadas en "bro-science". | Academia integrada con botón "Ver Fuentes" y referencias bibliográficas reales en cada artículo. |
| PD-09 | **Calentamiento improvisado** | El usuario no sabe hacer series de aproximación correctas para cargas pesadas. | Generador inteligente de calentamiento basado en el peso de trabajo planificado. |
| PD-10 | **No veo mi progreso real** | Las apps muestran datos crudos pero no tendencias ni correlaciones significativas. | Dashboard de analíticas: 1RM estimado, tonelaje, heatmap de recuperación, correlaciones peso corporal vs. fuerza. |
| PD-11 | **Dieta genérica o punitiva** | Apps de nutrición que "castigan" por pasarse un día generando ansiedad. | TDEE dinámico sin penalizaciones. El algoritmo se ajusta sin juicios morales sobre las calorías. |
| PD-12 | **No sé si estoy recuperado** | El usuario no tiene una forma objetiva de evaluar si debería entrenar fuerte hoy. | Readiness Score: encuesta de 3 segundos pre-entrenamiento (sueño, estrés, DOMS) que ajusta la carga sugerida. |

#### STK-04: Desarrollador / Agente de Implementación

| ID | Punto de Dolor | Cómo se Aborda |
|---|---|---|
| PD-13 | Ambigüedad en requisitos | SRS exhaustiva con criterios de aceptación verificables |
| PD-14 | Ausencia de estándares de código | Reglas de desarrollo en `.github/development_rules/` con 100% compliance obligatorio |
| PD-15 | Desvíos acumulados no detectados | Validación interna al final de cada fase + code review de compliance |

#### STK-05: Propietario

| ID | Punto de Dolor | Cómo se Aborda |
|---|---|---|
| PD-16 | Costos de infraestructura | Stack 100% free tier (Vercel, Render/Koyeb, Supabase/Neon) |
| PD-17 | Producto genérico sin diferenciación | Base científica verificable + algoritmos inteligentes como ventaja competitiva |

---

## 4. Requisitos Funcionales

### Convención de IDs

- `RF-XX-YYY`: Requisito Funcional, módulo XX, número YYY.
- Módulos: `EN` (Entrenamiento), `ED` (Educación), `NU` (Nutrición/Salud), `AN` (Analítica), `SO` (Social), `AU` (Autenticación), `SY` (Sistema).

---

### 4.1 Módulo AU — Autenticación y Gestión de Cuenta

#### RF-AU-001: Registro de Usuario

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir el registro de nuevos usuarios mediante email + contraseña. |
| **Prioridad** | Crítica |
| **Actores** | STK-01, STK-02 |
| **Criterios de aceptación** | 1. El formulario solicita: email (validación RFC 5322), contraseña (mínimo 8 chars, 1 mayúscula, 1 número, 1 especial), nombre de usuario (único, 3-30 chars alfanuméricos). 2. La contraseña se almacena hasheada con bcrypt (cost factor ≥ 12). 3. Se envía email de verificación con token de expiración (24h). 4. Si el email ya existe, se retorna error 409 sin revelar si la cuenta existe ("Si este email está registrado, recibirás un correo"). 5. Se crea un perfil por defecto con unidades métricas y configuración base. |

#### RF-AU-002: Login con JWT

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE autenticar usuarios con email + contraseña y emitir un par de tokens JWT (access + refresh). |
| **Prioridad** | Crítica |
| **Criterios de aceptación** | 1. Access token: expiración 15 minutos. Refresh token: expiración 7 días (rotación en cada uso). 2. Access token contiene: userId, email, roles. 3. Refresh token se almacena en httpOnly cookie (SameSite=Strict). 4. Tras 5 intentos fallidos en 15 min, se bloquea la cuenta temporalmente (30 min) y se notifica por email. 5. Login exitoso retorna access token en body + set-cookie del refresh token. |

#### RF-AU-003: Recuperación de Contraseña

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir la recuperación de contraseña mediante envío de enlace al email registrado. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. Se envía un token de reset (expiración 1h, uso único). 2. El enlace redirige a un formulario de nueva contraseña. 3. La nueva contraseña no puede ser igual a las últimas 3 contraseñas. 4. Todos los refresh tokens existentes se invalidan al cambiar la contraseña. |

#### RF-AU-004: Gestión de Perfil de Usuario

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir al usuario editar su perfil personal y preferencias. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. Campos editables: nombre de usuario, avatar (imagen < 2MB, formatos jpg/png/webp), fecha de nacimiento, género (masculino/femenino/otro/prefiero no decir), altura, peso actual, sistema de unidades (métrico/imperial). 2. Los cambios de email requieren re-verificación. 3. Opción de eliminar cuenta (soft delete con periodo de gracia de 30 días). |

#### RF-AU-005: Preferencias del Usuario

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir configurar preferencias que afectan la experiencia de uso. |
| **Prioridad** | Media |
| **Criterios de aceptación** | 1. Unidades de peso: kg o lbs (conversión automática en toda la app). 2. Idioma: español, inglés (internacionalización i18n). 3. Tema: claro, oscuro, sistema. 4. Duración de descanso por defecto (configurable por tipo de ejercicio: compuesto 120-300s, aislamiento 60-120s). 5. Notificaciones push: habilitadas/deshabilitadas por tipo (descanso, recordatorio de entrenamiento, logros). |

---

### 4.2 Módulo EN — Entrenamiento (Core & Tracking)

#### RF-EN-001: Creación de Mesociclos

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir crear mesociclos (bloques de entrenamiento) con una duración definida en semanas. |
| **Prioridad** | Crítica |
| **Actores** | STK-01, STK-02, STK-03 |
| **Criterios de aceptación** | 1. Campos obligatorios: nombre del mesociclo, duración (3-16 semanas), objetivo (hipertrofia/fuerza/resistencia/recomposición). 2. Campos opcionales: descripción, incluir semana de deload automática (sí/no, por defecto sí en la última semana). 3. Dentro de un mesociclo se definen "Días de entrenamiento" (mínimo 1, máximo 7 por semana). 4. Se puede duplicar un mesociclo existente como plantilla para un nuevo bloque. 5. Un mesociclo puede estar en estado: borrador, activo, completado, archivado. Solo uno puede estar activo a la vez. |

#### RF-EN-002: Configuración de Días de Entrenamiento

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir configurar los días dentro de un mesociclo con ejercicios específicos y estructura de series. |
| **Prioridad** | Crítica |
| **Criterios de aceptación** | 1. Cada día tiene: nombre (ej. "Pull A"), lista ordenada de ejercicios (drag & drop para reordenar). 2. Cada ejercicio en el día define: número de series objetivo, rango de repeticiones objetivo (ej. 8-12), RIR objetivo (ej. 2), tempo opcional (formato 4-1-2-0: excéntrica-pausa-concéntrica-pausa). 3. Los ejercicios se seleccionan del directorio de ejercicios (RF-ED-001). 4. Se pueden agregar supersets (2+ ejercicios agrupados que se ejecutan sin descanso entre ellos). 5. Cada ejercicio puede tener una nota de setup (ej. "usar agarre prono, codos a 45°"). |

#### RF-EN-003: Sesión de Entrenamiento en Vivo (Tracking)

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE proveer una interfaz para registrar el entrenamiento en tiempo real con mínima fricción. |
| **Prioridad** | Crítica |
| **Criterios de aceptación** | 1. Al iniciar una sesión, se carga la plantilla del día correspondiente con los ejercicios planificados y la sugerencia de peso/reps. 2. Para cada serie se registra: peso (con incrementos de 0.5 kg/1 lb), repeticiones (entero ≥ 0), RIR (escala 0-5+, donde 5+ indica muy lejos del fallo). 3. Sugerencia predictiva de peso: basada en la última sesión del mismo ejercicio + RIR reportado. Si RIR reportado > RIR objetivo → sugiere subir 2.5% la carga. Si RIR reportado < RIR objetivo → sugiere mantener o reducir 2.5%. 4. Cada serie se puede marcar individualmente como completada con un tap. 5. Las series de calentamiento se diferencian visualmente y NO cuentan como series efectivas. 6. Se puede añadir/eliminar series extra durante la sesión. 7. Se muestra el historial de la última sesión para ese ejercicio (peso × reps × RIR) como referencia. 8. Duración de la sesión se trackea automáticamente (cronómetro visible). 9. Al finalizar, se pide confirmación y opción de añadir nota de sesión general. |

#### RF-EN-004: Generador Inteligente de Calentamiento

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE generar automáticamente series de calentamiento/aproximación para ejercicios compuestos basándose en el peso de trabajo planificado. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. Se activa para ejercicios compuestos (sentadilla, press banca, peso muerto, press militar, remo, etc.) cuando el peso de trabajo ≥ 40 kg. 2. Algoritmo de escalado: Serie 1: barra vacía (20 kg) × 10 reps, Serie 2: 50% peso trabajo × 5 reps, Serie 3: 70% peso trabajo × 3 reps, Serie 4: 85% peso trabajo × 1 rep (solo si peso trabajo ≥ 80 kg). 3. El usuario puede editar, añadir o eliminar series de calentamiento generadas. 4. Las series de calentamiento se persisten en la sesión pero se etiquetan como "warmup" y se excluyen de estadísticas de volumen. |

#### RF-EN-005: Sustitución Rápida de Ejercicios

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir sustituir un ejercicio durante la sesión por otro equivalente, sugiriendo alternativas. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. Al tocar "Sustituir", se muestran ejercicios que comparten: mismo grupo muscular primario Y mismo patrón de movimiento (empuje horizontal, tirón vertical, etc.). 2. Los resultados se filtran por el perfil de equipamiento activo del usuario. 3. El ejercicio original y el sustituto se vinculan en el historial para mantener trazabilidad. 4. El peso sugerido para el sustituto se calcula proporcionalmente si hay historial previo, o se omite si no hay datos. |

#### RF-EN-006: Calculadora de Discos Visual

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE proveer una calculadora visual que muestre los discos necesarios para cargar un peso determinado en una barra olímpica. |
| **Prioridad** | Media |
| **Criterios de aceptación** | 1. Input: peso total deseado. 2. Configuración: peso de la barra (por defecto 20 kg, editable: 15 kg, 10 kg barra EZ). 3. Discos disponibles configurables por el usuario (por defecto: 25, 20, 15, 10, 5, 2.5, 1.25 kg). 4. Output: representación gráfica de la barra con los discos a cada lado (colores diferenciados por peso). 5. Si el peso no es alcanzable con los discos disponibles, se muestra el peso alcanzable más cercano. 6. Se integra en la pantalla de tracking (acceso rápido desde cada serie de ejercicio con barra). |

#### RF-EN-007: Temporizador de Descanso Avanzado

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE proveer un temporizador de descanso automático entre series con notificaciones. |
| **Prioridad** | Crítica |
| **Criterios de aceptación** | 1. Se inicia automáticamente al completar una serie. 2. Duración por defecto según el tipo de ejercicio (configurable en preferencias). Se puede ajustar manualmente para cada serie. 3. Notificación push/vibración a los 30 segundos antes de terminar y al llegar a 0. 4. El temporizador es visible en la parte inferior de la pantalla de tracking como overlay persistente. 5. Se puede pausar, reiniciar, o saltar el descanso. 6. El tiempo de descanso real se registra y persiste como dato de la sesión. |

#### RF-EN-008: Notas Granulares

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir al usuario añadir notas textuales a nivel de serie individual y a nivel de sesión completa. |
| **Prioridad** | Media |
| **Criterios de aceptación** | 1. Nota de serie: máximo 200 caracteres. Se muestra como tooltip/icono junto a la serie. Ejemplo: "Poner el banco en posición 3". 2. Nota de sesión: máximo 1000 caracteres. Se solicita al finalizar la sesión. Ejemplo: "Dormí 4 horas, me sentí débil en compuestos". 3. Las notas se persisten y son visibles en el historial del ejercicio y de la sesión. 4. Searchable: las notas se pueden buscar desde el historial. |

#### RF-EN-009: Modo Offline

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE funcionar completamente sin conexión a internet durante una sesión de entrenamiento. |
| **Prioridad** | Crítica |
| **Criterios de aceptación** | 1. Toda la plantilla del mesociclo activo, directorio de ejercicios (sin media pesada) y historial reciente (últimas 4 semanas) se cachean localmente. 2. Las sesiones se guardan en IndexedDB local al completarse. 3. Al detectar conexión, se sincronizan automáticamente con el servidor (estrategia: last-write-wins con timestamp, conflictos se loguean para resolución manual futura). 4. La UI indica claramente el estado: "Online / Offline / Sincronizando..." con indicador visual. 5. Las funcionalidades que requieren internet (búsqueda de alimentos, descarga de media) muestran un mensaje claro indicando que no están disponibles offline. |

#### RF-EN-010: Perfiles de Equipamiento

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir al usuario crear perfiles de equipamiento que filtren los ejercicios disponibles. |
| **Prioridad** | Media |
| **Criterios de aceptación** | 1. Un perfil tiene: nombre (ej. "Home Gym"), lista de equipamiento disponible (barra olímpica, mancuernas, poleas, máquinas específicas, bandas, kettlebells, etc.). 2. El usuario puede tener múltiples perfiles y seleccionar uno como activo. 3. Al planificar o sustituir ejercicios, solo se muestran los compatibles con el equipamiento del perfil activo. 4. Se incluyen perfiles predefinidos: "Gimnasio Comercial Completo", "Home Gym Básico", "Solo Peso Corporal". |

#### RF-EN-011: Readiness Score (Escala de Preparación)

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE mostrar una encuesta rápida pre-entrenamiento para evaluar la preparación del usuario y ajustar las sugerencias de carga. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. Se presenta al iniciar una sesión (opcional, se puede saltar). 2. Preguntas (escala 1-5 con emojis): "¿Cómo dormiste anoche?", "¿Nivel de estrés general?", "¿Agujetas/dolor en los músculos de hoy?". 3. Score = promedio ponderado (sueño 40%, estrés 30%, DOMS 30%). 4. Si score < 2.5: reducir sugerencia de carga un 5-10%. Si score 2.5-3.5: mantener. Si score > 3.5: mantener o sugerir aumento. 5. El score se almacena y es visible en analíticas (correlación readiness vs. rendimiento). |

#### RF-EN-012: Historial de Sesiones

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE mantener un historial completo y consultable de todas las sesiones de entrenamiento realizadas. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. Vista de calendario mensual con indicadores de días entrenados (puntos/colores). 2. Vista de lista cronológica con filtros por: fecha, mesociclo, grupo muscular trabajado. 3. Detalle de sesión: duración, ejercicios, series × reps × peso × RIR, notas, readiness score. 4. Desde una sesión histórica, se puede ver el detalle de cada ejercicio y navegar a su tendencia de progresión. |

---

### 4.3 Módulo ED — Educación, Wiki y Documentación

#### RF-ED-001: Directorio de Ejercicios

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE proveer un directorio searchable y filtrable de ejercicios con información técnica detallada. |
| **Prioridad** | Crítica |
| **Criterios de aceptación** | 1. Cada ejercicio tiene: nombre (ES/EN), GIF/video demostrativo, músculos primarios (lista), músculos secundarios (lista), equipamiento requerido, patrón de movimiento (empuje vertical/horizontal, tirón vertical/horizontal, bisagra de cadera, sentadilla, acarreo, aislamiento), nivel de dificultad (principiante/intermedio/avanzado). 2. Filtros encadenables: por músculo, por equipamiento, por patrón de movimiento, por nivel. 3. Búsqueda por texto libre (nombre del ejercicio). 4. Cada ejercicio tiene una ficha detallada con: setup (preparación), ejecución paso a paso, errores comunes a evitar, variaciones. 5. Seed inicial: mínimo 150 ejercicios cubriendo todos los grupos musculares principales. |

#### RF-ED-002: Fichas de Ejercicios Multimedia

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE mostrar fichas detalladas de cada ejercicio con contenido multimedia y técnico. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. GIF/Video: loop automático, mudo, optimizado para carga rápida (<500KB por GIF). 2. Diagrama muscular: imagen del cuerpo humano con músculos primarios resaltados en color intenso y secundarios en color suave. 3. Secciones: Setup, Ejecución, Errores Comunes, Variaciones, Notas del Coach. 4. Datos del usuario en la ficha: última vez que realizó el ejercicio, mejor marca (1RM estimado), historial resumido. |

#### RF-ED-003: Academia Integrada

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE incluir una sección de artículos educativos sobre entrenamiento y nutrición basados en evidencia. |
| **Prioridad** | Media |
| **Criterios de aceptación** | 1. Artículos categorizados: Fundamentos, Entrenamiento, Nutrición, Recuperación, Periodización. 2. Cada artículo tiene: título, resumen (< 50 palabras), contenido con formato rich text, bibliografía, fecha de publicación, tiempo de lectura estimado. 3. Contenido seed inicial mínimo: "¿Qué es el RIR y cómo usarlo?", "Cómo planificar un Mesociclo", "Guía de Sobrecarga Progresiva", "Importancia del Volumen de Entrenamiento", "TDEE Dinámico: Qué es y cómo funciona", "Cómo hacer un Deload correctamente". 4. Botón "Ver Fuentes" en cada artículo que despliega las referencias bibliográficas con DOI cuando disponible. |

---

### 4.4 Módulo NU — Nutrición, Salud y Progreso Físico

#### RF-NU-001: Gestor de Composición Corporal

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir al usuario seleccionar y gestionar un modo de composición corporal que influya en las recomendaciones nutricionales. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. Modos disponibles: Volumen (superávit calórico), Definición (déficit calórico), Mantenimiento (normocalórico), Recomposición (déficit leve + alto proteína). 2. Cada modo define un rango de ajuste calórico sobre el TDEE: Volumen +10-20%, Definición -15-25%, Mantenimiento ±5%, Recomposición -5-10%. 3. El modo activo se refleja en el dashboard y en los objetivos de macros diarios. 4. Transición entre modos registrada en historial con fecha. |

#### RF-NU-002: Cálculo Dinámico de TDEE

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE calcular el TDEE del usuario de forma dinámica, basándose en datos reales (peso y calorías ingeridas) en lugar de fórmulas estáticas únicamente. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. TDEE inicial: calculado con fórmula Mifflin-St Jeor × factor de actividad (sedentario a muy activo). 2. TDEE dinámico: tras 14 días de datos (peso diario + calorías ingeridas), el sistema calcula el TDEE real usando media móvil exponencial de 14 días. Fórmula: Si el peso promedio sube y las calorías promedio son X → TDEE ≈ X - (delta_peso × 7700 / 14). 3. El TDEE se muestra con un indicador de confianza: "Estimado" (< 14 días), "Calibrando" (14-28 días), "Preciso" (> 28 días). 4. No hay mensajes punitivos por pasarse de calorías. Tono neutro e informativo siempre. |

#### RF-NU-003: Diario de Comidas

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir registrar alimentos consumidos y calcular macronutrientes diarios. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. Comidas del día: Desayuno, Almuerzo, Merienda, Cena, Snacks (categorías editables). 2. Buscador de alimentos: integración con Open Food Facts API (y/o FatSecret/Edamam como fallback). Búsqueda por nombre y por código de barras (scan desde cámara). 3. Cada alimento registrado: nombre, cantidad (g/ml/unidades con conversión), calorías, proteínas, carbohidratos, grasas. 4. Alimentos frecuentes: acceso rápido a los últimos 20 alimentos registrados. 5. Alimentos personalizados: el usuario puede crear entradas manuales con macros custom. 6. Resumen diario visual: barras de progreso circular para calorías totales y cada macronutriente vs. objetivo. 7. Copiar comida de un día anterior. |

#### RF-NU-004: Tracking Antropométrico

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir registrar medidas corporales periódicas con cinta métrica. |
| **Prioridad** | Media |
| **Criterios de aceptación** | 1. Medidas soportadas: peso corporal (diario; obligatorio para TDEE dinámico), cuello, pecho, bíceps (der/izq), cintura, cadera, muslo (der/izq), pantorrilla (der/izq). 2. Cada medida tiene: fecha, valor numérico, unidad (cm/in). 3. Gráficos de tendencia por medida (últimos 30/90/180/365 días). 4. Peso corporal: visualización de media móvil de 7 días junto con los puntos diarios para suavizar fluctuaciones. |

#### RF-NU-005: Galería de Progreso Visual

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir subir fotos de progreso físico y compararlas lado a lado. |
| **Prioridad** | Media |
| **Criterios de aceptación** | 1. Categorías de foto: frontal, lateral derecho, lateral izquierdo, trasero. 2. Cada foto tiene: fecha, categoría, peso corporal en esa fecha (autorellenado si existe). 3. Comparador lado a lado: seleccionar dos fechas y ver las fotos de la misma categoría juntas. 4. Las fotos se almacenan con compresión (max 1MB por imagen, redimensionado serverside a max 1920px). 5. Las fotos son privadas por defecto (no se comparten, no se indexan). 6. Almacenamiento: uso de object storage compatible (o filesystem en free tier). |

#### RF-NU-006: Integración con Wearables

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBERÍA permitir la integración con plataformas de salud para importar pasos diarios y estimaciones de calorías quemadas. |
| **Prioridad** | Baja |
| **Criterios de aceptación** | 1. Integración inicial: Google Fit REST API (OAuth2). 2. Datos importados: pasos diarios, calorías activas estimadas. 3. Los datos importados se muestran en el dashboard de salud y pueden alimentar el cálculo de TDEE como factor de actividad. 4. La integración es completamente opcional y el sistema funciona perfectamente sin ella. |

---

### 4.5 Módulo AN — Analítica y Dashboard

#### RF-AN-001: Dashboard de Volumen (MRV/MEV Tracker)

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE mostrar un dashboard de volumen semanal por grupo muscular con indicadores de zona óptima y sobreentrenamiento. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. Gráfico de barras horizontales: un barra por grupo muscular (pecho, espalda, hombros, bíceps, tríceps, cuádriceps, isquiotibiales, glúteos, pantorrillas, core). 2. Cada barra muestra series efectivas acumuladas en la semana actual. 3. Zonas coloreadas: verde (MEV-óptimo), amarillo (acercándose al MRV), rojo (superó el MRV estimado). 4. Valores de MEV/MRV iniciales basados en la literatura (Israetel): configurables por el usuario. Defaults razonables por grupo muscular. 5. Al tocar una barra, se despliega el desglose: qué ejercicios y en qué sesiones contribuyeron al volumen. 6. Si un grupo está en rojo por 2+ semanas consecutivas, se genera una notificación sugiriendo deload. |

#### RF-AN-002: Heatmap Muscular (Mapa de Calor)

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE mostrar una visualización del cuerpo humano (frontal y posterior) donde los músculos cambien de color según recencia de entrenamiento y estado de recuperación. |
| **Prioridad** | Media |
| **Criterios de aceptación** | 1. Visualización SVG interactiva del cuerpo humano con regiones musculares definidas (mínimo 14 grupos). 2. Colores: rojo oscuro (entrenado hoy), rojo → naranja → amarillo → verde (degradado de 1-5 días de recuperación), gris (no entrenado en 7+ días). 3. Al tocar un músculo, se muestra: última vez entrenado, series efectivas de la semana, próximo día planificado para ese músculo. 4. Tiempo de recuperación estimado por grupo: configurable (defaults: 48-72h grupos grandes, 24-48h grupos pequeños). |

#### RF-AN-003: Gráficos de Tendencias de Fuerza

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE proveer gráficos de evolución del 1RM estimado y tonelaje por ejercicio a lo largo del tiempo. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. 1RM estimado: calculado con fórmula de Epley (peso × (1 + reps/30)) y Brzycki (peso × 36 / (37 − reps)). Se usa el promedio de ambas. Solo se calcula para series ≤ 10 reps (precisión decrece con más reps). 2. Gráfico de línea temporal: eje X = fecha, eje Y = 1RM estimado. Periodos seleccionables: 30d, 90d, 180d, 1 año, todo. 3. Tonelaje por sesión: peso × reps sumado para todas las series del ejercicio en esa sesión. 4. Gráfico de comparación: superponer 2-3 ejercicios en el mismo gráfico para correlacionar progresiones. 5. Tabla de PRs (Personal Records): top 1RM estimado, top serie (mejor set de peso × reps), top volumen en una sesión. |

#### RF-AN-004: Correlaciones y Estadísticas Avanzadas

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBERÍA mostrar correlaciones entre variables clave para el usuario. |
| **Prioridad** | Baja |
| **Criterios de aceptación** | 1. Gráfico: peso corporal vs. 1RM estimado en ejercicios principales (para ver si la fuerza se mantiene en cutting). 2. Gráfico: volumen semanal vs. readiness score promedio (para identificar sobreentrenamiento). 3. Gráfico: adherencia nutricional (% de días con comidas registradas) vs. cambio de peso corporal. 4. Los gráficos se generan solo si hay suficientes datos (mínimo 4 semanas). |

---

### 4.6 Módulo SO — Social y Datos

#### RF-SO-001: Exportación de Datos

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir la exportación completa de los datos del usuario en formato CSV. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. Datos exportables: historial de sesiones (fecha, ejercicio, serie, peso, reps, RIR, notas), medidas corporales, diario de comidas. 2. Formato: CSV con headers descriptivos, codificación UTF-8, separador coma. 3. Se genera un archivo ZIP con los CSVs separados por tipo de dato. 4. El usuario recibe un enlace de descarga (válido 24h). 5. Tiempo máximo de generación: 30 segundos para historial de hasta 2 años. |

#### RF-SO-002: Importación de Datos (Strong & Hevy)

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir importar historial de entrenamiento desde las apps Strong y Hevy vía archivos CSV. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. Se aceptan archivos CSV exportados de Strong (formato estándar de Strong) y Hevy (formato estándar de Hevy). 2. El importador parsea los ejercicios y mapea a los ejercicios del directorio de Musculá (matching por nombre con fuzzy search + tabla de mapeo manual para nombres comunes). 3. Ejercicios no mapeados: se crean automáticamente como "ejercicios personalizados" con alerta al usuario para revisión. 4. Se importa: fecha, ejercicio, peso, reps, y notas si existen. 5. Vista previa antes de confirmar la importación mostrando: registros parseados, ejercicios mapeados, ejercicios no reconocidos. 6. Se ofrece un "dry run" (simulación sin persistir) para verificar antes de importar definitivamente. |

#### RF-SO-003: Compartir Rutinas

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE permitir generar un enlace o código para compartir un mesociclo con otros usuarios. |
| **Prioridad** | Media |
| **Criterios de aceptación** | 1. Se genera un código corto único (ej. "MUSC-A3F7K9") o un URL compartible. 2. El receptor puede importar la rutina como un nuevo mesociclo en borrador. 3. La rutina compartida incluye: estructura de días, ejercicios, series/reps/RIR objetivos. NO incluye datos de rendimiento personal. 4. Los códigos expiran a los 30 días. 5. Un mesociclo compartido puede ser previsualizado sin autenticación (vista resumida), pero requiere cuenta para importarlo. |

---

### 4.7 Módulo SY — Sistema y Transversales

#### RF-SY-001: Onboarding de Nuevo Usuario

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE guiar a los nuevos usuarios a través de un flujo de onboarding que configure su perfil y preferencias iniciales. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | 1. Flujo paso a paso (wizard): Datos personales (peso, altura, edad, género) → Objetivo (hipertrofia/fuerza/resistencia) → Experiencia (principiante/intermedio/avanzado) → Equipamiento disponible (selección de perfil) → Unidades preferidas (kg/lbs, cm/in). 2. Al completar, se genera una configuración inicial del TDEE estimado y se sugiere un mesociclo plantilla según objetivo y experiencia. 3. Se puede saltar (skip) pasos no esenciales. |

#### RF-SY-002: Notificaciones Push

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBE enviar notificaciones push al dispositivo del usuario para eventos relevantes. |
| **Prioridad** | Media |
| **Criterios de aceptación** | 1. Tipos de notificación enviables: fin de descanso entre series, recordatorio de entrenamiento programado, sugerencia de deload, recordatorio de registro de peso corporal, logros desbloqueados. 2. Implementación: Web Push API (Service Worker). 3. Cada tipo de notificación se puede habilitar/deshabilitar individualmente en preferencias. 4. Las notificaciones son silenciosas (no hay sonido, solo vibración) por defecto. |

#### RF-SY-003: Sistema de Logros / Gamificación Ligera

| Campo | Valor |
|---|---|
| **Descripción** | El sistema DEBERÍA incluir un sistema de logros para incentivar la consistencia del usuario. |
| **Prioridad** | Baja |
| **Criterios de aceptación** | 1. Logros iniciales (mínimo 10): "Primera sesión registrada", "7 días consecutivos", "PR en un ejercicio", "100 sesiones totales", "1 mesociclo completado", "Registraste comida 7 días seguidos", "Subiste tu primera foto de progreso", etc. 2. Cada logro tiene: icono, título, descripción, condición de desbloqueo, fecha de obtención. 3. Se muestran en el perfil del usuario. 4. Notificación push opcional al desbloquear un logro. |

---

## 5. Requisitos No Funcionales

### RNF-001: Rendimiento

| Aspecto | Requisito |
|---|---|
| **Tiempo de carga inicial (PWA)** | La primera carga DEBE completarse en < 3 segundos en conexión 3G. Las cargas subsiguientes (Service Worker cache) DEBE ser < 1 segundo. |
| **Tiempo de respuesta API** | El 95% de las requests DEBE responder en < 200ms. El 99% en < 500ms. Excepciones: exportación de datos y operaciones analíticas complejas (< 5s). |
| **Interacción de tracking** | Registrar una serie (peso + reps + RIR + confirmar) DEBE requerir ≤ 3 toques/taps desde el estado "serie visible". |
| **Offline performance** | No DEBE haber degradación perceptible del rendimiento en modo offline para funcionalidades cacheadas. |

### RNF-002: Escalabilidad

| Aspecto | Requisito |
|---|---|
| **Usuarios concurrentes** | El sistema DEBE soportar 100 usuarios concurrentes en free tier sin degradación. Diseñar para escalar a 10,000 con upgrade de infra. |
| **Datos por usuario** | El sistema DEBE manejar eficientemente hasta 5 años de historial por usuario (~2,600 sesiones, ~50,000 series). |
| **Paginación** | Toda query que retorne colecciones DEBE estar paginada (página + límite + ordenamiento). |

### RNF-003: Disponibilidad y Resiliencia

| Aspecto | Requisito |
|---|---|
| **Uptime** | 99% mensual (aceptable para free tier). |
| **Modo degradado** | Si el backend está caído, la PWA DEBE funcionar en modo offline con datos cacheados en la última sincronización. |
| **Data durability** | Los datos del usuario DEBE persistirse en PostgreSQL con backups automáticos (provisto por Supabase/Neon free tier). |

### RNF-004: Seguridad

| Aspecto | Requisito |
|---|---|
| **Autenticación** | JWT (access + refresh token con rotación). |
| **Autorización** | RBAC básico: user, admin. Cada usuario solo accede a sus propios datos. |
| **Transporte** | HTTPS obligatorio (TLS 1.2+). |
| **Inputs** | Todas las entradas del usuario DEBEN ser validadas y sanitizadas (class-validator + whitelist). |
| **Headers** | Helmet para headers de seguridad estándar. CORS restringido al dominio del frontend. |
| **Rate limiting** | Throttling global: 100 requests/minuto por IP para endpoints públicos, 300 para autenticados. |
| **Datos sensibles** | Contraseñas hasheadas (bcrypt). Fotos de progreso sirven URLs firmadas con expiración. PII nunca en logs. |

### RNF-005: Usabilidad y Accesibilidad

| Aspecto | Requisito |
|---|---|
| **Mobile-first** | La UI DEBE diseñarse primero para pantallas móviles (360-428px) y adaptarse a tablet/desktop. |
| **Accesibilidad** | WCAG 2.1 AA: HTML semántico, labels, contraste ≥ 4.5:1, navegación por teclado, focus visible, alt text en imágenes. |
| **Internacionalización** | Español (primario) e inglés. Arquitectura i18n desde el día 1 (next-intl o similar). |
| **Onboarding** | Un nuevo usuario DEBE poder completar el onboarding y registrar su primera sesión en < 5 minutos. |

### RNF-006: Mantenibilidad

| Aspecto | Requisito |
|---|---|
| **Arquitectura** | Clean/Hexagonal Architecture obligatoria en backend (ver `.github/development_rules/01_architecture.md`). |
| **Cobertura de tests** | > 80% en application/services y domain/entities. Integration tests para todos los endpoints. |
| **Código** | TypeScript strict. `any` prohibido. Prettier + ESLint. Conventional Commits. |
| **Documentación** | Swagger completo para todos los endpoints. Código auto-documentado con nombres expresivos. |

### RNF-007: Compatibilidad

| Aspecto | Requisito |
|---|---|
| **Navegadores** | Chrome 90+, Safari 15+, Firefox 90+, Edge 90+. |
| **PWA** | Instalable como app en Android y iOS (manifest.json, Service Worker con Workbox). |
| **Sistemas de Unidades** | Soporte completo para métricas (kg, cm) e imperiales (lbs, in) con conversión transparente. |

### RNF-008: Infraestructura y Costo

| Aspecto | Requisito |
|---|---|
| **Costo operativo** | $0 total. Solo se utilizan free tiers de proveedores cloud. |
| **Frontend hosting** | Vercel (free tier). |
| **Backend hosting** | Render o Koyeb (free tier). |
| **Base de datos** | Supabase PostgreSQL o Neon.tech (free tier). |
| **Monitoreo** | Logging estructurado. Health check endpoint (`/health`). No se requiere APM de pago. |

---

## 6. Matriz de Trazabilidad Stakeholder-Requisito

Esta matriz muestra qué requisitos impactan directamente a cada stakeholder y cómo.

### Impacto en STK-01 (Usuario Intermedio/Avanzado)

| Requisito | Impacto | Punto de dolor resuelto |
|---|---|---|
| RF-EN-003 (Tracking en vivo) | **Crítico** — Es la funcionalidad que usará en cada sesión, cada día | PD-01 (Registro lento) |
| RF-EN-009 (Offline) | **Crítico** — Sin esto, la app es inutilizable en muchos gimnasios | PD-02 (Sin conexión) |
| RF-EN-003 (Sugerencia predictiva) | **Alto** — Elimina incertidumbre y optimiza decisiones | PD-03 (No sé cuánto poner) |
| RF-EN-005 (Sustituir ejercicio) | **Alto** — Reduce frustración cuando el equipo está ocupado | PD-04 (Máquina ocupada) |
| RF-EN-006 (Calculadora discos) | **Medio** — Ahorra tiempo y reduce errores de cálculo | PD-05 (Cuántos discos) |
| RF-AN-001 (MRV tracker) | **Alto** — Previene sobreentrenamiento, optimiza volumen | PD-06 (Sobreentrenamiento) |
| RF-SO-002 (Import Strong/Hevy) | **Alto** — Habilita la migración, elimina lock-in | PD-07 (Datos atrapados) |
| RF-AN-003 (Tendencias) | **Alto** — Visibilidad real de progresión | PD-10 (No veo progreso) |

### Impacto en STK-02 (Principiante)

| Requisito | Impacto | Punto de dolor resuelto |
|---|---|---|
| RF-SY-001 (Onboarding) | **Crítico** — Primera experiencia determina retención | Barrera de entrada |
| RF-ED-001/002 (Wiki + fichas) | **Crítico** — Necesita aprender ejercicios correctamente | Desconocimiento técnico |
| RF-ED-003 (Academia) | **Alto** — Educación basada en evidencia desde el inicio | PD-08 (Información basura) |
| RF-EN-004 (Calentamiento) | **Alto** — No sabe cómo hacer series de aproximación | PD-09 (Calentamiento improvisado) |
| RF-EN-011 (Readiness) | **Medio** — Aprende a escuchar su cuerpo | Ausencia de autorregulación |

### Impacto en STK-04 (Desarrollador/Agente)

| Requisito | Impacto |
|---|---|
| RNF-006 (Mantenibilidad, Clean Architecture) | **Crítico** — Código navegable, testable, extensible |
| Este documento (SRS) | **Crítico** — Requisitos claros, verificables, sin ambigüedad |
| RNF-004 (Seguridad) | **Alto** — Patrones de seguridad definidos, no improvisados |

### Impacto en STK-05 (Propietario)

| Requisito | Impacto |
|---|---|
| RNF-008 (Costo $0) | **Crítico** — Restricción presupuestaria inamovible |
| Todos los RF-EN-* | **Alto** — Diferenciación de producto vs. competencia |
| RNF-001 (Rendimiento) | **Alto** — Percepción de calidad profesional |

---

## 7. Glosario de Dominio

| Término | Definición |
|---|---|
| **Mesociclo** | Bloque de entrenamiento planificado de 3-16 semanas con un objetivo específico (hipertrofia, fuerza, etc.). |
| **Serie efectiva** | Serie de trabajo realizada entre RIR 0 y RIR 4 con carga significativa. Excluye series de calentamiento. |
| **RIR (Repetitions in Reserve)** | Escala subjetiva (0-5+) que indica cuántas repeticiones adicionales podría haber hecho el usuario antes de alcanzar el fallo muscular. |
| **RPE (Rate of Perceived Exertion)** | Escala de esfuerzo percibido del 1 al 10. RPE 10 = fallo muscular. Equivalencia: RPE = 10 − RIR. |
| **1RM (One Rep Max)** | El peso máximo que una persona puede levantar para una sola repetición de un ejercicio dado. Se estima algorítmicamente. |
| **Sobrecarga Progresiva** | Principio fundamental: incrementar gradualmente el estrés del entrenamiento (carga, volumen o intensidad) para producir adaptaciones continuas. |
| **Deload** | Semana de reducción planificada del volumen y/o intensidad para facilitar la recuperación y prevenir sobreentrenamiento. |
| **MEV (Minimum Effective Volume)** | Volumen mínimo de series semanales por grupo muscular necesario para generar una adaptación positiva. |
| **MRV (Maximum Recoverable Volume)** | Volumen máximo de series semanales del cual el cuerpo puede recuperarse. Entrenar por encima genera acumulación de fatiga y estancamiento. |
| **TDEE (Total Daily Energy Expenditure)** | Gasto calórico diario total incluyendo metabolismo basal, termogénesis de actividad y efecto térmico de los alimentos. |
| **Patrón de movimiento** | Clasificación biomecánica de un ejercicio: empuje vertical/horizontal, tirón vertical/horizontal, bisagra de cadera, sentadilla, acarreo. |
| **Superset** | Dos o más ejercicios realizados consecutivamente sin descanso entre ellos. |
| **Tempo** | Velocidad de ejecución de un ejercicio expresada en 4 dígitos: excéntrica-pausa inferior-concéntrica-pausa superior (ej. 3-1-2-0 = 3s bajando, 1s pausa, 2s subiendo, 0s arriba). |
| **DOMS (Delayed Onset Muscle Soreness)** | Dolor muscular de aparición tardía (24-72h post-ejercicio). Indicador de daño muscular, no necesariamente de estímulo óptimo. |
| **Readiness Score** | Puntuación compuesta que evalúa la preparación física y mental del usuario para entrenar, basada en sueño, estrés y DOMS. |
| **Tonelaje** | Volumen total expresado en kilogramos: suma de (peso × repeticiones) para todas las series de un ejercicio o sesión. |

---

*Fin del documento SRS. Versión 1.0 — 2026-02-27.*
