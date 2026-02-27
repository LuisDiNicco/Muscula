# Contexto Adicional y Documentación Complementaria — Musculá v1.0

**Versión:** 1.0  
**Fecha:** 2026-02-27  
**Propósito:** Proveer conocimiento de dominio, contexto técnico, edge cases, algoritmos detallados, fuentes de datos, y decisiones que no encajan en el SRS ni en la arquitectura pero son esenciales para la implementación correcta.

---

## Tabla de Contenidos

1. [Conocimiento Profundo del Dominio](#1-conocimiento-profundo-del-dominio)
2. [Algoritmos Clave del Sistema](#2-algoritmos-clave-del-sistema)
3. [Edge Cases del Gimnasio](#3-edge-cases-del-gimnasio)
4. [Fuentes de Datos y APIs — Guía de Integración](#4-fuentes-de-datos-y-apis--guía-de-integración)
5. [Seed de Datos Inicial](#5-seed-de-datos-inicial)
6. [Glosario Extendido de Fisiología](#6-glosario-extendido-de-fisiología)
7. [Consideraciones de UX Específicas del Dominio](#7-consideraciones-de-ux-específicas-del-dominio)
8. [Limitaciones Conocidas y Deuda Técnica Planificada](#8-limitaciones-conocidas-y-deuda-técnica-planificada)

---

## 1. Conocimiento Profundo del Dominio

### 1.1 Modelo Mental del Entrenamiento de Fuerza

Un usuario típico organiza su entrenamiento en las siguientes jerarquías temporales:

```
Macrociclo (6-12 meses)
  └── Mesociclo (3-16 semanas, típico 4-8)
       └── Microciclo (1 semana)
            └── Sesión (1 día de entrenamiento)
                 └── Ejercicio
                      └── Serie (Set)
                           └── Repetición (Rep)
```

**Para Musculá v1.0**, la unidad de planificación máxima es el **Mesociclo**. Los macrociclos son una organización mental del usuario pero no se modelan explícitamente (futuro v2).

### 1.2 Estructura Típica de un Mesociclo de Hipertrofia

Ejemplo real de un mesociclo de 5 semanas para un usuario intermedio:

```
Mesociclo: "Hipertrofia - Upper/Lower" (5 semanas)
├── Semana 1 (Introducción): Volumen bajo, RIR 4
├── Semana 2 (Acumulación): Volumen medio, RIR 3
├── Semana 3 (Acumulación): Volumen medio-alto, RIR 2
├── Semana 4 (Intensificación): Volumen alto, RIR 1-0
└── Semana 5 (Deload): Volumen 50%, RIR 5+

Días por semana:
├── Día 1: Upper A (Empuje énfasis) - 6 ejercicios
├── Día 2: Lower A (Cuádriceps énfasis) - 5 ejercicios
├── Día 3: Descanso
├── Día 4: Upper B (Tirón énfasis) - 6 ejercicios
├── Día 5: Lower B (Posterior énfasis) - 5 ejercicios
├── Día 6-7: Descanso
```

**Implicación para la implementación**: El usuario NO selecciona "lunes", "martes", etc. Selecciona "Día 1", "Día 2", etc. La app muestra el siguiente día de entrenamiento pendiente, independientemente del día de la semana.

### 1.3 Cómo Funciona la Sobrecarga Progresiva en la Práctica

El ciclo de progresión que el algoritmo de Musculá debe replicar:

```
Sesión 1: Sentadilla 80kg × 10 reps × RIR 3
  → El usuario reporta que le quedaban 3 en la recámara
  → Algoritmo evalúa: RIR reportado (3) >= RIR objetivo (2)
  → Decisión: mantener peso, el usuario aún tiene margen

Sesión 2: Sentadilla 80kg × 10 reps × RIR 2
  → RIR reportado (2) == RIR objetivo (2) → OK, progresión natural
  → Decisión: para próxima sesión, subir 2.5% → 82.5kg

Sesión 3: Sentadilla 82.5kg × 10 reps × RIR 1
  → RIR reportado (1) < RIR objetivo (2) → la carga fue un poco alta
  → Decisión: mantener 82.5kg hasta que el RIR se normalice a 2

Sesión 4: Sentadilla 82.5kg × 9 reps × RIR 0 (fallo)
  → Fallo con menos reps que la semana anterior → posible fatiga acumulada
  → Algoritmo verifica volumen semanal del grupo muscular
  → Si se acerca al MRV → sugiere deload la semana siguiente
```

### 1.4 Patrones de Movimiento y Clasificación de Ejercicios

La clasificación biomecánica es fundamental para el sistema de sustitución de ejercicios:

| Patrón de Movimiento | Ejemplos | Grupos Musculares Principales |
|---|---|---|
| **Empuje Horizontal** | Press banca, press mancuernas, fondos | Pecho, tríceps, deltoides anterior |
| **Empuje Vertical** | Press militar, press Arnold, elevaciones laterales | Hombros, tríceps |
| **Tirón Horizontal** | Remo con barra, remo mancuerna, remo cable | Espalda media, bíceps, romboides |
| **Tirón Vertical** | Dominadas, jalón al pecho, pullover | Dorsales, bíceps, redondo mayor |
| **Sentadilla (Quad-dominant)** | Sentadilla, prensa, sentadilla búlgara, extensiones | Cuádriceps, glúteos |
| **Bisagra de Cadera (Hip-hinge)** | Peso muerto, hip thrust, curl femoral, RDL | Isquiotibiales, glúteos, erectores |
| **Acarreo (Carry)** | Farmer walks, maleta walk | Core, trapecios, antebrazo |
| **Aislamiento** | Curl bíceps, extensión tríceps, elevaciones laterales | Variable (un solo grupo) |

**Regla de sustitución**: Un ejercicio solo puede sustituirse por otro del **mismo patrón de movimiento** Y que trabaje el **mismo grupo muscular primario**.

### 1.5 Grupos Musculares y Volumen Recomendado (Landmarks)

Basado en Israetel & Hoffmann (Renaissance Periodization), estos son los valores por defecto que la app usará:

| Grupo Muscular | MEV (series/semana) | MAV (óptimo) | MRV (máximo) | Frecuencia (veces/semana) | Recuperación (horas) |
|---|---|---|---|---|---|
| Pecho | 8 | 12-20 | 22 | 1.5-3 | 48-72 |
| Espalda | 8 | 14-22 | 25 | 2-4 | 48-72 |
| Hombros (deltoides laterales) | 6 | 12-20 | 26 | 2-6 | 24-48 |
| Bíceps | 4 | 8-14 | 20 | 2-4 | 24-48 |
| Tríceps | 4 | 6-12 | 18 | 2-4 | 24-48 |
| Cuádriceps | 6 | 12-18 | 20 | 1.5-3 | 72-96 |
| Isquiotibiales | 4 | 10-16 | 20 | 2-3 | 48-72 |
| Glúteos | 0 | 4-12 | 16 | 2-3 | 48-72 |
| Pantorrillas | 6 | 12-16 | 20 | 2-4 | 24-48 |
| Core / Abdominales | 0 | 4-12 | 16 | 2-4 | 24-48 |
| Trapecios | 0 | 4-10 | 14 | 2-4 | 24-48 |
| Antebrazos | 0 | 2-8 | 12 | 2-4 | 24-48 |

**MEV**: Minimum Effective Volume. Por debajo de esto, no hay estímulo suficiente.
**MAV**: Maximum Adaptive Volume. La "zona dulce" donde más crecimiento se obtiene.
**MRV**: Maximum Recoverable Volume. Por encima, la fatiga supera la recuperación.

Estos valores son configurables por el usuario porque varían por individuo.

### 1.6 Escala RIR (Repetitions in Reserve)

| RIR | Significado | RPE Equivalente | ¿Serie Efectiva? |
|---|---|---|---|
| 5+ | Muy lejos del fallo. Serie de calentamiento o muy conservadora. | RPE 4-5 | No |
| 4 | 4 reps en reserva. Serie ligera pero estimulante. | RPE 6 | Sí (límite) |
| 3 | 3 reps en reserva. Esfuerzo moderado. | RPE 7 | Sí |
| 2 | 2 reps en reserva. Esfuerzo alto, recomendado para hipertrofia. | RPE 8 | Sí |
| 1 | 1 rep en reserva. Muy cerca del fallo. | RPE 9 | Sí |
| 0 | Fallo muscular. No podría hacer una rep más con buena técnica. | RPE 10 | Sí |

**Importante**: El conteo de "series efectivas" para el MRV tracker solo cuenta series con RIR 0-4. Series con RIR 5+ (calentamiento, trabajo muy ligero) no cuentan.

---

## 2. Algoritmos Clave del Sistema

### 2.1 Algoritmo de Sugerencia Predictiva de Peso

```
FUNCIÓN sugerirPeso(ejercicio, usuario, readinessScore):
  
  ultimaSesion = obtenerUltimaSesion(ejercicio, usuario)
  
  SI ultimaSesion NO existe:
    RETORNAR null  // No hay dato histórico, usuario ingresa manualmente
  
  pesoAnterior = ultimaSesion.mejorSerie.peso
  repsAnteriores = ultimaSesion.mejorSerie.reps
  rirReportado = ultimaSesion.mejorSerie.rir
  rirObjetivo = planificacion.rirObjetivo  // Del mesociclo planificado
  
  // Paso 1: Evaluar si hay margen para subir
  deltaRir = rirReportado - rirObjetivo
  
  SI deltaRir > 0:
    // El usuario tenía más reserva de la necesaria → mantener peso
    // Esperar a que consolide antes de subir
    pesoSugerido = pesoAnterior
  
  SI deltaRir == 0:
    // Perfecto: progresión ordenada. Subir para la próxima sesión.
    incremento = calcularIncremento(ejercicio.tipo)
    pesoSugerido = pesoAnterior + incremento
  
  SI deltaRir < 0:
    // Se esforzó más de lo planificado → mantener o reducir
    SI rirReportado == 0 Y repsAnteriores < repsObjetivoMin:
      // Falló con pocas reps → reducir
      pesoSugerido = pesoAnterior * 0.95  // -5%
    SINO:
      pesoSugerido = pesoAnterior  // Mantener
  
  // Paso 2: Ajustar por readiness (si completó la encuesta)
  SI readinessScore existe:
    SI readinessScore < 2.5:
      pesoSugerido = pesoSugerido * 0.95  // -5% por baja preparación
    SI readinessScore >= 2.5 Y readinessScore <= 3.5:
      // Sin cambio
    SI readinessScore > 3.5:
      // Sin cambio adicional (no inflar la sugerencia por sentirse bien)
  
  // Paso 3: Redondear al incremento más cercano
  pesoSugerido = redondear(pesoSugerido, incrementoMinimo)
  
  RETORNAR pesoSugerido

FUNCIÓN calcularIncremento(tipoEjercicio):
  SI tipoEjercicio EN [sentadilla, peso_muerto, prensa]:
    RETORNAR 2.5  // kg
  SI tipoEjercicio EN [press_banca, remo, press_militar]:
    RETORNAR 2.5  // kg
  SI tipoEjercicio EN [aislamiento, máquina]:
    RETORNAR 1.25  // kg (o el incremento mínimo disponible)
  
FUNCIÓN redondear(peso, incremento):
  RETORNAR Math.round(peso / incremento) * incremento
```

### 2.2 Algoritmo de Generación de Calentamiento

```
FUNCIÓN generarCalentamiento(pesoTrabajo, pesoBarra = 20):
  
  SI pesoTrabajo < 40:
    RETORNAR []  // No se generan warmups para cargas muy ligeras
  
  series = []
  
  // Serie 1: Siempre barra vacía
  series.push({ peso: pesoBarra, reps: 10, tipo: 'warmup' })
  
  // Serie 2: 50% del peso de trabajo
  peso50 = redondear(pesoTrabajo * 0.50, 2.5)
  SI peso50 > pesoBarra:
    series.push({ peso: peso50, reps: 5, tipo: 'warmup' })
  
  // Serie 3: 70% del peso de trabajo
  peso70 = redondear(pesoTrabajo * 0.70, 2.5)
  SI peso70 > peso50:
    series.push({ peso: peso70, reps: 3, tipo: 'warmup' })
  
  // Serie 4: 85% (solo para cargas pesadas >= 80kg)
  SI pesoTrabajo >= 80:
    peso85 = redondear(pesoTrabajo * 0.85, 2.5)
    SI peso85 > peso70:
      series.push({ peso: peso85, reps: 1, tipo: 'warmup' })
  
  RETORNAR series
```

### 2.3 Algoritmo de TDEE Dinámico

Basado en el enfoque de MacroFactor (media móvil exponencial):

```
FUNCIÓN calcularTdeeDinamico(usuario):
  
  datos = obtenerDatos(usuario, ultimosDias = 28)
  
  SI datos.diasConPeso < 14 O datos.diasConCalorias < 14:
    // No hay suficientes datos → usar estimación estática
    RETORNAR {
      tdee: calcularTdeeEstatico(usuario),
      confianza: 'estimado'
    }
  
  // Calcular media móvil de peso (suavizar fluctuaciones)
  pesoInicio = mediaPonderada(datos.pesos[0..6])   // Media de la primera semana
  pesoFin = mediaPonderada(datos.pesos[-7..])       // Media de la última semana
  
  deltaPesoKg = pesoFin - pesoInicio
  periodoSemanas = datos.diasConPeso / 7
  
  // 1 kg de tejido ≈ 7700 kcal (mezcla grasa + músculo)
  excedente = (deltaPesoKg * 7700) / (periodoSemanas * 7)  // kcal/día de excedente
  
  // Calorías promedio ingeridas por día
  caloriasPromedio = media(datos.caloriasDiarias)
  
  // TDEE = calorías ingeridas - excedente/día
  tdeeCalculado = caloriasPromedio - excedente
  
  // Suavizar con exponential moving average
  SI usuario.tdeeAnterior existe:
    alpha = 0.1  // Factor de suavizado (lento, estable)
    tdee = alpha * tdeeCalculado + (1 - alpha) * usuario.tdeeAnterior
  SINO:
    tdee = tdeeCalculado
  
  confianza = datos.diasConPeso >= 28 ? 'preciso' : 'calibrando'
  
  RETORNAR { tdee: redondear(tdee, 10), confianza }

FUNCIÓN calcularTdeeEstatico(usuario):
  // Fórmula Mifflin-St Jeor
  SI usuario.genero == 'masculino':
    bmr = 10 * pesoKg + 6.25 * alturaCm - 5 * edad + 5
  SINO:
    bmr = 10 * pesoKg + 6.25 * alturaCm - 5 * edad - 161
  
  // Factor de actividad
  factores = {
    'sedentario': 1.2,
    'ligeramente_activo': 1.375,
    'moderadamente_activo': 1.55,
    'muy_activo': 1.725,
    'extremadamente_activo': 1.9
  }
  
  RETORNAR bmr * factores[usuario.nivelActividad]
```

### 2.4 Algoritmo de Estimación de 1RM

```
FUNCIÓN estimar1RM(peso, reps):
  SI reps == 0 O reps > 10:
    RETORNAR null  // No confiable para más de 10 reps
  
  SI reps == 1:
    RETORNAR peso  // Ya es un 1RM real
  
  // Fórmula de Epley
  epley = peso * (1 + reps / 30)
  
  // Fórmula de Brzycki
  brzycki = peso * (36 / (37 - reps))
  
  // Promedio de ambas para mayor precisión
  RETORNAR redondear((epley + brzycki) / 2, 0.5)
```

### 2.5 Algoritmo de Detección de Necesidad de Deload

```
FUNCIÓN evaluarDeload(usuario, grupoMuscular):
  
  volumeUltimas3Semanas = obtenerSeriesEfectivas(usuario, grupoMuscular, semanas = 3)
  mrvUsuario = obtenerMRV(usuario, grupoMuscular)
  
  // Condición 1: Volumen excedido
  semanasEnRojo = volumeUltimas3Semanas.filter(semana => semana > mrvUsuario).length
  
  // Condición 2: Estancamiento o regresión
  progresion = evaluarProgresion(usuario, grupoMuscular, semanas = 3)
  // progresion: 'mejorando', 'estancado', 'empeorando'
  
  // Condición 3: Readiness Scores bajos sostenidos
  readinessPromedio = promedioReadiness(usuario, semanas = 2)
  
  necesitaDeload = FALSO
  razones = []
  
  SI semanasEnRojo >= 2:
    necesitaDeload = VERDADERO
    razones.push("Volumen por encima del MRV por 2+ semanas")
  
  SI progresion == 'empeorando':
    necesitaDeload = VERDADERO
    razones.push("Rendimiento en regresión (menos reps o más RIR)")
  
  SI readinessPromedio < 2.0:
    necesitaDeload = VERDADERO
    razones.push("Readiness score bajo sostenido")
  
  SI progresion == 'estancado' Y semanasEnRojo >= 1:
    necesitaDeload = VERDADERO
    razones.push("Estancamiento con volumen elevado")
  
  RETORNAR { necesitaDeload, razones }
```

### 2.6 Algoritmo de Calculadora de Discos

```
FUNCIÓN calcularDiscos(pesoObjetivo, pesoBarra, discosDisponibles):
  // discosDisponibles: array ordenado de mayor a menor [25, 20, 15, 10, 5, 2.5, 1.25]
  
  pesoParaDiscos = pesoObjetivo - pesoBarra
  
  SI pesoParaDiscos <= 0:
    RETORNAR { discosPorLado: [], pesoReal: pesoBarra }
  
  SI pesoParaDiscos % 2 != 0:
    // No se puede dividir equitativamente → aproximar al más cercano
    pesoParaDiscos = redondearAlMasCercano(pesoParaDiscos, 2 * min(discosDisponibles))
  
  pesoPorLado = pesoParaDiscos / 2
  discosPorLado = []
  pesoRestante = pesoPorLado
  
  PARA CADA disco EN discosDisponibles (de mayor a menor):
    MIENTRAS pesoRestante >= disco:
      discosPorLado.push(disco)
      pesoRestante -= disco
  
  pesoReal = pesoBarra + (pesoPorLado - pesoRestante) * 2
  
  SI pesoRestante > 0:
    // No se pudo alcanzar exactamente
    RETORNAR { discosPorLado, pesoReal, advertencia: "Peso más cercano alcanzable" }
  
  RETORNAR { discosPorLado, pesoReal }
```

---

## 3. Edge Cases del Gimnasio

Estos son escenarios reales que los usuarios encuentran y que la app debe manejar correctamente:

### 3.1 Edge Cases de Tracking

| # | Escenario | Comportamiento Esperado |
|---|---|---|
| EC-01 | Usuario hace más series de las planificadas | Permitir agregar series extra. Se cuentan en series efectivas si RIR ≤ 4. |
| EC-02 | Usuario hace menos series de las planificadas | Series no completadas se marcan como "omitidas". No penalizan analíticas. |
| EC-03 | Drop set (reducir peso sin descanso) | Registrar como series individuales consecutivas con descanso = 0s. |
| EC-04 | Peso parcial (ej. 0.5 kg extra con microplatos) | Permitir incrementos de 0.5 kg (configurado en preferencias). |
| EC-05 | Repeticiones parciales (reps con rango incompleto) | El usuario anota en la nota de serie. No se diferencian de reps completas en el sistema v1. |
| EC-06 | Cambio de ejercicio a mitad de sesión (no sustitución, sino agregar uno nuevo) | "Agregar ejercicio" durante la sesión. Se vincula al día pero no estaba planificado. |
| EC-07 | Reiniciar sesión (empezar de cero) | Confirmar → eliminar sesión en progreso → iniciar nueva desde plantilla. |
| EC-08 | El usuario cierra la app sin finalizar sesión | La sesión queda en estado "en_progreso". Al abrir la app, preguntar: "Tienes una sesión sin terminar. ¿Continuar o descartar?" |
| EC-09 | El mismo ejercicio aparece dos veces en el mismo día (ej. bíceps al inicio y al final) | Permitir. Cada instancia se trackea por separado. El volumen se suma. |
| EC-10 | Usuario cambia el sistema de unidades a mitad de un mesociclo | Convertir todos los registros históricos a la nueva unidad en la presentación. Almacenar siempre en kg internamente. |

### 3.2 Edge Cases de Nutrición

| # | Escenario | Comportamiento Esperado |
|---|---|---|
| EC-11 | El usuario no registra comidas por varios días | No mostrar mensajes negativos. El TDEE dinámico usa solo los días con datos. |
| EC-12 | Búsqueda de alimento no retorna resultados | Ofrecer "Crear alimento personalizado" con campos de macros manuales. |
| EC-13 | Escáner de código de barras no encuentra producto | Mismo que EC-12. Adicionalmente, el usuario puede reportar el código faltante. |
| EC-14 | Peso corporal fluctúa drásticamente (> 2kg en un día) | La media móvil de 7 días suaviza. Si la variación es > 3kg, no alertar pero no usarlo para el cálculo de TDEE de ese día. |

### 3.3 Edge Cases de Autenticación y Datos

| # | Escenario | Comportamiento Esperado |
|---|---|---|
| EC-15 | Token de acceso expira durante una sesión de entrenamiento | El API client intenta refresh automático. Si falla → continuar offline. Sync al reautenticarse. |
| EC-16 | Importación CSV con ejercicios duplicados | Detección de duplicados por nombre (normalizado: lowercase, sin acentos). Ofrecer merge o saltar. |
| EC-17 | Importación con datos inconsistentes (peso negativo, reps = 0) | Validar cada fila. Reportar filas descartadas con motivo. No bloquear la importación completa. |
| EC-18 | Dos dispositivos editando el mismo mesociclo | Last-write-wins por campo. No se espera edición colaborativa en v1. |

---

## 4. Fuentes de Datos y APIs — Guía de Integración

### 4.1 Open Food Facts API

| Aspecto | Detalle |
|---|---|
| **URL Base** | `https://world.openfoodfacts.org/api/v2/` |
| **Autenticación** | Ninguna (API pública). Rate limit implícito: ~100 req/min |
| **Endpoints clave** | `GET /product/{barcode}` — Obtener producto por código de barras. `GET /cgi/search.pl?search_terms=X&json=true` — Búsqueda por texto |
| **Campos útiles** | `product_name`, `nutriments.energy-kcal_100g`, `nutriments.proteins_100g`, `nutriments.carbohydrates_100g`, `nutriments.fat_100g`, `brands`, `image_url` |
| **Fallbacks** | FatSecret API (API key necesaria, tier gratuito), Edamam API (API key, plan de desarrollador) |
| **Estrategia** | Backend hace de proxy. Cachear resultados en DB local por 30 días. Evitar que el frontend llame directamente a API externa. |
| **Parsing** | Los datos de Open Food Facts pueden estar incompletos. Validar: si `energy-kcal_100g` no existe, descartar el producto y no mostrarlo. |

### 4.2 APIs de Ejercicios

| API | URL | Auth | Uso |
|---|---|---|---|
| **wger** | `https://wger.de/api/v2/` | Ninguna | Estructura base: ejercicios, músculos, categorías. Soporte multilingüe. |
| **ExerciseDB (RapidAPI)** | `https://exercisedb.p.rapidapi.com/` | API Key (header `X-RapidAPI-Key`) | GIFs de ejercicios. Tier gratuito: 100 req/día. |
| **GitHub Datasets** | `yuhonas/free-exercise-db`, `wrkout/exercises.json` | N/A (descarga directa) | Seed offline: JSONs con nombre, músculos, instrucciones, imágenes. |

**Estrategia de seed**: 
1. Descargar datasets de GitHub al momento del desarrollo.
2. Procesar JSONs para crear el seed SQL/Prisma (`prisma/seed.ts`).
3. Enriquecer con datos de wger API (traducciones, músculos secundarios).
4. GIFs: descargar los de ExerciseDB (tier gratuito) y almacenar localmente en Supabase Storage.
5. En producción, NO llamar a estas APIs en runtime para ejercicios. Todo es seed estático.

### 4.3 Europe PMC (Papers Científicos)

| Aspecto | Detalle |
|---|---|
| **URL Base** | `https://www.ebi.ac.uk/europepmc/webservices/rest/` |
| **Autenticación** | Ninguna |
| **Endpoint clave** | `GET /search?query=DOI:{doi}&format=json` |
| **Campos útiles** | `title`, `authorString`, `journalTitle`, `pubYear`, `abstractText`, `doi` |
| **Uso** | Cuando un artículo de la Academia tiene un DOI en su bibliografía, el frontend puede fetchear los metadatos para mostrar: "Schoenfeld, B. J. (2010). The mechanisms of muscle hypertrophy... *J Strength Cond Res*." |
| **Estrategia** | Cachear resultados en DB. Los DOIs no cambian. TTL: indefinido (inmutable). |

### 4.4 Google Fit REST API

| Aspecto | Detalle |
|---|---|
| **URL Base** | `https://www.googleapis.com/fitness/v1/users/me/` |
| **Autenticación** | OAuth2 (scope: `fitness.activity.read`) |
| **Endpoints** | `dataSources`, `dataset:aggregate` |
| **Datos de interés** | Pasos diarios (`com.google.step_count.delta`), calorías activas (`com.google.calories.expended`) |
| **Flujo** | 1. Usuario autoriza via OAuth2 en el frontend. 2. Backend recibe authorization code. 3. Backend intercambia por access token + refresh token. 4. Backend tiene un job periódico (o on-demand) que consulta pasos del día anterior. |
| **Prioridad** | BAJA. Esta integración es la última en implementarse. El sistema funciona perfectamente sin ella. |

---

## 5. Seed de Datos Inicial

### 5.1 Ejercicios Mínimos (150+)

El seed debe incluir al menos estos ejercicios organizados por grupo muscular:

**Pecho (12+ ejercicios)**
- Press banca con barra (plano, inclinado, declinado)
- Press con mancuernas (plano, inclinado)
- Aperturas con mancuernas (plano, inclinado)
- Cruces en poleas (alto, medio, bajo)
- Fondos en paralelas
- Machine chest press
- Push-ups (y variantes)

**Espalda (12+ ejercicios)**
- Dominadas (agarre prono, supino, neutro)
- Jalón al pecho (varias agarres)
- Remo con barra (prono, supino)
- Remo con mancuerna
- Remo en cable sentado
- Pullover
- Face pulls
- Remo T-bar

**Hombros (10+ ejercicios)**
- Press militar con barra
- Press Arnold
- Elevaciones laterales (mancuerna, cable)
- Elevaciones frontales
- Pájaros (rear delt fly)
- Face pulls
- Encogimientos (shrugs)

**Bíceps (8+ ejercicios)**
- Curl con barra (recta, EZ)
- Curl con mancuernas (alterno, martillo, concentrado)
- Curl en polea (bajo, alto)
- Curl predicador
- Curl inclinado

**Tríceps (8+ ejercicios)**
- Press francés (barra, mancuernas)
- Extensión en polea (cuerda, barra V)
- Fondos en banco
- Kickbacks
- Close-grip bench press

**Cuádriceps (8+ ejercicios)**
- Sentadilla con barra (alta, baja)
- Sentadilla frontal
- Prensa de piernas
- Sentadilla búlgara
- Extensión de cuádriceps
- Sentadilla goblet
- Hack squat
- Zancadas / Lunges

**Isquiotibiales (8+ ejercicios)**
- Peso muerto rumano (RDL)
- Peso muerto convencional
- Peso muerto sumo
- Curl femoral (sentado, tumbado)
- Hip thrust
- Good mornings
- Nordic curl
- Glute-ham raise

**Glúteos (6+ ejercicios)**
- Hip thrust con barra
- Sentadilla sumo
- Patada de glúteo (cable/máquina)
- Puente de glúteos
- Abducción de cadera
- Step-ups

**Pantorrillas (4+ ejercicios)**
- Elevación de talones de pie
- Elevación de talones sentado
- Elevación en prensa
- Elevación unilateral

**Core (8+ ejercicios)**
- Plancha
- Crunch en polea
- Ab wheel
- Pallof press
- Russian twist
- Hanging leg raises
- Dead bug
- Side planks

### 5.2 Artículos de la Academia (Seed Mínimo)

| # | Título | Categoría | Contenido resumido | DOIs de referencia |
|---|---|---|---|---|
| 1 | "¿Qué es el RIR y cómo usarlo?" | Fundamentos | Explicar la escala RIR, por qué es superior a "ir al fallo", cómo auto-evaluar | Helms et al. (2016) |
| 2 | "Guía de Sobrecarga Progresiva" | Entrenamiento | Principio de adaptación, cómo agregar carga gradualmente, cuándo mantener | Schoenfeld (2010) |
| 3 | "Volumen de Entrenamiento: MEV, MAV y MRV" | Entrenamiento | Landmarks de volumen, cómo contarlos, cuándo están alto | Israetel & Hoffmann |
| 4 | "Cómo Planificar un Mesociclo" | Periodización | Estructura semanal, progresión de volumen e intensidad, deload | Helms, Valdez, Morgan |
| 5 | "TDEE Dinámico: Tu Gasto Real" | Nutrición | Por qué las calculadoras estáticas fallan, cómo funciona el ajuste dinámico | Trexler et al. (2014) |
| 6 | "Guía de Deload" | Recuperación | Cuándo, cómo, si se pierde progreso, protocolos concretos | Israetel & Hoffmann |

### 5.3 Valores por Defecto del Sistema

| Configuración | Valor por defecto |
|---|---|
| Descanso - ejercicio compuesto | 180 segundos |
| Descanso - ejercicio de aislamiento | 90 segundos |
| Alerta pre-fin descanso | 30 segundos antes |
| Incremento mínimo de peso (kg) | 2.5 kg |
| Incremento mínimo de peso (lbs) | 5 lbs |
| Peso de barra olímpica | 20 kg / 45 lbs |
| Discos disponibles (kg) | [25, 20, 15, 10, 5, 2.5, 1.25] |
| Discos disponibles (lbs) | [45, 35, 25, 10, 5, 2.5] |
| Umbral de 1RM confiable (max reps) | 10 |
| Semanas mínimas para TDEE dinámico | 14 días |
| Factor de suavizado TDEE (alpha) | 0.1 |
| Calorías por kg de peso corporal cambiado | 7700 kcal |
| Expiración de código de rutina compartida | 30 días |

---

## 6. Glosario Extendido de Fisiología

Complementa al glosario del SRS con términos que los desarrolladores/agentes necesitan entender para implementar correctamente:

| Término | Definición | Relevancia para la implementación |
|---|---|---|
| **Hipertrofia** | Aumento del tamaño de las fibras musculares. Objetivo principal de la mayoría de usuarios. | El sistema está optimizado para este objetivo. La mayoría de los algoritmos se basan en esta premisa. |
| **SNC (Sistema Nervioso Central)** | Control central de la fuerza muscular. Se fatiga independientemente del músculo. | Por eso el sistema usa RIR en lugar de ir al fallo siempre: proteger el SNC. |
| **Fallo muscular** | Incapacidad de completar una repetición con buena técnica. RIR = 0. | El sistema NO promueve ir al fallo sistemáticamente. Es una herramienta, no el objetivo. |
| **Frecuencia** | Cuántas veces por semana se entrena un grupo muscular. | Influye en cómo se distribuyen los días del mesociclo. El heatmap usa esto para colores. |
| **Superset** | Dos ejercicios ejecutados sin descanso entre ellos. | Requiere agrupación visual en la UI de tracking. El descanso se cuenta al final del grupo. |
| **Tempo** | Velocidad controlada de cada fase del movimiento (4-1-2-0). | Campo opcional en la planificación. No todas las series lo usan. |
| **Recomposición corporal** | Perder grasa y ganar músculo simultáneamente. Posible principalmente en principiantes o al retomar. | Modo nutricional especial con déficit leve y alta proteína. |
| **Periódización** | Variación planificada del entrenamiento a lo largo del tiempo. | Los mesociclos son la unidad de periodización que Musculá implementa. |
| **Tonnage/Tonelaje** | Peso × Repeticiones sumado para todas las series. Métrica de volumen absoluto. | Se calcula automáticamente por sesión y por ejercicio para gráficos de tendencias. |
| **Patrón de movimiento** | Clasificación biomecánica de un ejercicio según la dirección de la fuerza y las articulaciones implicadas. | Es la base del sistema de sustitución de ejercicios. |

---

## 7. Consideraciones de UX Específicas del Dominio

### 7.1 Contexto de Uso Físico

- **Manos sudadas / con guantes**: Botones grandes (mínimo 48×48px). Targets amplios. Evitar gestos pequeños.
- **Entre series (60-180s)**: La interacción debe ser rápida (< 3 taps). No forzar scroll innecesario.
- **Pantalla con brillo alto**: El tema oscuro es preferido por la mayoría de usuarios de gimnasio (menos brillo en la cara).
- **Posición awkward**: El usuario puede estar acostado en un banco mirando el teléfono. La UI funcional debe estar en la mitad inferior de la pantalla (zona de pulgar).
- **Distracción ambiental**: Música alta, gente. Las notificaciones deben ser vibración, no sonido.

### 7.2 Principios de Tono y Lenguaje

| Aspecto | Correcto | Incorrecto |
|---|---|---|
| **Nutrición** | "Hoy consumiste 2,300 kcal. Tu objetivo es 2,500." | "¡Te pasaste! Cuidado con lo que comes." |
| **Rendimiento bajo** | "Tu readiness de hoy es bajo. Se ajustó la sugerencia de carga." | "No dormiste lo suficiente. El entrenamiento será malo." |
| **Días sin entrenar** | (nada, no comentar) | "¡Llevas 3 días sin entrenar! No pierdas el ritmo." |
| **Deload sugerido** | "Tu volumen ha sido alto. Considera una semana de descarga para optimizar la recuperación." | "Estás sobreentrenado. Necesitas parar." |

**Principio general**: Información neutral + sugerencia constructiva. Nunca culpar, nunca ser condescendiente. El usuario es adulto y toma sus propias decisiones.

### 7.3 Navegación Principal (Bottom Navigation)

La PWA usa bottom navigation con 5 ítems máximo:

```
┌────────┬────────┬────────┬────────┬────────┐
│ 🏠     │ 💪     │ ⏱️     │ 📊     │ 👤     │
│ Home   │ Train  │ Track  │ Stats  │ Profile│
└────────┴────────┴────────┴────────┴────────┘
```

| Tab | Destino | Contenido |
|---|---|---|
| Home | Dashboard | Resumen: próximo entrenamiento, TDEE, peso, heatmap mini |
| Train | Mesociclos | Lista de mesociclos, planificación, wiki de ejercicios |
| Track | Sesión activa | Iniciar/continuar sesión, temporizador, tracking en vivo |
| Stats | Analíticas | Volumen, tendencias, PRs, correlaciones |
| Profile | Perfil y ajustes | Datos personales, nutrición, body metrics, import/export, ajustes |

---

## 8. Limitaciones Conocidas y Deuda Técnica Planificada

### 8.1 Limitaciones de v1.0

| Limitación | Razón | Plan futuro |
|---|---|---|
| Sin macrociclos (solo mesociclos) | Complejidad excesiva para v1. Los mentociclos cubren el 95% de necesidades. | v2: Vincular mesociclos en secuencia con transiciones automáticas. |
| Sin rol de Coach | Requiere sistema multi-tenant complejo. | v2: Dashboard de coach que visualice datos de clientes. |
| Sin chat/ interacción social más allá de compartir rutinas | Complejidad de backend (websockets, moderación). | v3: Comentarios en rutinas compartidas, feed de actividad. |
| TDEE dinámico requiere 14 días de datos | Limitación matemática real. No se puede calcular con menos datos. | Mejorar onboarding con cuestionario detallado para una mejor estimación estática inicial. |
| Los GIFs de ejercicios dependen del seed, no se generan | Generar video es prohibitivamente caro. | Evaluar contribuciones de la comunidad a largo plazo. |
| Sin integración Apple HealthKit nativa | Al ser PWA, no hay acceso a HealthKit directamente. | Si se decide release nativo (Capacitor/TWA), habilitar. |
| Cache en memoria (no Redis) | Free tier no incluye Redis. | Migrar a Redis cuando se escale más allá de single instance. |
| Sin real-time updates (websockets) | Complejidad innecesaria para single-user tracking. | v2 si se implementa el módulo de coach (ver datos del cliente en tiempo real). |

### 8.2 Assumptions Técnicas

1. **Single instance backend**: En free tier (Render/Koyeb), el backend corre en un solo contenedor. Esto afecta: cache en memoria es suficiente, no se necesita distributed locking, los jobs background corren en el mismo proceso.
2. **PostgreSQL connection limits**: Supabase/Neon free tier tiene límite de conexiones (~20). Prisma connection pool debe configurarse ≤ 10.
3. **Cold starts**: Render free tier pone a dormir el servicio tras inactividad. El primer request tras sleep puede tardar 10-30 segundos. Mitigar con un ping periódico desde el frontend o un cron externo (ej. UptimeRobot free).
4. **Almacenamiento**: Supabase Storage free tier: 1GB. Suficiente para ~1000 fotos comprimidas a 1MB. Monitorear y avisar.

---

*Fin del documento de Contexto Adicional. Versión 1.0 — 2026-02-27.*
