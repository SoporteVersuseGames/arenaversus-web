# Fase 2 — Perfiles con Historial de Stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada jugador tiene perfil público en `/players/[username]` con winrate, historial de partidas y juego principal; el dashboard muestra una pestaña "Mis Stats"; el admin puede registrar resultados; la navbar enlaza al perfil autenticado.

**Architecture:** Se añade la tabla `match_results` en Supabase (sin cambios al schema existente). La página de perfil es un Server Component que calcula stats en servidor. El dashboard es un Client Component existente al que se agrega un panel más. El admin recibe una segunda sección de formulario para registrar resultados.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, @supabase/ssr, Supabase anon key (mismas credenciales)

---

## Archivos a crear o modificar

| Acción | Archivo | Responsabilidad |
|---|---|---|
| Modificar | `lib/types.ts` | Agregar interface `MatchResult` |
| Crear | `app/players/[username]/page.tsx` | Perfil público con stats calculados en servidor |
| Modificar | `app/dashboard/page.tsx` | Agregar Panel `stats`, pestaña "Mis Stats" |
| Modificar | `app/admin/page.tsx` | Agregar sección registrar resultado de partida |
| Modificar | `components/layout/Navbar.tsx` | Agregar link al perfil del usuario autenticado |

---

## Task 1: Supabase — Crear tabla match_results y tipo TypeScript

**Files:**
- Modify: `lib/types.ts`
- SQL: ejecutar en Supabase Dashboard → SQL Editor

- [ ] **Step 1: Ejecutar SQL en Supabase**

Ve a supabase.com → tu proyecto → SQL Editor y ejecuta:

```sql
-- Tabla de resultados de partidas
CREATE TABLE IF NOT EXISTS match_results (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE SET NULL,
  player_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  opponent_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  result        text CHECK (result IN ('win', 'loss', 'draw')) NOT NULL,
  score         text,
  round         integer,
  played_at     timestamptz DEFAULT now() NOT NULL
);

-- Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_match_results_player ON match_results(player_id);
CREATE INDEX IF NOT EXISTS idx_match_results_tournament ON match_results(tournament_id);

-- RLS: lectura pública, escritura solo autenticados
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "match_results_select_public"
  ON match_results FOR SELECT
  USING (true);

CREATE POLICY "match_results_insert_authenticated"
  ON match_results FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "match_results_delete_authenticated"
  ON match_results FOR DELETE
  TO authenticated
  USING (true);
```

Haz clic en **Run**. Debe decir "Success. No rows returned."

- [ ] **Step 2: Agregar MatchResult a lib/types.ts**

Reemplaza el contenido completo de `lib/types.ts`:

```typescript
export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  bio: string | null
  discord_tag: string | null
  country: string | null
  updated_at: string | null
}

export interface Tournament {
  id: string
  name: string
  game: string
  status: 'upcoming' | 'open' | 'in_progress' | 'finished'
  max_players: number
  current_players: number
  date: string | null
  format: string | null
}

export interface Registration {
  id: string
  player_id: string
  tournament_id: string
  registered_at: string
  tournaments?: Tournament
}

export interface PlayerGame {
  id: string
  player_id: string
  game_name: string
}

export interface MatchResult {
  id: string
  tournament_id: string | null
  player_id: string
  opponent_id: string | null
  result: 'win' | 'loss' | 'draw'
  score: string | null
  round: number | null
  played_at: string
  tournaments?: { name: string; game: string } | null
  opponent?: { username: string | null } | null
}
```

- [ ] **Step 3: Verificar build**

```
npm run build
```

Expected: build limpio, 0 errores. La nueva interface no rompe nada porque es aditiva.

- [ ] **Step 4: Commit**

```
git add lib/types.ts
git commit -m "feat: add MatchResult type and match_results Supabase table"
```

---

## Task 2: Página de perfil público `/players/[username]`

**Files:**
- Create: `app/players/[username]/page.tsx`

- [ ] **Step 1: Crear la carpeta y el archivo**

Crea `app/players/[username]/page.tsx` con este contenido:

```typescript
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { GAMES_MAP, COUNTRIES_MAP, formatDate } from '@/utils/constants'
import type { MatchResult } from '@/lib/types'

interface Props {
  params: Promise<{ username: string }>
}

export default async function PlayerProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: matchResultsRaw } = await supabase
    .from('match_results')
    .select('*, tournaments(name, game), opponent:profiles!match_results_opponent_id_fkey(username)')
    .eq('player_id', profile.id)
    .order('played_at', { ascending: false })

  const matchResults: MatchResult[] = (matchResultsRaw ?? []) as MatchResult[]

  const total = matchResults.length
  const wins = matchResults.filter(m => m.result === 'win').length
  const losses = matchResults.filter(m => m.result === 'loss').length
  const draws = matchResults.filter(m => m.result === 'draw').length
  const winrate = total > 0 ? Math.round((wins / total) * 100) : 0

  const gameCount = matchResults.reduce((acc, m) => {
    const game = m.tournaments?.game ?? ''
    if (game) acc[game] = (acc[game] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const mainGame = Object.entries(gameCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''

  const initial = (profile.username || '?')[0].toUpperCase()

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
      {/* Hero del perfil */}
      <div className="bg-[#1c1c1c] border border-white/7 rounded-2xl p-8 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-av-gradient flex items-center justify-center font-black text-white text-3xl shrink-0">
          {initial}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-black text-white mb-1">{profile.username}</h1>
          {profile.full_name && <p className="text-gray-400 mb-2">{profile.full_name}</p>}
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-400">
            {profile.country && <span>🌍 {COUNTRIES_MAP[profile.country] ?? profile.country}</span>}
            {profile.discord_tag && <span>🎮 {profile.discord_tag}</span>}
            {mainGame && <span>{GAMES_MAP[mainGame]?.split(' ').slice(1).join(' ') ?? mainGame}</span>}
          </div>
          {profile.bio && <p className="mt-3 text-gray-300 text-sm max-w-md">{profile.bio}</p>}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Winrate', value: `${winrate}%`, icon: '📈' },
          { label: 'Victorias', value: wins, icon: '✅' },
          { label: 'Derrotas', value: losses, icon: '❌' },
          { label: 'Partidas', value: total, icon: '🎮' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-[#1c1c1c] border border-white/7 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-2xl font-black text-gradient">{value}</div>
            <div className="text-gray-400 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Historial de partidas */}
      <div className="bg-[#1c1c1c] border border-white/7 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/7">
          <h2 className="font-bold text-white">Historial de Partidas</h2>
        </div>
        {matchResults.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">🎮</div>
            <p>Sin partidas registradas aún</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {matchResults.map(m => (
              <div key={m.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                <div className={`w-16 text-center text-xs font-bold px-2 py-1 rounded-full ${
                  m.result === 'win' ? 'bg-green-500/20 text-green-400' :
                  m.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                  'bg-white/10 text-gray-400'
                }`}>
                  {m.result === 'win' ? 'Victoria' : m.result === 'loss' ? 'Derrota' : 'Empate'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">
                    vs {m.opponent?.username ?? 'Oponente'}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {m.tournaments?.name ?? 'Torneo'}{m.round ? ` · Ronda ${m.round}` : ''}{m.score ? ` · ${m.score}` : ''}
                  </div>
                </div>
                <div className="text-gray-500 text-xs shrink-0">{formatDate(m.played_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/torneos" className="text-sm text-[#ea3935] hover:underline">Ver torneos activos →</Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```
npm run build
```

Expected: nueva ruta `ƒ /players/[username]` en el output, 0 errores.

- [ ] **Step 3: Probar en dev**

```
npm run dev
```

Abre `http://localhost:3000/players/NOMBRE_USUARIO_REAL` (usa un username que exista en tu DB).
Expected: página carga con el perfil y stats en 0 (porque no hay match_results aún).

- [ ] **Step 4: Commit**

```
git add app/players/
git commit -m "feat: add public player profile page /players/[username]"
```

---

## Task 3: Dashboard — Pestaña "Mis Stats"

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Actualizar el tipo Panel y los imports**

En `app/dashboard/page.tsx`, reemplaza las líneas 1-11:

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GAMES_MAP, STATUS_LABELS, STATUS_COLORS, COUNTRIES_MAP, formatDate } from '@/utils/constants'
import type { Profile, Registration, Tournament, MatchResult } from '@/lib/types'

type Panel = 'overview' | 'torneos' | 'perfil' | 'stats'

type RegistrationWithTournament = Registration & { tournaments: Tournament | null }
```

- [ ] **Step 2: Agregar estado de matchResults**

En `app/dashboard/page.tsx`, reemplaza la línea que tiene `const [sidebarOpen, setSidebarOpen] = useState(false)`:

```typescript
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
```

- [ ] **Step 3: Cargar match_results en el init**

Reemplaza la función `init` completa dentro del `useEffect`:

```typescript
    async function init() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const userId = session.user.id
      const [profileRes, torneosRes, statsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('registrations').select('*, tournaments(*)').eq('player_id', userId),
        supabase.from('match_results')
          .select('*, tournaments(name, game), opponent:profiles!match_results_opponent_id_fkey(username)')
          .eq('player_id', userId)
          .order('played_at', { ascending: false }),
      ])
      setProfile(profileRes.data)
      setRegistrations((torneosRes.data ?? []) as RegistrationWithTournament[])
      setMatchResults((statsRes.data ?? []) as MatchResult[])
      setLoading(false)
    }
```

- [ ] **Step 4: Agregar "Mis Stats" a los navItems**

Reemplaza el array `navItems` completo:

```typescript
  const navItems = [
    { key: 'overview' as Panel, icon: '🏠', label: 'Resumen', badge: undefined },
    { key: 'torneos' as Panel, icon: '🏆', label: 'Mis Torneos', badge: registrations.length },
    { key: 'stats' as Panel, icon: '📈', label: 'Mis Stats', badge: undefined },
    { key: 'perfil' as Panel, icon: '👤', label: 'Editar Perfil', badge: undefined },
  ]
```

- [ ] **Step 5: Agregar el panel de stats antes del cierre del `<main>`**

Justo antes de `</main>` (línea que cierra el main), agrega:

```typescript
        {panel === 'stats' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-white hidden md:block">Mis Stats</h1>
              {profile?.username && (
                <Link href={`/players/${profile.username}`} className="text-sm text-[#ea3935] hover:underline">
                  Ver perfil público →
                </Link>
              )}
            </div>
            {(() => {
              const total = matchResults.length
              const wins = matchResults.filter(m => m.result === 'win').length
              const losses = matchResults.filter(m => m.result === 'loss').length
              const winrate = total > 0 ? Math.round((wins / total) * 100) : 0
              const gameCount = matchResults.reduce((acc, m) => {
                const game = m.tournaments?.game ?? ''
                if (game) acc[game] = (acc[game] ?? 0) + 1
                return acc
              }, {} as Record<string, number>)
              const mainGame = Object.entries(gameCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
              return (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: '📈', value: `${winrate}%`, label: 'Winrate' },
                      { icon: '✅', value: wins, label: 'Victorias' },
                      { icon: '❌', value: losses, label: 'Derrotas' },
                      { icon: '🎮', value: total, label: 'Partidas' },
                    ].map(({ icon, value, label }) => (
                      <div key={label} className="bg-[#1c1c1c] border border-white/7 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-2">{icon}</div>
                        <div className="text-2xl font-black text-gradient">{value}</div>
                        <div className="text-gray-400 text-xs mt-1">{label}</div>
                      </div>
                    ))}
                  </div>
                  {mainGame && (
                    <div className="bg-[#1c1c1c] border border-white/7 rounded-xl p-4 flex items-center gap-4">
                      <div className="text-3xl">{GAMES_MAP[mainGame]?.split(' ')[0]}</div>
                      <div>
                        <div className="text-xs text-gray-500">Juego principal</div>
                        <div className="font-bold text-white">{GAMES_MAP[mainGame]?.split(' ').slice(1).join(' ') ?? mainGame}</div>
                      </div>
                    </div>
                  )}
                  <div className="bg-[#1c1c1c] border border-white/7 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/7">
                      <h3 className="font-bold text-white">Historial Reciente</h3>
                    </div>
                    {matchResults.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">Sin partidas registradas aún</div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {matchResults.slice(0, 10).map(m => (
                          <div key={m.id} className="px-6 py-3 flex items-center gap-4">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              m.result === 'win' ? 'bg-green-500/20 text-green-400' :
                              m.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                              'bg-white/10 text-gray-400'
                            }`}>
                              {m.result === 'win' ? 'Victoria' : m.result === 'loss' ? 'Derrota' : 'Empate'}
                            </span>
                            <div className="flex-1 min-w-0 text-sm">
                              <span className="text-white">vs {m.opponent?.username ?? 'Oponente'}</span>
                              <span className="text-gray-500 ml-2">{m.tournaments?.name}</span>
                            </div>
                            <span className="text-gray-500 text-xs">{formatDate(m.played_at)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        )}
```

- [ ] **Step 6: Actualizar el título móvil para incluir 'stats'**

Reemplaza la línea que tiene el h1 con la condición de panel (en la sección móvil):

```typescript
          <h1 className="font-bold text-white text-lg">
            {panel === 'overview' ? 'Resumen' : panel === 'torneos' ? 'Mis Torneos' : panel === 'stats' ? 'Mis Stats' : 'Editar Perfil'}
          </h1>
```

- [ ] **Step 7: Verificar build**

```
npm run build
```

Expected: 0 errores, 0 warnings.

- [ ] **Step 8: Commit**

```
git add app/dashboard/page.tsx
git commit -m "feat: add Mis Stats panel to dashboard"
```

---

## Task 4: Admin — Registrar resultado de partida

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Actualizar imports y agregar estado para match results**

En `app/admin/page.tsx`, reemplaza las líneas 1-11:

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GAMES_MAP, STATUS_LABELS, STATUS_COLORS, formatDate } from '@/utils/constants'
import type { Tournament, Profile } from '@/lib/types'
```

Luego agrega los nuevos estados después de `const [creating, setCreating] = useState(false)`:

```typescript
  const [players, setPlayers] = useState<Profile[]>([])
  const [registeringResult, setRegisteringResult] = useState(false)
  const [resultOk, setResultOk] = useState(false)
```

- [ ] **Step 2: Cargar jugadores en init**

Reemplaza la función `init` completa:

```typescript
    async function init() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: adminData } = await supabase.from('admins').select('id').eq('user_id', session.user.id).single()
      if (!adminData) { router.push('/'); return }
      loadTournaments()
      const { data: playersData } = await supabase.from('profiles').select('*').order('username')
      setPlayers(playersData ?? [])
    }
```

- [ ] **Step 3: Agregar función handleRegisterResult**

Agrega esta función después de `deleteTournament`:

```typescript
  async function handleRegisterResult(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setRegisteringResult(true)
    const supabase = createClient()
    const fd = new FormData(e.currentTarget)
    await supabase.from('match_results').insert({
      tournament_id: (fd.get('tournament_id') as string) || null,
      player_id: fd.get('player_id') as string,
      opponent_id: (fd.get('opponent_id') as string) || null,
      result: fd.get('result') as string,
      score: (fd.get('score') as string) || null,
      round: fd.get('round') ? parseInt(fd.get('round') as string) : null,
    });
    (e.target as HTMLFormElement).reset()
    setRegisteringResult(false)
    setResultOk(true)
    setTimeout(() => setResultOk(false), 3000)
  }
```

- [ ] **Step 4: Agregar sección de registro de resultados en el JSX**

Justo después del cierre del `div` de "Crear Torneo" (después de `</div>` que cierra `bg-[#1c1c1c] border border-white/7 rounded-xl p-6 mb-8`) y antes de la sección "Todos los Torneos", agrega:

```typescript
      <div className="bg-[#1c1c1c] border border-white/7 rounded-xl p-6 mb-8">
        <h2 className="font-bold text-white mb-4">Registrar Resultado de Partida</h2>
        <form onSubmit={handleRegisterResult} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Torneo</label>
            <select name="tournament_id" className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ea3935]/50">
              <option value="">Sin torneo</option>
              {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Jugador *</label>
            <select name="player_id" required className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ea3935]/50">
              <option value="">Seleccionar jugador</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.username ?? p.id}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Oponente</label>
            <select name="opponent_id" className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ea3935]/50">
              <option value="">Sin oponente</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.username ?? p.id}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Resultado *</label>
            <select name="result" required className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ea3935]/50">
              <option value="win">Victoria</option>
              <option value="loss">Derrota</option>
              <option value="draw">Empate</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Marcador</label>
            <input name="score" placeholder="2-1" className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ea3935]/50" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Ronda</label>
            <input name="round" type="number" min={1} placeholder="1" className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ea3935]/50" />
          </div>
          <div className="flex items-end gap-3 lg:col-span-3">
            <button type="submit" disabled={registeringResult} className="px-6 py-2 rounded-lg bg-av-gradient text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
              {registeringResult ? 'Guardando...' : '+ Registrar Resultado'}
            </button>
            {resultOk && <span className="text-green-400 text-sm">✅ Resultado registrado</span>}
          </div>
        </form>
      </div>
```

- [ ] **Step 5: Verificar build**

```
npm run build
```

Expected: 0 errores.

- [ ] **Step 6: Commit**

```
git add app/admin/page.tsx
git commit -m "feat: add match result registration to admin panel"
```

---

## Task 5: Navbar — Link al perfil del jugador autenticado

**Files:**
- Modify: `components/layout/Navbar.tsx`

- [ ] **Step 1: Agregar estado username y cargarlo con el perfil**

En `components/layout/Navbar.tsx`, reemplaza el bloque de estados (líneas 9-13):

```typescript
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
```

- [ ] **Step 2: Cargar el username tras la sesión**

Reemplaza `supabase.auth.getSession().then(...)` completo:

```typescript
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkAdmin(session.user.id)
        loadUsername(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkAdmin(session.user.id)
        loadUsername(session.user.id)
      } else {
        setIsAdmin(false)
        setUsername(null)
      }
    })
```

- [ ] **Step 3: Agregar función loadUsername**

Justo después de la función `checkAdmin`, agrega:

```typescript
  async function loadUsername(userId: string) {
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('username').eq('id', userId).single()
    setUsername(data?.username ?? null)
  }
```

- [ ] **Step 4: Agregar link al perfil en el menú desktop**

En la sección del menú desktop (dentro del bloque `{user ? (...) : (...)}` para desktop), reemplaza:

```typescript
          {user ? (
            <>
              {isAdmin && <Link href="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">⚙ Admin</Link>}
              {username && (
                <Link href={`/players/${username}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                  👤 Mi Perfil
                </Link>
              )}
              <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-[#1c1c1c] border border-white/10 text-white text-sm hover:border-[#ea3935]/50 transition-all">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition-colors">Salir</button>
            </>
          ) : (
```

- [ ] **Step 5: Agregar link al perfil en el menú móvil**

En el bloque móvil (`{user ? (...) : (...)}`), reemplaza:

```typescript
          {user ? (
            <>
              {username && (
                <Link href={`/players/${username}`} className="text-gray-300 py-2 text-sm" onClick={() => setMenuOpen(false)}>👤 Mi Perfil</Link>
              )}
              <Link href="/dashboard" className="text-gray-300 py-2 text-sm" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="text-left text-[#ea3935] py-2 text-sm">Cerrar sesión</button>
            </>
          ) : (
```

- [ ] **Step 6: Verificar build**

```
npm run build
```

Expected: 0 errores, 0 warnings.

- [ ] **Step 7: Probar flujo completo en dev**

```
npm run dev
```

1. Inicia sesión → el navbar debe mostrar "👤 Mi Perfil"
2. Haz clic en "Mi Perfil" → debe ir a `/players/TU_USERNAME`
3. En `/dashboard` → pestaña "Mis Stats" → stats en 0
4. En `/admin` → sección "Registrar Resultado" con dropdowns de jugadores
5. Registra un resultado → ve a Dashboard → Mis Stats → debe aparecer la partida

- [ ] **Step 8: Commit y push**

```
git add components/layout/Navbar.tsx
git commit -m "feat: add player profile link to navbar for authenticated users"
git push origin master
```

---

## Self-Review

**Spec coverage:**
- ✅ Tabla `match_results` en Supabase (Task 1)
- ✅ Página `/players/[username]` con winrate, torneos jugados, victorias, juego principal, historial (Task 2)
- ✅ Dashboard → pestaña "Mis Stats" (Task 3)
- ✅ Admin puede registrar resultados (Task 4)
- ✅ Navbar incluye link al perfil del jugador autenticado (Task 5)

**Placeholder scan:** Ninguno. Todo el código está completo.

**Type consistency:**
- `MatchResult` definido en Task 1, usado en Task 2, 3
- `Profile` existente, usado en Task 4 para players dropdown
- `Panel` extendido en Task 3 con `'stats'`
