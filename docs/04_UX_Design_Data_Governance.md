# Guía Estética y Gobernanza de la Información — Musculá v1.0

**Versión:** 1.0  
**Fecha:** 2026-02-27  
**Propósito:** Definir el sistema de diseño visual, la gobernanza de datos, el esquema de base de datos, los contratos de la API REST, y las directrices de UX/UI.

---

## Tabla de Contenidos

1. [Sistema de Diseño Visual](#1-sistema-de-diseño-visual)
2. [Layouts y Estructura de Pantallas](#2-layouts-y-estructura-de-pantallas)
3. [Principios de UX/UI](#3-principios-de-uxui)
4. [Gobernanza de la Información](#4-gobernanza-de-la-información)
5. [Diagrama Entidad-Relación (DER)](#5-diagrama-entidad-relación-der)
6. [Contratos de API REST (Endpoints e Interfaces)](#6-contratos-de-api-rest-endpoints-e-interfaces)

---

## 1. Sistema de Diseño Visual

### 1.1 Paleta de Colores

El sistema usa una paleta dual (tema claro y oscuro) basada en CSS variables de shadcn/ui con extensiones custom para el dominio fitness.

#### Paleta Base (HSL — compatible con TailwindCSS + shadcn/ui)

```css
/* ═══════════════════════════════════════ */
/* TEMA OSCURO (Predeterminado)           */
/* ═══════════════════════════════════════ */
:root[data-theme="dark"] {
  /* Fondos */
  --background:         222 47% 6%;      /* #0a0e17 — Negro azulado profundo */
  --foreground:         210 40% 96%;     /* #f0f4f8 — Blanco cálido */
  
  --card:               222 44% 8%;      /* #0d1220 — Surface elevada */
  --card-foreground:    210 40% 96%;
  
  --popover:            222 44% 10%;
  --popover-foreground: 210 40% 96%;
  
  /* Colores primarios (Azul eléctrico — profesional, confianza, tecnología) */
  --primary:            217 91% 60%;     /* #3b82f6 — Azul brillante */
  --primary-foreground: 222 47% 6%;
  
  /* Secundario (Cyan/Teal — frescura, salud) */
  --secondary:          174 72% 46%;     /* #20b2aa — Teal vibrante */
  --secondary-foreground: 222 47% 6%;
  
  /* Acento (Ámbar — energía, atención, fitness) */
  --accent:             38 92% 50%;      /* #f59e0b — Ámbar dorado */
  --accent-foreground:  222 47% 6%;
  
  /* Destructivo */
  --destructive:        0 84% 60%;       /* #ef4444 — Rojo */
  --destructive-foreground: 210 40% 98%;
  
  /* Muted */
  --muted:              217 33% 17%;     /* #1e293b — Gris azulado oscuro */
  --muted-foreground:   215 20% 65%;     /* #94a3b8 — Gris texto secundario */
  
  /* Bordes */
  --border:             217 33% 17%;
  --input:              217 33% 17%;
  --ring:               217 91% 60%;
  
  /* Radius */
  --radius:             0.75rem;
}

/* ═══════════════════════════════════════ */
/* TEMA CLARO                             */
/* ═══════════════════════════════════════ */
:root[data-theme="light"] {
  --background:         0 0% 100%;       /* #ffffff */
  --foreground:         222 47% 11%;     /* #0f172a */
  
  --card:               0 0% 98%;        /* #fafafa */
  --card-foreground:    222 47% 11%;
  
  --primary:            217 91% 50%;     /* #2563eb — Azul un poco más oscuro */
  --primary-foreground: 0 0% 100%;
  
  --secondary:          174 72% 40%;     /* #14956e */
  --secondary-foreground: 0 0% 100%;
  
  --accent:             38 92% 45%;      /* #d97706 */
  --accent-foreground:  0 0% 100%;
  
  --destructive:        0 84% 50%;
  --destructive-foreground: 0 0% 100%;
  
  --muted:              220 14% 96%;     /* #f1f5f9 */
  --muted-foreground:   215 16% 47%;    /* #64748b */
  
  --border:             220 13% 91%;
  --input:              220 13% 91%;
  --ring:               217 91% 50%;
}
```

#### Colores Semánticos del Dominio Fitness

```css
:root {
  /* ── Colores para RIR / Intensidad ── */
  --rir-5-plus:   142 71% 45%;    /* Verde — lejos del fallo */
  --rir-4:        142 60% 40%;    /* Verde medio */
  --rir-3:        48 96% 50%;     /* Amarillo — esfuerzo moderado */
  --rir-2:        25 95% 53%;     /* Naranja — esfuerzo alto */
  --rir-1:        0 84% 55%;      /* Rojo claro — muy cerca del fallo */
  --rir-0:        0 84% 45%;      /* Rojo oscuro — fallo muscular */
  
  /* ── Colores para MRV/MEV Tracker (barras de volumen) ── */
  --volume-below-mev: 215 16% 47%;  /* Gris — por debajo del mínimo */
  --volume-optimal:   142 71% 45%;  /* Verde — zona óptima */
  --volume-warning:   48 96% 50%;   /* Amarillo — acercándose al MRV */
  --volume-over-mrv:  0 84% 55%;    /* Rojo — excedido */
  
  /* ── Colores para Heatmap Muscular ── */
  --muscle-trained-today:    0 80% 40%;    /* Rojo oscuro */
  --muscle-1day:             0 70% 50%;    /* Rojo */
  --muscle-2days:            25 90% 55%;   /* Naranja */
  --muscle-3days:            38 92% 50%;   /* Ámbar */
  --muscle-4days:            48 96% 50%;   /* Amarillo */
  --muscle-5days:            80 60% 45%;   /* Lima */
  --muscle-recovered:        142 71% 45%;  /* Verde — completamente recuperado */
  --muscle-not-trained:      215 16% 30%;  /* Gris oscuro — +7 días */
  
  /* ── Colores para Macros (Nutrición) ── */
  --macro-protein:     217 91% 60%;   /* Azul — proteínas */
  --macro-carbs:       38 92% 50%;    /* Ámbar — carbohidratos */
  --macro-fat:         0 84% 55%;     /* Rojo — grasas */
  --macro-calories:    142 71% 45%;   /* Verde — calorías totales */
  
  /* ── Colores para Readiness Score ── */
  --readiness-low:     0 84% 55%;     /* Rojo — < 2.5 */
  --readiness-medium:  48 96% 50%;    /* Amarillo — 2.5-3.5 */
  --readiness-high:    142 71% 45%;   /* Verde — > 3.5 */
  
  /* ── Estado de conexión ── */
  --status-online:     142 71% 45%;
  --status-offline:    48 96% 50%;
  --status-syncing:    217 91% 60%;
  --status-error:      0 84% 55%;
}
```

### 1.2 Tipografía

| Uso | Font | Peso | Tamaño | Line Height |
|---|---|---|---|---|
| **Heading H1** | Inter | 700 (Bold) | 28px / 1.75rem | 1.2 |
| **Heading H2** | Inter | 600 (Semibold) | 22px / 1.375rem | 1.3 |
| **Heading H3** | Inter | 600 | 18px / 1.125rem | 1.4 |
| **Body** | Inter | 400 (Regular) | 16px / 1rem | 1.5 |
| **Body Small** | Inter | 400 | 14px / 0.875rem | 1.5 |
| **Caption** | Inter | 400 | 12px / 0.75rem | 1.4 |
| **Mono (datos)** | JetBrains Mono | 500 | 16px / 1rem | 1.4 |

- **Inter**: Se elige por su excelente legibilidad en pantallas pequeñas y su amplio soporte de pesos.
- **JetBrains Mono**: Para valores numéricos (pesos, reps, tablas) para alineación monoespaciada.

### 1.3 Espaciado

Basado en el sistema de 4px grid de Tailwind:

| Token | Valor | Uso |
|---|---|---|
| `space-1` | 4px | Micro spacing (entre ícono y texto) |
| `space-2` | 8px | Padding dentro de badges/chips |
| `space-3` | 12px | Gap entre elementos en una serie |
| `space-4` | 16px | Padding interno de cards |
| `space-5` | 20px | Gap entre secciones menores |
| `space-6` | 24px | Padding de página (márgenes laterales mobile) |
| `space-8` | 32px | Gap entre secciones mayores |
| `space-12` | 48px | Padding vertical de secciones de página |

### 1.4 Iconografía

- **Librería**: Lucide React (open source, tree-shakeable, consistente con shadcn/ui).
- **Tamaño estándar**: 20×20px en contextos normales, 24×24px en bottom nav, 16×16px en línea con texto.
- **Color**: Hereda del contexto (`currentColor`).
- **Custom icons**: Para el heatmap muscular y la calculadora de discos, se usarán SVGs propios.

### 1.5 Componentes Clave (shadcn/ui + Custom)

| Componente | Fuente | Uso principal |
|---|---|---|
| `Button` | shadcn/ui | Acciones primarias, secundarias, destructivas |
| `Input` / `NumberInput` | shadcn/ui + custom | Entrada de peso, reps, RIR (incremento/decremento con botones +/-) |
| `Card` | shadcn/ui | Contenedor de ejercicio, comida, artículo |
| `Dialog` / `Sheet` | shadcn/ui | Modales (sustitución de ejercicio, notas). Sheet desde abajo para mobile. |
| `Tabs` | shadcn/ui | Navegación secundaria dentro de secciones |
| `Progress` / `CircularProgress` | shadcn/ui + custom | Barras de macros, temporizador |
| `Select` / `Combobox` | shadcn/ui | Selección de ejercicios, equipamiento |
| `Table` | shadcn/ui | Historial de series, PRs |
| `Badge` | shadcn/ui | RIR indicator, estado de sesión, tags |
| `Toast` | shadcn/ui (sonner) | Confirmaciones no intrusivas (serie guardada, sync completado) |
| `RestTimerOverlay` | Custom | Temporizador flotante persistente durante tracking |
| `SetInputRow` | Custom | Fila de entrada de serie: peso / reps / RIR / check |
| `MuscleHeatmapSvg` | Custom | SVG interactivo del cuerpo humano |
| `BarWithDiscs` | Custom | SVG de barra olímpica con discos |
| `MacroRing` | Custom | Anillo circular de progreso de macros |

---

## 2. Layouts y Estructura de Pantallas

### 2.1 Layout Principal (Authenticated)

```
┌──────────────────────────────────┐
│  ┌────────────────────────────┐  │
│  │       Status Bar (OS)      │  │
│  ├────────────────────────────┤  │
│  │  Header (opcional)         │  │  ← Título de página + acciones contextuales
│  │  48px height               │  │
│  ├────────────────────────────┤  │
│  │                            │  │
│  │                            │  │
│  │    Content Area            │  │  ← Scrollable. Padding: 16px lateral, 12px top
│  │    (flex-1, overflow-y)    │  │
│  │                            │  │
│  │                            │  │
│  │                            │  │
│  ├────────────────────────────┤  │
│  │  ┌──────────────────────┐  │  │  ← Temporizador de descanso (overlay condicional)
│  │  │  Rest Timer (56px)   │  │  │     Solo visible durante sesión activa
│  │  └──────────────────────┘  │  │
│  ├────────────────────────────┤  │
│  │  Bottom Navigation (64px)  │  │  ← 5 tabs: Home, Train, Track, Stats, Profile
│  └────────────────────────────┘  │
└──────────────────────────────────┘
          360-428px (mobile)
```

### 2.2 Layout del Tracking en Vivo (Sesión Activa)

```
┌──────────────────────────────────┐
│  Header: "Día 1: Upper A"  ☰ ⏱  │  ← Nombre del día + menú + cronómetro sesión
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │ 💪 Press Banca con Barra  │  │  ← Nombre del ejercicio + ícono patrón
│  │ Último: 80kg × 10 (RIR 2) │  │  ← Referencia de última sesión
│  │ Sugerido: 82.5kg          │  │  ← Sugerencia predictiva
│  ├────────────────────────────┤  │
│  │ Warmup Sets (colapsable)  │  │
│  │  Barra × 10  ✓            │  │
│  │  40kg × 5    ✓            │  │
│  │  60kg × 3    ✓            │  │
│  ├────────────────────────────┤  │
│  │ Working Sets              │  │
│  │ #  Peso   Reps  RIR  ✓   │  │  ← Header de tabla
│  │ 1  [82.5] [10]  [2]  ☐   │  │  ← Input row (tap para editar inline)
│  │ 2  [82.5] [10]  [2]  ☐   │  │
│  │ 3  [82.5] [10]  [2]  ☐   │  │
│  │ 4  [82.5] [ 9]  [1]  ☐   │  │
│  │         [+ Añadir Serie]  │  │
│  │                    [📝]   │  │  ← Nota de serie
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ 💪 Remo con Barra         │  │  ← Siguiente ejercicio
│  │ ...                        │  │
│  └────────────────────────────┘  │
│                                  │
│  [Sustituir] [Calculadora ⚖️]   │  ← Botones flotantes de contexto
│                                  │
├──────────────────────────────────┤
│  ⏱ 1:23 / 3:00  ▓▓▓▓▓▓░░░░░░  │  ← Rest timer overlay (auto-inicia al completar set)
├──────────────────────────────────┤
│  🏠  💪  ⏱️  📊  👤            │  ← Bottom nav
└──────────────────────────────────┘
```

### 2.3 Layout del Dashboard (Home)

```
┌──────────────────────────────────┐
│  🏋️ Musculá     [🔔]  [👤]     │  ← Logo + notificaciones + avatar
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │  📅 Próximo Entrenamiento  │  │  ← Card prominente
│  │  Día 3: Upper B            │  │
│  │  [Iniciar Sesión →]        │  │  ← CTA principal
│  └────────────────────────────┘  │
│                                  │
│  ── Hoy ─────────────────────── │
│  ┌──────┬──────┬──────┐         │
│  │ Peso │ TDEE │ Kcal │         │  ← Mini cards: peso de hoy, TDEE, calorías
│  │ 78.2 │ 2450 │ 1850 │         │
│  │ kg   │ kcal │/2450 │         │
│  └──────┴──────┴──────┘         │
│                                  │
│  ── Volumen Semanal ─────────── │
│  ┌────────────────────────────┐  │
│  │ Pecho    ▓▓▓▓▓▓▓░░ 14/22  │  │  ← Mini MRV bars (horizontal)
│  │ Espalda  ▓▓▓▓▓▓▓▓░ 18/25  │  │
│  │ Piernas  ▓▓▓▓▓░░░░ 10/20  │  │
│  │ [Ver todo →]               │  │
│  └────────────────────────────┘  │
│                                  │
│  ── Heatmap ─────────────────── │
│  ┌────────────────────────────┐  │
│  │    🧍 (frontal mini)      │  │  ← Heatmap reducido
│  │  [Ver completo →]          │  │
│  └────────────────────────────┘  │
│                                  │
├──────────────────────────────────┤
│  🏠  💪  ⏱️  📊  👤            │
└──────────────────────────────────┘
```

### 2.4 Layout de Nutrición Diaria

```
┌──────────────────────────────────┐
│  ← Nutrición     📅 27 Feb      │
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │     ╭───────╮              │  │
│  │     │ 1850  │  ← Anillo   │  │  ← Ring chart: calorías consumidas / objetivo
│  │     │/2450  │    circular  │  │
│  │     ╰───────╯              │  │
│  │  P: 145g  C: 220g  G: 62g │  │  ← Macros debajo del anillo
│  │  ▓▓▓▓░░  ▓▓▓▓▓░  ▓▓▓▓░░  │  │  ← Mini barras de progreso por macro
│  └────────────────────────────┘  │
│                                  │
│  ── Desayuno ─── [+ Agregar] ── │
│  ┌────────────────────────────┐  │
│  │ 🥚 Huevos revueltos  320  │  │
│  │ 🥛 Proteína whey     120  │  │
│  └────────────────────────────┘  │
│                                  │
│  ── Almuerzo ─── [+ Agregar] ── │
│  ┌────────────────────────────┐  │
│  │ 🍗 Pechuga de pollo  350  │  │
│  │ 🍚 Arroz blanco      280  │  │
│  └────────────────────────────┘  │
│                                  │
│  ── Merienda ─── [+ Agregar] ── │
│  ── Cena     ─── [+ Agregar] ── │
│  ── Snacks   ─── [+ Agregar] ── │
│                                  │
├──────────────────────────────────┤
│  🏠  💪  ⏱️  📊  👤            │
└──────────────────────────────────┘
```

### 2.5 Breakpoints Responsivos

| Breakpoint | Nombre | Ancho | Comportamiento |
|---|---|---|---|
| < 640px | `sm` (mobile) | 360-639px | Layout 1 columna. Bottom nav. Sin sidebar. |
| 640-1023px | `md` (tablet) | 640-1023px | Layout 1-2 columnas. Bottom nav. Cards más anchas. |
| ≥ 1024px | `lg` (desktop) | 1024px+ | Layout con sidebar izquierda (reemplaza bottom nav). Content area más amplia. 2-3 columnas para dashboards. |

---

## 3. Principios de UX/UI

### 3.1 Reglas Fundamentales de Interacción

| Principio | Implementación |
|---|---|
| **3-Tap Rule** | Registrar una serie completa (peso + reps + RIR + confirmar) DEBE requerir ≤ 3 interacciones. Los campos se pre-rellenan con sugerencias. |
| **Thumb Zone Priority** | Acciones primarias en la mitad inferior de la pantalla. Botones de confirmar, completar serie, temporizadores → zona de pulgar. |
| **Feedback inmediato** | Cada acción tiene feedback visual (animación, vibración háptica, toast). No hay acciones "silenciosas". |
| **Undo over Confirm** | Para acciones reversibles (completar serie, eliminar nota), preferir Undo toast en lugar de diálogo de confirmación. Para acciones destructivas (eliminar mesociclo, eliminar cuenta) → diálogo de confirmación explícito. |
| **Progressive Disclosure** | Mostrar lo esencial primero. Detalles avanzados en expandibles (calentamiento, notas, historial detallado). |
| **Consistent Navigation** | Bottom nav siempre visible excepto en modales full-screen (tracking en vivo opcionalmente los oculta). Back button siempre funcional. |
| **Empty States** | Cada pantalla sin datos tiene un estado vacío con ilustración + CTA claro: "Aún no tenés mesociclos. [Crear el primero →]". |
| **Loading States** | Skeletons en lugar de spinners para contenido que tiene layout conocido. Los spinners solo para acciones que no tienen forma predecible. |
| **Error States** | Mensajes claros, no técnicos. "No pudimos cargar los datos. [Reintentar]" en lugar de "Error 500". |

### 3.2 Animaciones y Transiciones

| Contexto | Tipo | Duración | Easing |
|---|---|---|---|
| Transición entre páginas | Slide horizontal | 200ms | ease-out |
| Apertura de Sheet/Modal | Slide desde abajo | 250ms | ease-out |
| Completar serie (check) | Scale bounce + color fill | 300ms | spring |
| Temporizador terminando | Pulse + vibración | 500ms | ease-in-out |
| Heatmap cambio de color | Color fade | 400ms | ease-in-out |
| Toast aparece | Slide up + fade in | 200ms | ease-out |
| Skeleton shimmer | Linear gradient animation | 1.5s loop | linear |

### 3.3 Estados de los Componentes

Cada componente interactivo debe definir estos estados visuales:

| Estado | Visual |
|---|---|
| **Default** | Colores normales |
| **Hover** | Ligero cambio de background (desktop) |
| **Active/Pressed** | Scale down 98% + sombra reducida |
| **Focus** | Ring de 2px con `--ring` color (accesibilidad keyboard) |
| **Disabled** | Opacity 50%, cursor no-allowed |
| **Loading** | Spinner inline o skeleton |
| **Error** | Borde rojo + texto de error debajo |
| **Success** | Borde verde momentáneo (animación) |

---

## 4. Gobernanza de la Información

### 4.1 Principios de Gobernanza de Datos

| Principio | Implementación |
|---|---|
| **Data Ownership** | El usuario es dueño absoluto de sus datos. Puede exportar todo en cualquier momento (RF-SO-001). Puede eliminar su cuenta y todos los datos asociados (RF-AU-004). |
| **Data Minimization** | Solo se recolectan los datos necesarios para las funcionalidades. No se recolectan datos para tracking publicitario o venta a terceros. |
| **Soft Delete** | Todos los registros usan soft delete (`deletedAt`). Esto permite recuperación y auditoría. Los datos se purgan definitivamente 90 días después del soft delete. |
| **Audit Trail** | Todos los registros tienen `createdAt` y `updatedAt`. Los cambios a datos sensibles (email, contraseña) se loguean. |
| **Data Residency** | Los datos residen en la región del proveedor seleccionado (Supabase: seleccionar región más cercana al target de usuarios). |
| **Encryption** | Contraseñas: bcrypt (cost ≥ 12). Transporte: TLS 1.2+. Fotos de progreso: acceso solo vía URLs firmadas con expiración. |
| **Retention Policy** | Datos activos: indefinidos mientras la cuenta exista. Datos de cuentas eliminadas: 30 días de gracia, luego purga. Logs de sistema: 30 días. |

### 4.2 Clasificación de Datos

| Nivel | Tipo de Dato | Ejemplos | Controles |
|---|---|---|---|
| **Público** | Datos visibles sin autenticación | Artículos de academia, rutinas compartidas (vista resumida) | N/A |
| **Privado** | Datos del usuario autenticado | Sesiones, nutrición, métricas corporales, preferencias | Auth JWT + Row-Level Security (usuario solo ve sus datos) |
| **Sensible** | PII y datos de salud | Email, contraseña hash, fotos de progreso, peso corporal | Encrypt at rest (proveedor DB), no en logs, URLs firmadas para fotos |
| **Sistema** | Configuración y catálogos | Ejercicios, artículos, logros | Read-only para usuarios, write solo para admin/seed |

### 4.3 Reglas de Acceso (Row-Level Security)

Cada query a la base de datos DEBE incluir el filtro `userId` del token JWT autenticado:

```
REGLA: Un usuario NUNCA puede ver, editar o eliminar datos de otro usuario.

Implementación:
- Cada repository method que opera sobre datos de usuario
  recibe userId como parámetro obligatorio.
- Prisma queries incluyen WHERE userId = $userId.
- Integration tests verifican que se retorna 403 al intentar
  acceder a datos de otro usuario.
```

---

## 5. Diagrama Entidad-Relación (DER)

### 5.1 Schema Completo (Prisma-style)

```prisma
// ═══════════════════════════════════════════════════════
// AUTENTICACIÓN Y USUARIO
// ═══════════════════════════════════════════════════════

model User {
  id                String            @id @default(cuid())
  email             String            @unique
  passwordHash      String
  username          String            @unique
  emailVerified     Boolean           @default(false)
  avatarUrl         String?
  dateOfBirth       DateTime?
  gender            Gender?
  heightCm          Float?
  currentWeightKg   Float?
  activityLevel     ActivityLevel     @default(MODERATELY_ACTIVE)
  experience        ExperienceLevel   @default(INTERMEDIATE)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  deletedAt         DateTime?

  preferences       UserPreferences?
  refreshTokens     RefreshToken[]
  mesocycles        Mesocycle[]
  sessions          Session[]
  meals             Meal[]
  bodyMetrics       BodyMetric[]
  progressPhotos    ProgressPhoto[]
  achievements      UserAchievement[]
  equipmentProfiles EquipmentProfile[]
  readinessScores   ReadinessScore[]
  passwordHistory   PasswordHistory[]
}

model UserPreferences {
  id                    String    @id @default(cuid())
  userId                String    @unique
  unitSystem            UnitSystem @default(METRIC)
  language              Language   @default(ES)
  theme                 Theme      @default(DARK)
  restTimeCompoundSec   Int        @default(180)
  restTimeIsolationSec  Int        @default(90)
  restAlertBeforeSec    Int        @default(30)
  notifyRestTimer       Boolean    @default(true)
  notifyReminder        Boolean    @default(true)
  notifyDeload          Boolean    @default(true)
  notifyAchievements    Boolean    @default(true)
  notifyWeightReminder  Boolean    @default(true)
  createdAt             DateTime   @default(now())
  updatedAt             DateTime   @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PasswordHistory {
  id           String   @id @default(cuid())
  userId       String
  passwordHash String
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ═══════════════════════════════════════════════════════
// ENTRENAMIENTO — PLANIFICACIÓN
// ═══════════════════════════════════════════════════════

model Mesocycle {
  id              String          @id @default(cuid())
  userId          String
  name            String
  description     String?
  durationWeeks   Int
  objective       TrainingObjective
  includeDeload   Boolean         @default(true)
  status          MesocycleStatus @default(DRAFT)
  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  deletedAt       DateTime?

  user         User           @relation(fields: [userId], references: [id])
  trainingDays TrainingDay[]
  sessions     Session[]
  shareLinks   SharedRoutine[]
}

model TrainingDay {
  id           String   @id @default(cuid())
  mesocycleId  String
  name         String          // e.g. "Upper A", "Pull Day"
  dayOrder     Int             // 1, 2, 3... orden dentro del mesociclo
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  mesocycle         Mesocycle          @relation(fields: [mesocycleId], references: [id], onDelete: Cascade)
  plannedExercises  PlannedExercise[]
  sessions          Session[]
}

model PlannedExercise {
  id              String   @id @default(cuid())
  trainingDayId   String
  exerciseId      String
  exerciseOrder   Int             // Orden dentro del día
  targetSets      Int             // Series objetivo
  targetRepsMin   Int             // Reps objetivo mínimo
  targetRepsMax   Int             // Reps objetivo máximo
  targetRir       Int             // RIR objetivo
  tempo           String?         // Format "4-1-2-0" (optional)
  supersetGroup   Int?            // Null = no superset. Same number = same superset.
  setupNotes      String?         // e.g. "Bench position 3, pronated grip"
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  trainingDay TrainingDay @relation(fields: [trainingDayId], references: [id], onDelete: Cascade)
  exercise    Exercise    @relation(fields: [exerciseId], references: [id])
}

// ═══════════════════════════════════════════════════════
// ENTRENAMIENTO — EJECUCIÓN (TRACKING)
// ═══════════════════════════════════════════════════════

model Session {
  id              String        @id @default(cuid())
  userId          String
  mesocycleId     String?
  trainingDayId   String?
  weekNumber      Int?          // Semana dentro del mesociclo
  status          SessionStatus @default(IN_PROGRESS)
  startedAt       DateTime      @default(now())
  finishedAt      DateTime?
  durationMinutes Int?
  sessionNotes    String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?

  user           User              @relation(fields: [userId], references: [id])
  mesocycle      Mesocycle?         @relation(fields: [mesocycleId], references: [id])
  trainingDay    TrainingDay?       @relation(fields: [trainingDayId], references: [id])
  exercises      SessionExercise[]
  readinessScore ReadinessScore?
}

model SessionExercise {
  id                String   @id @default(cuid())
  sessionId         String
  exerciseId        String
  originalExerciseId String? // Si fue sustituido, guarda el ejercicio original planificado
  exerciseOrder     Int
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  session  Session      @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  exercise Exercise     @relation(fields: [exerciseId], references: [id])
  sets     WorkingSet[]
  warmups  WarmupSet[]
}

model WorkingSet {
  id                  String   @id @default(cuid())
  sessionExerciseId   String
  setOrder            Int
  weightKg            Float
  reps                Int
  rir                 Int             // 0-5, where 5 means 5+
  restTimeSec         Int?            // Actual rest time taken
  notes               String?         // Per-set notes (max 200 chars)
  completed           Boolean  @default(false)
  skipped             Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  sessionExercise SessionExercise @relation(fields: [sessionExerciseId], references: [id], onDelete: Cascade)
}

model WarmupSet {
  id                  String   @id @default(cuid())
  sessionExerciseId   String
  setOrder            Int
  weightKg            Float
  reps                Int
  completed           Boolean  @default(false)
  createdAt           DateTime @default(now())

  sessionExercise SessionExercise @relation(fields: [sessionExerciseId], references: [id], onDelete: Cascade)
}

model ReadinessScore {
  id          String   @id @default(cuid())
  userId      String
  sessionId   String   @unique
  sleepScore  Int      // 1-5
  stressScore Int      // 1-5
  domsScore   Int      // 1-5
  totalScore  Float    // Calculated weighted average
  createdAt   DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id])
  session Session @relation(fields: [sessionId], references: [id])
}

// ═══════════════════════════════════════════════════════
// EJERCICIOS (CATÁLOGO)
// ═══════════════════════════════════════════════════════

model Exercise {
  id               String            @id @default(cuid())
  nameEs           String
  nameEn           String
  movementPattern  MovementPattern
  difficulty       DifficultyLevel   @default(INTERMEDIATE)
  equipmentType    EquipmentType
  isCompound       Boolean           @default(true)
  mediaUrl         String?           // GIF/video URL
  setupInstructions    String?       // Rich text
  executionSteps       String?       // Rich text
  commonMistakes       String?       // Rich text
  variations           String?       // Rich text
  isCustom         Boolean           @default(false)
  createdByUserId  String?           // Null = system exercise
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  primaryMuscles   ExerciseMuscle[]  @relation("PrimaryMuscles")
  secondaryMuscles ExerciseMuscle[]  @relation("SecondaryMuscles")
  plannedExercises PlannedExercise[]
  sessionExercises SessionExercise[]
  equipmentNeeded  ExerciseEquipment[]
}

model ExerciseMuscle {
  id          String      @id @default(cuid())
  exerciseId  String
  muscleGroup MuscleGroup
  isPrimary   Boolean

  exercisePrimary   Exercise? @relation("PrimaryMuscles", fields: [exerciseId], references: [id], map: "primary_fk")
  exerciseSecondary Exercise? @relation("SecondaryMuscles", fields: [exerciseId], references: [id], map: "secondary_fk")
}

model ExerciseEquipment {
  id          String        @id @default(cuid())
  exerciseId  String
  equipment   EquipmentType

  exercise Exercise @relation(fields: [exerciseId], references: [id])
}

// ═══════════════════════════════════════════════════════
// EQUIPAMIENTO DEL USUARIO
// ═══════════════════════════════════════════════════════

model EquipmentProfile {
  id        String   @id @default(cuid())
  userId    String
  name      String          // e.g. "Home Gym", "Commercial Gym"
  isActive  Boolean  @default(false)
  isPreset  Boolean  @default(false)  // System-provided presets
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User                    @relation(fields: [userId], references: [id])
  equipment ProfileEquipmentItem[]
}

model ProfileEquipmentItem {
  id                String        @id @default(cuid())
  equipmentProfileId String
  equipment          EquipmentType

  profile EquipmentProfile @relation(fields: [equipmentProfileId], references: [id], onDelete: Cascade)
}

// ═══════════════════════════════════════════════════════
// NUTRICIÓN
// ═══════════════════════════════════════════════════════

model Meal {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime @db.Date
  mealType  MealType
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user    User        @relation(fields: [userId], references: [id])
  entries FoodEntry[]

  @@unique([userId, date, mealType])
}

model FoodEntry {
  id          String   @id @default(cuid())
  mealId      String
  foodId      String?         // Reference to Food catalog (null if manual)
  name        String          // Snapshot of food name at time of entry
  quantityG   Float           // Quantity in grams
  caloriesKcal Float
  proteinG    Float
  carbsG      Float
  fatG        Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  meal Meal  @relation(fields: [mealId], references: [id], onDelete: Cascade)
  food Food? @relation(fields: [foodId], references: [id])
}

model Food {
  id              String   @id @default(cuid())
  name            String
  brand           String?
  barcode         String?  @unique
  caloriesPer100g Float
  proteinPer100g  Float
  carbsPer100g    Float
  fatPer100g      Float
  imageUrl        String?
  source          FoodSource @default(API)
  createdByUserId String?           // Null = from API
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  entries FoodEntry[]
}

// ═══════════════════════════════════════════════════════
// COMPOSICIÓN CORPORAL
// ═══════════════════════════════════════════════════════

model BodyMetric {
  id          String   @id @default(cuid())
  userId      String
  date        DateTime @db.Date
  weightKg    Float?
  neckCm      Float?
  chestCm     Float?
  bicepsLeftCm  Float?
  bicepsRightCm Float?
  waistCm     Float?
  hipCm       Float?
  thighLeftCm   Float?
  thighRightCm  Float?
  calfLeftCm    Float?
  calfRightCm   Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, date])
}

model ProgressPhoto {
  id        String        @id @default(cuid())
  userId    String
  date      DateTime      @db.Date
  category  PhotoCategory
  fileUrl   String               // Supabase Storage URL (signed)
  fileSizeBytes Int
  weightKg  Float?               // Auto-filled from BodyMetric if exists
  createdAt DateTime      @default(now())

  user User @relation(fields: [userId], references: [id])
}

// ═══════════════════════════════════════════════════════
// ACADEMIA / ARTÍCULOS
// ═══════════════════════════════════════════════════════

model Article {
  id            String          @id @default(cuid())
  titleEs       String
  titleEn       String
  summaryEs     String          // < 50 words
  summaryEn     String
  contentEs     String          // Rich text / Markdown
  contentEn     String
  category      ArticleCategory
  readTimeMin   Int
  publishedAt   DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  references ArticleReference[]
}

model ArticleReference {
  id          String   @id @default(cuid())
  articleId   String
  doi         String?
  title       String
  authors     String
  journal     String?
  year        Int?
  url         String?

  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
}

// ═══════════════════════════════════════════════════════
// LOGROS
// ═══════════════════════════════════════════════════════

model Achievement {
  id          String   @id @default(cuid())
  code        String   @unique        // e.g. "FIRST_SESSION", "7_DAY_STREAK"
  titleEs     String
  titleEn     String
  descriptionEs String
  descriptionEn String
  iconUrl     String
  condition   String          // Machine-readable condition (parsed by AchievementService)

  users UserAchievement[]
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())

  user        User        @relation(fields: [userId], references: [id])
  achievement Achievement @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
}

// ═══════════════════════════════════════════════════════
// SOCIAL / COMPARTIR
// ═══════════════════════════════════════════════════════

model SharedRoutine {
  id          String   @id @default(cuid())
  mesocycleId String
  code        String   @unique        // e.g. "MUSC-A3F7K9"
  expiresAt   DateTime
  viewCount   Int      @default(0)
  importCount Int      @default(0)
  createdAt   DateTime @default(now())

  mesocycle Mesocycle @relation(fields: [mesocycleId], references: [id])
}

// ═══════════════════════════════════════════════════════
// MRV/MEV CONFIGURACIÓN POR USUARIO
// ═══════════════════════════════════════════════════════

model UserVolumeLandmark {
  id          String      @id @default(cuid())
  userId      String
  muscleGroup MuscleGroup
  mev         Int                 // Minimum Effective Volume (sets/week)
  mrv         Int                 // Maximum Recoverable Volume (sets/week)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@unique([userId, muscleGroup])
}

// ═══════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

enum ActivityLevel {
  SEDENTARY
  LIGHTLY_ACTIVE
  MODERATELY_ACTIVE
  VERY_ACTIVE
  EXTREMELY_ACTIVE
}

enum ExperienceLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum UnitSystem {
  METRIC
  IMPERIAL
}

enum Language {
  ES
  EN
}

enum Theme {
  LIGHT
  DARK
  SYSTEM
}

enum TrainingObjective {
  HYPERTROPHY
  STRENGTH
  ENDURANCE
  RECOMPOSITION
}

enum MesocycleStatus {
  DRAFT
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum SessionStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
}

enum MovementPattern {
  HORIZONTAL_PUSH
  VERTICAL_PUSH
  HORIZONTAL_PULL
  VERTICAL_PULL
  SQUAT
  HIP_HINGE
  CARRY
  ISOLATION
}

enum MuscleGroup {
  CHEST
  BACK
  SHOULDERS
  BICEPS
  TRICEPS
  FOREARMS
  QUADRICEPS
  HAMSTRINGS
  GLUTES
  CALVES
  CORE
  TRAPS
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum EquipmentType {
  BARBELL
  DUMBBELL
  CABLE
  MACHINE
  BODYWEIGHT
  KETTLEBELL
  BANDS
  EZ_BAR
  SMITH_MACHINE
  PULL_UP_BAR
  DIP_STATION
  BENCH
  LEG_PRESS
  HACK_SQUAT
  NONE
}

enum MealType {
  BREAKFAST
  LUNCH
  SNACK_AM
  DINNER
  SNACK_PM
}

enum PhotoCategory {
  FRONT
  SIDE_RIGHT
  SIDE_LEFT
  BACK
}

enum ArticleCategory {
  FUNDAMENTALS
  TRAINING
  NUTRITION
  RECOVERY
  PERIODIZATION
}

enum FoodSource {
  API
  USER
}
```

### 5.2 Índices Recomendados

```sql
-- Performance: queries frecuentes
CREATE INDEX idx_session_user_date ON "Session" ("userId", "startedAt" DESC);
CREATE INDEX idx_working_set_session_exercise ON "WorkingSet" ("sessionExerciseId", "setOrder");
CREATE INDEX idx_body_metric_user_date ON "BodyMetric" ("userId", "date" DESC);
CREATE INDEX idx_meal_user_date ON "Meal" ("userId", "date");
CREATE INDEX idx_food_entry_meal ON "FoodEntry" ("mealId");
CREATE INDEX idx_exercise_movement ON "Exercise" ("movementPattern");
CREATE INDEX idx_exercise_muscle_primary ON "ExerciseMuscle" ("muscleGroup", "isPrimary");
CREATE INDEX idx_shared_routine_code ON "SharedRoutine" ("code");
CREATE INDEX idx_food_barcode ON "Food" ("barcode") WHERE "barcode" IS NOT NULL;
-- Full-text search para ejercicios
CREATE INDEX idx_exercise_name_search ON "Exercise" USING gin(to_tsvector('spanish', "nameEs" || ' ' || "nameEn"));
```

---

## 6. Contratos de API REST (Endpoints e Interfaces)

### 6.1 Convenciones Generales

| Aspecto | Convención |
|---|---|
| **Base URL** | `/api/v1` |
| **Content-Type** | `application/json` |
| **Auth Header** | `Authorization: Bearer <access_token>` |
| **Paginación** | Query params: `?page=1&limit=20&sortBy=createdAt&sortOrder=desc` |
| **Respuesta paginada** | `{ data: T[], meta: { page, limit, total, totalPages } }` |
| **Errores** | `{ statusCode: number, message: string, error: string, details?: object }` |
| **Fechas** | ISO 8601: `2026-02-27T14:30:00.000Z` |
| **IDs** | CUID strings |

### 6.2 Endpoints Detallados

#### Auth (`/api/v1/auth`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| POST | `/register` | `{ email, password, username }` | `{ user: UserDto, accessToken }` + Set-Cookie (refresh) | 201 | Crear cuenta |
| POST | `/login` | `{ email, password }` | `{ user: UserDto, accessToken }` + Set-Cookie (refresh) | 200 | Login |
| POST | `/refresh` | Cookie: refreshToken | `{ accessToken }` + Set-Cookie (new refresh) | 200 | Rotar tokens |
| POST | `/logout` | Cookie: refreshToken | `{}` | 204 | Invalidar refresh token |
| POST | `/forgot-password` | `{ email }` | `{ message }` | 200 | Enviar email de reset (siempre 200) |
| POST | `/reset-password` | `{ token, newPassword }` | `{}` | 200 | Aplicar nueva contraseña |
| POST | `/verify-email` | `{ token }` | `{}` | 200 | Verificar email |

#### User (`/api/v1/users`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| GET | `/me` | — | `UserProfileDto` | 200 | Obtener perfil propio |
| PATCH | `/me` | `{ username?, avatarUrl?, dateOfBirth?, gender?, heightCm?, currentWeightKg?, activityLevel?, experience? }` | `UserProfileDto` | 200 | Actualizar perfil |
| GET | `/me/preferences` | — | `UserPreferencesDto` | 200 | Obtener preferencias |
| PUT | `/me/preferences` | `UserPreferencesDto` completo | `UserPreferencesDto` | 200 | Actualizar preferencias |
| DELETE | `/me` | `{ confirmPassword }` | `{}` | 204 | Soft delete de cuenta |

#### Mesocycles (`/api/v1/mesocycles`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| GET | `/` | `?status=ACTIVE&page&limit` | `PaginatedResponse<MesocycleSummaryDto>` | 200 | Listar mesociclos |
| POST | `/` | `CreateMesocycleDto` | `MesocycleDetailDto` | 201 | Crear mesociclo |
| GET | `/:id` | — | `MesocycleDetailDto` (incluye trainingDays + plannedExercises) | 200 | Detalle completo |
| PATCH | `/:id` | `UpdateMesocycleDto` | `MesocycleDetailDto` | 200 | Actualizar mesociclo |
| DELETE | `/:id` | — | `{}` | 204 | Soft delete |
| POST | `/:id/duplicate` | — | `MesocycleDetailDto` | 201 | Duplicar como borrador |
| POST | `/:id/activate` | — | `MesocycleDetailDto` | 200 | Activar (desactiva el anterior) |
| POST | `/:id/complete` | — | `MesocycleDetailDto` | 200 | Marcar como completado |

#### Training Days (`/api/v1/mesocycles/:mesocycleId/days`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| POST | `/` | `CreateTrainingDayDto` | `TrainingDayDto` | 201 | Crear día |
| PATCH | `/:dayId` | `UpdateTrainingDayDto` | `TrainingDayDto` | 200 | Actualizar día |
| DELETE | `/:dayId` | — | `{}` | 204 | Eliminar día |
| PUT | `/:dayId/exercises` | `PlannedExerciseDto[]` (lista completa, reemplaza) | `TrainingDayDto` | 200 | Setear ejercicios del día |

#### Sessions (`/api/v1/sessions`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| GET | `/` | `?page&limit&from&to&mesocycleId` | `PaginatedResponse<SessionSummaryDto>` | 200 | Listar sesiones |
| POST | `/` | `{ mesocycleId?, trainingDayId?, weekNumber? }` | `SessionDetailDto` (con sugerencias precalculadas) | 201 | Iniciar sesión |
| GET | `/:id` | — | `SessionDetailDto` | 200 | Detalle de sesión |
| GET | `/active` | — | `SessionDetailDto` o 404 | 200/404 | Obtener sesión en progreso |
| POST | `/:id/complete` | `{ sessionNotes? }` | `SessionDetailDto` | 200 | Finalizar sesión |
| POST | `/:id/abandon` | — | `{}` | 200 | Abandonar sesión |

#### Session Exercises & Sets (`/api/v1/sessions/:sessionId/exercises`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| POST | `/` | `{ exerciseId, exerciseOrder }` | `SessionExerciseDto` | 201 | Agregar ejercicio a sesión |
| POST | `/:exerciseId/substitute` | `{ newExerciseId }` | `SessionExerciseDto` | 200 | Sustituir ejercicio |
| DELETE | `/:exerciseId` | — | `{}` | 204 | Eliminar ejercicio de sesión |
| POST | `/:exerciseId/sets` | `{ weightKg, reps, rir, notes? }` | `WorkingSetDto` | 201 | Registrar serie de trabajo |
| PATCH | `/:exerciseId/sets/:setId` | `{ weightKg?, reps?, rir?, notes?, completed?, skipped? }` | `WorkingSetDto` | 200 | Actualizar serie |
| DELETE | `/:exerciseId/sets/:setId` | — | `{}` | 204 | Eliminar serie |
| POST | `/:exerciseId/warmups/generate` | `{ workWeight, barWeight? }` | `WarmupSetDto[]` | 200 | Generar calentamiento |
| POST | `/:exerciseId/warmups` | `{ weightKg, reps }` | `WarmupSetDto` | 201 | Agregar warmup manual |

#### Readiness (`/api/v1/sessions/:sessionId/readiness`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| POST | `/` | `{ sleepScore, stressScore, domsScore }` | `ReadinessScoreDto` | 201 | Registrar readiness |

#### Exercises (`/api/v1/exercises`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| GET | `/` | `?search&muscleGroup&movementPattern&equipment&difficulty&page&limit` | `PaginatedResponse<ExerciseSummaryDto>` | 200 | Buscar ejercicios |
| GET | `/:id` | — | `ExerciseDetailDto` (incluye instrucciones, músculos, media) | 200 | Detalle del ejercicio |
| GET | `/:id/history` | `?page&limit` | `PaginatedResponse<ExerciseHistoryDto>` | 200 | Historial personal |
| GET | `/:id/substitutes` | `?equipmentProfileId` | `ExerciseSummaryDto[]` | 200 | Sustitutos sugeridos |
| POST | `/` | `CreateExerciseDto` | `ExerciseDetailDto` | 201 | Crear ejercicio custom |
| GET | `/:id/weight-suggestion` | `?readinessScore?` | `{ suggestedWeightKg, reasoning }` | 200 | Sugerencia de peso |

#### Nutrition (`/api/v1/nutrition`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| GET | `/daily/:date` | — | `DailyNutritionDto` (meals + entries + totals + targets) | 200 | Resumen nutricional del día |
| POST | `/meals` | `{ date, mealType }` | `MealDto` | 201 | Crear/obtener meal |
| POST | `/meals/:mealId/entries` | `{ foodId?, name, quantityG, caloriesKcal, proteinG, carbsG, fatG }` | `FoodEntryDto` | 201 | Agregar alimento |
| DELETE | `/meals/:mealId/entries/:entryId` | — | `{}` | 204 | Eliminar entrada |
| GET | `/foods/search` | `?q=chicken&page&limit` | `PaginatedResponse<FoodDto>` | 200 | Buscar alimentos (proxy a API) |
| GET | `/foods/barcode/:code` | — | `FoodDto` o 404 | 200/404 | Buscar por código de barras |
| POST | `/foods` | `CreateFoodDto` | `FoodDto` | 201 | Crear alimento personalizado |
| GET | `/tdee` | — | `TdeeDto` (value, confidence, history[])` | 200 | TDEE calculado |
| GET | `/body-mode` | — | `{ mode, caloricAdjustment, macroTargets }` | 200 | Modo actual |
| PUT | `/body-mode` | `{ mode: 'BULK'\|'CUT'\|'MAINTAIN'\|'RECOMP' }` | `{ mode, macroTargets }` | 200 | Cambiar modo |

#### Body Metrics (`/api/v1/body`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| GET | `/metrics` | `?from&to&type=weight` | `BodyMetricDto[]` | 200 | Listar métricas |
| POST | `/metrics` | `{ date, weightKg?, neckCm?, chestCm?, ... }` | `BodyMetricDto` | 201 | Registrar métricas |
| PATCH | `/metrics/:id` | Partial update | `BodyMetricDto` | 200 | Actualizar métrica |
| GET | `/metrics/weight/trend` | `?days=90` | `WeightTrendDto` (daily points + 7-day moving avg) | 200 | Tendencia de peso |
| GET | `/photos` | `?from&to&category` | `ProgressPhotoDto[]` | 200 | Listar fotos |
| POST | `/photos` | Multipart: `file` + `{ date, category }` | `ProgressPhotoDto` | 201 | Subir foto |
| DELETE | `/photos/:id` | — | `{}` | 204 | Eliminar foto |

#### Analytics (`/api/v1/analytics`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| GET | `/volume/weekly` | `?weekOffset=0` | `WeeklyVolumeDto` (series por grupo muscular + MEV/MRV) | 200 | Volumen semanal |
| GET | `/volume/history` | `?weeks=12` | `VolumeHistoryDto[]` | 200 | Volumen por semana histórico |
| GET | `/heatmap` | — | `MuscleHeatmapDto[]` (muscleGroup, lastTrained, seriesThisWeek, recoveryStatus) | 200 | Datos del heatmap |
| GET | `/strength/:exerciseId` | `?period=90d` | `StrengthTrendDto` (estimated1RM points over time) | 200 | Tendencia de fuerza |
| GET | `/tonnage/:exerciseId` | `?period=90d` | `TonnageTrendDto` (tonnage per session over time) | 200 | Tendencia de tonelaje |
| GET | `/prs/:exerciseId` | — | `PersonalRecordsDto` (best1RM, bestSet, bestVolume) | 200 | Personal records |
| GET | `/correlations` | `?type=weight_vs_strength&exerciseId` | `CorrelationDataDto` | 200 | Datos de correlación |
| GET | `/deload-check` | — | `DeloadRecommendationDto` (needsDeload, reasons[], affectedMuscles[]) | 200 | Check de deload |

#### Import/Export (`/api/v1/data`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| POST | `/export` | — | `{ downloadUrl, expiresAt }` | 202 | Iniciar exportación (async) |
| POST | `/import/preview` | Multipart: `file` + `{ source: 'strong'\|'hevy' }` | `ImportPreviewDto` (mappedExercises, unmappedExercises, totalRecords) | 200 | Preview de importación |
| POST | `/import/confirm` | `{ previewId, exerciseMappings? }` | `ImportResultDto` (imported, skipped, errors) | 200 | Confirmar importación |

#### Sharing (`/api/v1/share`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| POST | `/routines` | `{ mesocycleId }` | `{ code, url, expiresAt }` | 201 | Generar código para compartir |
| GET | `/routines/:code` | — | `SharedRoutinePreviewDto` (sin auth requerido) | 200 | Ver preview |
| POST | `/routines/:code/import` | — | `MesocycleDetailDto` (copia como borrador) | 201 | Importar rutina compartida |

#### Equipment Profiles (`/api/v1/equipment-profiles`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| GET | `/` | — | `EquipmentProfileDto[]` | 200 | Listar perfiles |
| POST | `/` | `{ name, equipment: EquipmentType[] }` | `EquipmentProfileDto` | 201 | Crear perfil |
| PATCH | `/:id` | `{ name?, equipment? }` | `EquipmentProfileDto` | 200 | Actualizar |
| DELETE | `/:id` | — | `{}` | 204 | Eliminar |
| POST | `/:id/activate` | — | `EquipmentProfileDto` | 200 | Setear como activo |

#### Articles (`/api/v1/articles`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| GET | `/` | `?category&page&limit` | `PaginatedResponse<ArticleSummaryDto>` | 200 | Listar artículos |
| GET | `/:id` | — | `ArticleDetailDto` (incluye references) | 200 | Detalle del artículo |

#### Achievements (`/api/v1/achievements`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| GET | `/` | — | `AchievementDto[]` (todos, con `unlockedAt` si desbloqueado) | 200 | Listar logros |

#### Health (`/api/v1/health`)

| Método | Path | Body / Params | Response | Status | Descripción |
|---|---|---|---|---|---|
| GET | `/` | — | `{ status: 'ok', database: 'ok', uptime: number }` | 200 | Health check |

### 6.3 DTOs de Ejemplo

#### CreateMesocycleDto (Request)

```typescript
{
  name: string;           // "Hipertrofia Upper/Lower"
  description?: string;
  durationWeeks: number;  // 3-16
  objective: 'HYPERTROPHY' | 'STRENGTH' | 'ENDURANCE' | 'RECOMPOSITION';
  includeDeload?: boolean; // default true
  trainingDays: {
    name: string;         // "Upper A"
    dayOrder: number;     // 1
    exercises: {
      exerciseId: string;
      exerciseOrder: number;
      targetSets: number;
      targetRepsMin: number;
      targetRepsMax: number;
      targetRir: number;
      tempo?: string;
      supersetGroup?: number;
      setupNotes?: string;
    }[];
  }[];
}
```

#### SessionDetailDto (Response)

```typescript
{
  id: string;
  mesocycleId: string | null;
  trainingDayName: string | null;
  weekNumber: number | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  startedAt: string;         // ISO 8601
  finishedAt: string | null;
  durationMinutes: number | null;
  sessionNotes: string | null;
  readinessScore: {
    sleepScore: number;
    stressScore: number;
    domsScore: number;
    totalScore: number;
  } | null;
  exercises: {
    id: string;
    exerciseId: string;
    exerciseName: string;
    originalExerciseId: string | null;
    exerciseOrder: number;
    suggestion: {
      weightKg: number | null;
      reasoning: string;       // "Based on last session: 80kg × 10 (RIR 2). Suggesting increase."
    };
    lastSession: {
      date: string;
      bestSet: { weightKg: number; reps: number; rir: number };
    } | null;
    warmups: {
      id: string;
      setOrder: number;
      weightKg: number;
      reps: number;
      completed: boolean;
    }[];
    sets: {
      id: string;
      setOrder: number;
      weightKg: number;
      reps: number;
      rir: number;
      restTimeSec: number | null;
      notes: string | null;
      completed: boolean;
      skipped: boolean;
    }[];
  }[];
}
```

#### PaginatedResponse<T> (Wrapper genérico)

```typescript
{
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### Error Response

```typescript
{
  statusCode: 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500;
  message: string;        // Human-readable
  error: string;          // Error code e.g. "ENTITY_NOT_FOUND"
  details?: {             // Validation errors
    field: string;
    message: string;
  }[];
}
```

---

*Fin del documento de Guía Estética y Gobernanza de la Información. Versión 1.0 — 2026-02-27.*
