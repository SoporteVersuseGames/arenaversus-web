# Arena Versus V2 — Design Spec
**Fecha:** 2026-05-28  
**Estado:** Aprobado  
**Repositorio destino:** `C:\Users\milo_\OneDrive\Escritorio\ArenaVersus_V2`  
**Deploy:** Vercel (GitHub → auto deploy en push a `main`)

---

## 1. Contexto y Problema

Arena Versus es una plataforma de torneos esports para LATAM desplegada en [arenaversus.com](https://www.arenaversus.com/). La V1 fue construida con HTML puro + CSS embebido + JS vanilla en 7 archivos independientes (`index.html`, `login.html`, `register.html`, `dashboard.html`, `torneos.html`, `clasificacion.html`, `admin.html`).

**Problemas críticos de la V1:**
- El navbar, footer, cliente Supabase, variables CSS y funciones utilitarias están copiados en cada uno de los 7 archivos
- Cambiar el navbar requiere editar 7 archivos manualmente
- Sin componentes reutilizables → mantenimiento costoso
- Sin tipado → errores silenciosos en runtime
- Imágenes de IA con aspecto falso → visual poco impactante
- Faltan features clave presentes en competidores (Toornament, FACEIT, ESL): brackets, stats, equipos

**Objetivo de la V2:** migrar a Next.js 15 con código limpio y componentes reutilizables, luego agregar las 3 features de alto impacto de forma incremental.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Razón |
|---|---|---|
| Framework | Next.js 15 (App Router) | Vercel-native, SSR, rutas dinámicas |
| Lenguaje | TypeScript | Tipado de tablas Supabase, menos bugs |
| Estilos | Tailwind CSS | Elimina CSS duplicado, utilidades gaming |
| Backend/DB | Supabase (existente) | Mismas tablas, mismas credenciales |
| Cliente Supabase | `@supabase/ssr` | Oficial para Next.js App Router |
| Deploy | Vercel + GitHub | CI/CD automático en cada push |

---

## 3. Arquitectura de Carpetas

```
arenaversus-v2/
├── app/
│   ├── layout.tsx                 ← Navbar + Footer globales (una sola vez)
│   ├── page.tsx                   ← Landing page (index.html)
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── torneos/
│   │   ├── page.tsx               ← Lista de torneos
│   │   └── [id]/
│   │       └── page.tsx           ← Detalle + bracket del torneo
│   ├── clasificacion/
│   │   └── page.tsx
│   ├── admin/
│   │   └── page.tsx
│   ├── players/
│   │   └── [username]/
│   │       └── page.tsx           ← Perfil público del jugador [NUEVO]
│   └── teams/
│       ├── page.tsx               ← Lista de equipos [NUEVO]
│       └── [id]/
│           └── page.tsx           ← Perfil del equipo [NUEVO]
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── TournamentCard.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatusPill.tsx
│   │   └── GameIcon.tsx
│   ├── brackets/
│   │   ├── BracketView.tsx        ← [NUEVO]
│   │   └── MatchSlot.tsx          ← [NUEVO]
│   └── teams/
│       ├── TeamCard.tsx           ← [NUEVO]
│       └── RosterList.tsx         ← [NUEVO]
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              ← cliente browser (use client)
│   │   └── server.ts              ← cliente server components
│   └── types.ts                   ← tipos TypeScript de todas las tablas
│
├── utils/
│   └── constants.ts               ← GAMES_MAP, STATUS_LABELS, COUNTRIES_MAP
│
├── middleware.ts                   ← protección de rutas /dashboard y /admin
│
└── styles/
    └── globals.css                ← variables CSS + Tailwind base
```

---

## 4. Base de Datos

### 4.1 Tablas existentes (sin cambios)

```
profiles          → id, username, full_name, bio, discord_tag, country, updated_at
tournaments       → id, name, game, status, max_players, current_players, date, format
registrations     → id, player_id, tournament_id, registered_at
player_games      → id, player_id, game_name
admins            → id, user_id
```

### 4.2 Tablas nuevas — Fase 2 (Stats)

```sql
CREATE TABLE match_results (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id),
  player_id     uuid REFERENCES profiles(id),
  opponent_id   uuid REFERENCES profiles(id),
  result        text CHECK (result IN ('win', 'loss', 'draw')),
  score         text,
  round         integer,
  played_at     timestamptz DEFAULT now()
);
```

### 4.3 Tablas nuevas — Fase 3 (Brackets)

```sql
CREATE TABLE matches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id),
  round         integer,
  slot          integer,
  player1_id    uuid REFERENCES profiles(id),
  player2_id    uuid REFERENCES profiles(id),
  winner_id     uuid REFERENCES profiles(id),
  score         text,
  status        text CHECK (status IN ('pending', 'in_progress', 'finished')),
  scheduled_at  timestamptz
);
```

### 4.4 Tablas nuevas — Fase 4 (Equipos)

```sql
CREATE TABLE teams (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text UNIQUE NOT NULL,
  tag           text UNIQUE NOT NULL,
  logo_url      text,
  captain_id    uuid REFERENCES profiles(id),
  game          text,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE team_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    uuid REFERENCES teams(id) ON DELETE CASCADE,
  player_id  uuid REFERENCES profiles(id),
  role       text DEFAULT 'member',
  joined_at  timestamptz DEFAULT now(),
  UNIQUE(team_id, player_id)
);
```

---

## 5. Plan de Fases

### Fase 1 — Migración Next.js (Semanas 1-2)
**Objetivo:** sitio actual funcionando en Next.js, código limpio, desplegado en Vercel.

**Semana 1:**
- [ ] Crear proyecto: `npx create-next-app@latest arenaversus-v2 --typescript --tailwind --app`
- [ ] Configurar Supabase SSR: `@supabase/ssr`, variables de entorno
- [ ] Migrar variables CSS → `globals.css` + Tailwind theme (colores: red #ea3935, orange #ec622b)
- [ ] Crear `lib/types.ts` con tipos de todas las tablas existentes
- [ ] Crear `utils/constants.ts` con GAMES_MAP, STATUS_LABELS, COUNTRIES_MAP
- [ ] Componentes base: `Navbar.tsx`, `Footer.tsx`, `GameIcon.tsx`, `StatusPill.tsx`
- [ ] Migrar páginas: `page.tsx` (landing), `login/page.tsx`, `register/page.tsx`
- [ ] Deploy inicial en Vercel

**Semana 2:**
- [ ] Componentes: `TournamentCard.tsx`, `StatCard.tsx`
- [ ] Migrar páginas: `dashboard/page.tsx`, `torneos/page.tsx`, `clasificacion/page.tsx`, `admin/page.tsx`
- [ ] Middleware de auth (proteger dashboard y admin)
- [ ] QA completo: verificar paridad funcional con V1
- [ ] Deploy final Fase 1

**Criterio de done:** todas las funcionalidades de V1 operativas en Next.js, 0 regresiones.

---

### Fase 2 — Perfiles con Historial de Stats (Semana 3)
**Objetivo:** cada jugador tiene perfil público con stats reales.

- [ ] Crear tabla `match_results` en Supabase
- [ ] Página `/players/[username]` con: winrate, torneos jugados, victorias, juego principal, historial de partidas
- [ ] Dashboard → nueva pestaña "Mis Stats"
- [ ] Admin puede registrar resultados de partidas
- [ ] Navbar incluye link a perfil del jugador autenticado

**Criterio de done:** perfil público accesible desde `/players/username`, stats calculados desde `match_results`.

---

### Fase 3 — Brackets Visuales (Semanas 4-5)
**Objetivo:** cada torneo muestra su bracket interactivo.

- [ ] Crear tabla `matches` en Supabase
- [ ] Componente `BracketView.tsx`: renderiza bracket de eliminación simple para 8, 16 o 32 jugadores
- [ ] Componente `MatchSlot.tsx`: par de jugadores, resultado, estado
- [ ] Página `/torneos/[id]` muestra bracket del torneo activo
- [ ] Admin puede avanzar resultados desde panel admin
- [ ] Jugador autenticado ve su posición resaltada en el bracket
- [ ] Realtime opcional (Supabase subscriptions) para actualizar bracket sin recargar

**Criterio de done:** bracket visual funcional para eliminación simple, admin puede gestionar resultados.

---

### Fase 4 — Gestión de Equipos/Clanes (Semanas 6-7)
**Objetivo:** jugadores pueden crear y gestionar equipos.

- [ ] Crear tablas `teams` y `team_members` en Supabase
- [ ] Página `/teams`: lista de equipos con logo, tag, juego, cantidad de miembros
- [ ] Página `/teams/[id]`: perfil del equipo con roster
- [ ] Dashboard → pestaña "Mi Equipo": crear equipo, invitar jugadores, salir
- [ ] Capitán puede aceptar/rechazar miembros
- [ ] Un jugador solo puede pertenecer a un equipo por juego (validado a nivel de aplicación; la DB permite múltiples equipos con distintos `team_id`)

**Criterio de done:** flujo completo crear equipo → invitar → aceptar → ver roster público.

---

## 6. Componentes Clave

### Navbar.tsx
- Logo "Arena Versus" (SVG monograma AV existente)
- Links: Torneos, Juegos, Clasificación, Equipos (nuevo), Nosotros
- Auth condicional: Login/Register si no hay sesión, Avatar + Dashboard si hay sesión
- Sticky, cambia opacidad en scroll

### TournamentCard.tsx
Props: `{ tournament: Tournament, showBracketLink?: boolean }`
- Icono del juego, nombre, fecha, cupos (current/max), StatusPill
- Link a `/torneos/[id]` si showBracketLink

### BracketView.tsx
Props: `{ matches: Match[], currentPlayerId?: string }`
- Grid CSS para bracket visual
- Resalta al jugador autenticado
- Responsive: scroll horizontal en mobile

### StatCard.tsx
Props: `{ icon: string, value: number | string, label: string }`
- Animación de contador en mount
- Gradiente rojo/naranja en valor

---

## 7. Autenticación y Protección de Rutas

- Middleware Next.js (`middleware.ts`) verifica sesión Supabase en cada request
- Rutas protegidas: `/dashboard`, `/admin`
- `/admin` además verifica que `user.id` esté en tabla `admins`
- Redirección: no autenticado → `/login`, no admin → `/`

---

## 8. Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=<mismo que V1>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<mismo que V1>
```

Mismas credenciales de Supabase — no se toca el backend.

---

## 9. Criterios de Éxito Globales

- [ ] Fase 1: paridad 100% con V1, 0 regresiones, deploy en Vercel
- [ ] Fase 2: perfil público de jugador con stats reales
- [ ] Fase 3: bracket visual funcional para torneos activos
- [ ] Fase 4: creación y gestión de equipos/clanes
- [ ] En todas las fases: responsive (mobile-first), tiempo de carga < 2s, Lighthouse > 85
