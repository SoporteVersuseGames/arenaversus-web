# Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full visual refresh of ArenaVersus — replace emoji icons with gaming photography, introduce vibrant gamer color palette (orange/black + per-game neon), and add missing landing page sections.

**Architecture:** Each task is self-contained. Tasks 1–5 build shared utilities and components; Tasks 6–8 consume them in page files. Task 1 must be completed first (color vars + constants). Tasks 2–5 can be done in any order after Task 1. Tasks 6–8 depend on Tasks 2–5 being complete.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, Supabase (server client from `@/lib/supabase/server`)

---

## File Map

| File | Action | Task |
|---|---|---|
| `app/globals.css` | MODIFY | 1, 4 |
| `utils/constants.ts` | MODIFY | 1 |
| `components/ui/GameIcon.tsx` | MODIFY | 2 |
| `components/ui/TournamentCard.tsx` | MODIFY | 3 |
| `components/ui/MediaTicker.tsx` | CREATE | 4 |
| `components/ui/HeroTabs.tsx` | CREATE | 5 |
| `app/page.tsx` | MODIFY | 6 |
| `app/clasificacion/page.tsx` | MODIFY | 7 |
| `app/players/[username]/page.tsx` | MODIFY | 8 |

---

## Task 1: Color system + game maps

**Files:**
- Modify: `app/globals.css`
- Modify: `utils/constants.ts`

Update CSS variables to vibrant orange/black gamer palette and add GAME_KEY_MAP, GAME_COLORS, GAME_PHOTOS, GAMES_DISPLAY to constants.

- [ ] **Step 1: Replace CSS variables in `app/globals.css`**

Replace the entire file content:

```css
@import "tailwindcss";

@theme {
  --color-av-red: #FF3D00;
  --color-av-orange: #FF6D00;
  --color-av-black: #0a0a0a;
  --color-av-black2: #141414;
  --color-av-black3: #1a1a1a;
  --font-sans: 'Inter Tight', sans-serif;
}

:root {
  --red:        #FF3D00;
  --orange:     #FF6D00;
  --gradient:   linear-gradient(135deg, #FF3D00 0%, #FF6D00 100%);
  --black:      #0a0a0a;
  --black2:     #141414;
  --black3:     #1a1a1a;
  --border:     1px solid rgba(255,255,255,0.06);
  --transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
}

@utility text-gradient {
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@utility bg-av-gradient {
  background: var(--gradient);
}

/* Per-game hover border using CSS custom property --game-color set inline */
.game-card-hover:hover {
  border-color: var(--game-color, #FF3D00);
}

/* Ticker animation for MediaTicker */
@keyframes ticker {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.ticker-track {
  animation: ticker 30s linear infinite;
}

.ticker-track:hover {
  animation-play-state: paused;
}
```

- [ ] **Step 2: Add game maps and display list to `utils/constants.ts`**

Add the following exports **below** the existing exports (do NOT remove any existing export):

```ts
export const GAME_KEY_MAP: Record<string, string> = {
  'FC26':              'fc26',
  'Valorant':          'valorant',
  'League of Legends': 'lol',
  'Fortnite':          'fortnite',
  'Free Fire':         'free_fire',
  'PUBG':              'pubg',
  'Call of Duty':      'cod',
  'Rocket League':     'rocket_league',
  'Street Fighter':    'street_fighter',
  'Tekken':            'tekken',
  'Clash Royale':      'clash_royale',
  'Mobile Legends':    'mobile_legends',
}

export function toGameKey(game: string): string {
  return GAME_KEY_MAP[game] ?? game.toLowerCase().replace(/\s+/g, '_')
}

export const GAME_COLORS: Record<string, string> = {
  fc26:           '#FF3D00',
  valorant:       '#00E5FF',
  lol:            '#BF00FF',
  fortnite:       '#00CFFF',
  free_fire:      '#FF8C00',
  rocket_league:  '#00B4FF',
  street_fighter: '#DC2626',
  clash_royale:   '#A855F7',
}

export const GAME_PHOTOS: Record<string, string> = {
  fc26:           'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=80',
  valorant:       'https://images.unsplash.com/photo-1542751110-97427bbecfd7?w=600&q=80',
  lol:            'https://images.unsplash.com/photo-1511882150382-421056c89033?w=600&q=80',
  fortnite:       'https://images.unsplash.com/photo-1561883088-039e53143d73?w=600&q=80',
  free_fire:      'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&q=80',
  rocket_league:  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80',
  street_fighter: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
  clash_royale:   'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&q=80',
}

export const GAMES_DISPLAY = [
  { key: 'FC26',              name: 'FC 26',             format: '11 vs 11'     },
  { key: 'Valorant',          name: 'Valorant',          format: '5 vs 5'       },
  { key: 'League of Legends', name: 'League of Legends', format: '5 vs 5'       },
  { key: 'Fortnite',          name: 'Fortnite',          format: 'Battle Royale' },
  { key: 'Free Fire',         name: 'Free Fire',         format: 'Battle Royale' },
  { key: 'Rocket League',     name: 'Rocket League',     format: '3 vs 3'       },
  { key: 'Street Fighter',    name: 'Street Fighter',    format: '1 vs 1'       },
  { key: 'Clash Royale',      name: 'Clash Royale',      format: '1 vs 1'       },
] as const
```

- [ ] **Step 3: Type check**

```powershell
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add app/globals.css utils/constants.ts
git commit -m "feat: update color system and add game maps for visual redesign"
```

---

## Task 2: GameIcon component — photo card

**Files:**
- Modify: `components/ui/GameIcon.tsx`

Replace the emoji span with a photo card that shows the game's Unsplash photo and neon color overlay.

- [ ] **Step 1: Replace `components/ui/GameIcon.tsx`**

```tsx
import { toGameKey, GAME_PHOTOS, GAME_COLORS } from '@/utils/constants'

interface GameIconProps {
  game: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES: Record<string, { box: string; text: string }> = {
  sm: { box: 'w-8 h-8',          text: 'text-[10px]' },
  md: { box: 'w-12 h-12',        text: 'text-xs'     },
  lg: { box: 'w-full h-[120px]', text: 'text-base'   },
}

export default function GameIcon({ game, size = 'md', className = '' }: GameIconProps) {
  const key   = toGameKey(game)
  const photo = GAME_PHOTOS[key]
  const color = GAME_COLORS[key] ?? '#FF3D00'
  const { box, text } = SIZES[size]

  if (!photo) {
    return (
      <div
        className={`${box} rounded-lg flex items-center justify-center font-bold text-white ${text} shrink-0 ${className}`}
        style={{ backgroundColor: color }}
      >
        {game.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div className={`${box} relative rounded-lg overflow-hidden shrink-0 ${className}`}>
      <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${color}66, transparent)` }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Type check**

```powershell
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```powershell
git add components/ui/GameIcon.tsx
git commit -m "feat: replace GameIcon emoji with photo card component"
```

---

## Task 3: TournamentCard component — photo header

**Files:**
- Modify: `components/ui/TournamentCard.tsx`

Add an 80px photo header with neon overlay, move status pill into the header, use per-game neon color for progress bar and hover border.

- [ ] **Step 1: Replace `components/ui/TournamentCard.tsx`**

```tsx
import Link from 'next/link'
import type { Tournament } from '@/lib/types'
import StatusPill from './StatusPill'
import { formatDate, toGameKey, GAME_PHOTOS, GAME_COLORS } from '@/utils/constants'
import RegisterButton from './RegisterButton'

interface TournamentCardProps {
  tournament: Tournament
  showBracketLink?: boolean
  userId?: string | null
  isRegistered?: boolean
}

export default function TournamentCard({
  tournament,
  showBracketLink = false,
  userId,
  isRegistered = false,
}: TournamentCardProps) {
  const spotsLeft = tournament.max_players - tournament.current_players
  const pct       = Math.min((tournament.current_players / tournament.max_players) * 100, 100)
  const isOpen    = tournament.status === 'open'

  const key   = toGameKey(tournament.game)
  const photo = GAME_PHOTOS[key]
  const color = GAME_COLORS[key] ?? '#FF3D00'

  return (
    <div
      className="game-card-hover bg-[#141414] border border-white/[0.07] rounded-xl overflow-hidden transition-all group"
      style={{ '--game-color': color } as React.CSSProperties}
    >
      {/* Photo header */}
      <div className="relative h-20 overflow-hidden">
        {photo ? (
          <>
            <img
              src={photo}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              loading="lazy"
            />
            <div className="absolute inset-0" style={{ backgroundColor: color + '73' }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: color + 'aa' }} />
        )}
        <div className="absolute inset-0 flex items-end justify-between px-3 pb-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider drop-shadow">
            {tournament.game}
          </span>
          <StatusPill status={tournament.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-white text-base mb-1 group-hover:text-[#FF3D00] transition-colors">
          {tournament.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4">{formatDate(tournament.start_date)}</p>

        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">
            {tournament.current_players}/{tournament.max_players} jugadores
          </span>
          <span className={spotsLeft <= 5 ? 'text-[#FF3D00] font-semibold' : 'text-gray-400'}>
            {spotsLeft > 0 ? `${spotsLeft} cupos` : 'Lleno'}
          </span>
        </div>

        <div className="w-full bg-white/10 rounded-full h-1 mb-4">
          <div
            className="h-1 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>

        <div className="space-y-2">
          {isOpen && (
            <RegisterButton
              tournamentId={tournament.id}
              userId={userId ?? null}
              isRegistered={isRegistered}
              isFull={spotsLeft <= 0}
              currentPlayers={tournament.current_players}
            />
          )}
          {showBracketLink && (
            <Link
              href={`/torneos/${tournament.id}`}
              className="block text-center py-2 rounded-lg border text-sm font-medium transition-all hover:bg-white/5"
              style={{ borderColor: color + '66', color }}
            >
              Ver torneo →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type check**

```powershell
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```powershell
git add components/ui/TournamentCard.tsx
git commit -m "feat: add photo header and neon accents to TournamentCard"
```

---

## Task 4: MediaTicker component — infinite scroll ticker

**Files:**
- Create: `components/ui/MediaTicker.tsx`

A client component that renders an infinite horizontally-scrolling strip of gaming images using CSS animation. The animation is already defined in `app/globals.css` (`.ticker-track` class added in Task 1).

- [ ] **Step 1: Create `components/ui/MediaTicker.tsx`**

```tsx
'use client'

const TICKER_IMAGES = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=320&q=80',
  'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=320&q=80',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=320&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=320&q=80',
  'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=320&q=80',
  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=320&q=80',
  'https://images.unsplash.com/photo-1511882150382-421056c89033?w=320&q=80',
]

export default function MediaTicker() {
  // Items duplicated so -50% translateX creates a seamless loop
  const items = [...TICKER_IMAGES, ...TICKER_IMAGES]

  return (
    <div className="overflow-hidden">
      <div className="ticker-track flex gap-3 w-max">
        {items.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-40 h-[90px] rounded-lg overflow-hidden relative border border-white/5 hover:border-[#FF3D00]/40 transition-colors"
          >
            <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type check**

```powershell
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```powershell
git add components/ui/MediaTicker.tsx
git commit -m "feat: create MediaTicker infinite scroll component"
```

---

## Task 5: HeroTabs component — interactive game tabs

**Files:**
- Create: `components/ui/HeroTabs.tsx`

A client component that renders the hero section's dynamic background and bottom tab strip. The parent page (server component) wraps static hero content and this component in a `relative min-h-screen` container.

HeroTabs renders:
1. An `absolute inset-0` background (photo + neon glow + dark overlay) that updates when the active tab changes.
2. An `absolute bottom-0` tab strip with one tab per game.

- [ ] **Step 1: Create `components/ui/HeroTabs.tsx`**

```tsx
'use client'

import { useState } from 'react'
import GameIcon from './GameIcon'
import { toGameKey, GAME_COLORS, GAME_PHOTOS } from '@/utils/constants'

export type HeroGame = {
  key: string   // DB value: 'FC26', 'Valorant', etc.
  name: string  // display name
  count: number // number of active tournaments for this game
}

interface HeroTabsProps {
  games: HeroGame[]
}

export default function HeroTabs({ games }: HeroTabsProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  const active  = games[activeIdx] ?? games[0]
  const gameKey = toGameKey(active?.key ?? '')
  const photo   = GAME_PHOTOS[gameKey]
  const color   = GAME_COLORS[gameKey] ?? '#FF3D00'

  return (
    <>
      {/* Dynamic background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {photo && (
          <img
            key={photo}
            src={photo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.22 }}
          />
        )}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: `radial-gradient(ellipse 80% 55% at 50% 35%, ${color}28 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80" />
      </div>

      {/* Tab strip — pinned to bottom of hero section */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/70 backdrop-blur-sm overflow-x-auto">
        <div className="flex min-w-max">
          {games.map((game, idx) => {
            const gKey    = toGameKey(game.key)
            const gColor  = GAME_COLORS[gKey] ?? '#FF3D00'
            const isActive = idx === activeIdx
            return (
              <button
                key={game.key}
                onClick={() => setActiveIdx(idx)}
                className="flex items-center gap-2 px-4 py-3 relative shrink-0 transition-opacity"
                style={{ opacity: isActive ? 1 : 0.45 }}
              >
                <GameIcon game={game.key} size="sm" />
                <div className="text-left">
                  <div className="text-white text-xs font-semibold whitespace-nowrap leading-tight">
                    {game.name}
                  </div>
                  <div className="text-gray-400 text-[10px] leading-tight">
                    {game.count} {game.count === 1 ? 'torneo' : 'torneos'}
                  </div>
                </div>
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: gColor }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Type check**

```powershell
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```powershell
git add components/ui/HeroTabs.tsx
git commit -m "feat: create HeroTabs client component for dynamic hero background"
```

---

## Task 6: Landing page — full redesign

**Files:**
- Modify: `app/page.tsx`

Full replacement. Server component that fetches all data in parallel and renders 10 sections: Live Banner, Hero+Tabs, Featured Tournaments, Top 5 Players, Games Grid, Media (Ticker + YouTube), How It Works, Discord CTA, Nosotros, Final CTA.

`YOUTUBE_IDS` defaults to three empty strings — the YouTube grid is hidden until real IDs are inserted.

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TournamentCard from '@/components/ui/TournamentCard'
import HeroTabs from '@/components/ui/HeroTabs'
import MediaTicker from '@/components/ui/MediaTicker'
import type { Tournament } from '@/lib/types'
import type { HeroGame } from '@/components/ui/HeroTabs'
import {
  GAMES_DISPLAY,
  COUNTRIES_MAP,
  formatDate,
  toGameKey,
  GAME_PHOTOS,
  GAME_COLORS,
} from '@/utils/constants'

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function getActiveTournaments(): Promise<Tournament[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .in('status', ['open', 'upcoming', 'in_progress'])
      .order('start_date', { ascending: true })
      .limit(20)
    return data ?? []
  } catch {
    return []
  }
}

async function getStats() {
  try {
    const supabase = await createClient()
    const [{ count: players }, { count: tournaments }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    ])
    return { players: players ?? 0, tournaments: tournaments ?? 0 }
  } catch {
    return { players: 0, tournaments: 0 }
  }
}

async function getTopPlayers() {
  try {
    const supabase = await createClient()
    const [profilesRes, matchesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, country, avatar_url')
        .not('username', 'is', null),
      supabase.from('match_results').select('player_id, result'),
    ])

    const profiles = (profilesRes.data ?? []) as {
      id: string
      username: string | null
      country: string | null
      avatar_url: string | null
    }[]
    const matches = (matchesRes.data ?? []) as { player_id: string; result: string }[]

    const statsMap: Record<string, { wins: number; total: number }> = {}
    matches.forEach(m => {
      if (!statsMap[m.player_id]) statsMap[m.player_id] = { wins: 0, total: 0 }
      statsMap[m.player_id].total++
      if (m.result === 'win') statsMap[m.player_id].wins++
    })

    return profiles
      .map(p => {
        const s = statsMap[p.id] ?? { wins: 0, total: 0 }
        const winrate = s.total > 0 ? Math.round((s.wins / s.total) * 100) : 0
        return { ...p, wins: s.wins, total: s.total, winrate }
      })
      .sort((a, b) => b.wins - a.wins || b.winrate - a.winrate || b.total - a.total)
      .slice(0, 5)
  } catch {
    return []
  }
}

async function getLiveBanner() {
  try {
    const supabase = await createClient()
    const { data: live } = await supabase
      .from('tournaments')
      .select('id, title, status, start_date')
      .eq('status', 'in_progress')
      .order('start_date', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (live) return { ...live, type: 'live' as const }

    const { data: next } = await supabase
      .from('tournaments')
      .select('id, title, status, start_date')
      .in('status', ['open', 'upcoming'])
      .order('start_date', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (next) return { ...next, type: 'upcoming' as const }

    return null
  } catch {
    return null
  }
}

// ─── YouTube IDs — replace with real video IDs when available ─────────────────
const YOUTUBE_IDS: [string, string, string] = ['', '', '']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [tournaments, stats, topPlayers, liveBanner] = await Promise.all([
    getActiveTournaments(),
    getStats(),
    getTopPlayers(),
    getLiveBanner(),
  ])

  const featured = tournaments.slice(0, 4)

  // Count active tournaments per game for hero tabs
  const gameCountMap: Record<string, number> = {}
  tournaments.forEach(t => {
    gameCountMap[t.game] = (gameCountMap[t.game] ?? 0) + 1
  })
  const heroGames: HeroGame[] = GAMES_DISPLAY.map(g => ({
    key: g.key,
    name: g.name,
    count: gameCountMap[g.key] ?? 0,
  }))

  return (
    <>
      {/* ── LIVE BANNER ─────────────────────────────────────────────────── */}
      {liveBanner && (
        <div
          className="flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 border-b border-[#FF3D00]/20"
          style={{ background: 'rgba(255,61,0,0.07)', borderLeft: '3px solid #FF3D00' }}
        >
          <p className="text-sm text-white truncate">
            {liveBanner.type === 'live' ? (
              <>
                <span className="text-[#FF3D00] font-bold">🔴 EN VIVO</span>
                {' · '}{liveBanner.title}
              </>
            ) : (
              <>
                <span className="text-[#FF3D00] font-bold">⚡ PRÓXIMO</span>
                {' · '}{liveBanner.title}
                {liveBanner.start_date ? ` · ${formatDate(liveBanner.start_date)}` : ''}
              </>
            )}
          </p>
          <Link
            href={`/torneos/${liveBanner.id}`}
            className="text-xs text-[#FF3D00] font-medium hover:underline whitespace-nowrap shrink-0"
          >
            Ver ahora →
          </Link>
        </div>
      )}

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <HeroTabs games={heroGames} />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 pb-32 pt-8">
          <div className="inline-flex items-center gap-2 bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-full px-4 py-2 text-sm text-[#FF3D00] font-medium mb-8">
            <span className="w-2 h-2 bg-[#FF3D00] rounded-full animate-pulse" />
            ⚡ Plataforma Oficial de Torneos LATAM
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Torneos de{' '}
            <span className="text-gradient">Esports</span>
            <br />Profesionales en LATAM
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Compite mes a mes con reglamentos profesionales. Sube de nivel. Gana reputación.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="px-8 py-4 rounded-xl bg-av-gradient text-white font-bold text-lg hover:opacity-90 transition-opacity"
              style={{ boxShadow: '0 0 30px rgba(255,61,0,0.4)' }}
            >
              ⚡ Empieza Ahora
            </Link>
            <Link
              href="/torneos"
              className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-lg hover:border-[#FF3D00]/50 hover:bg-white/5 transition-all"
            >
              Ver Torneos →
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { value: `${stats.players}+`, label: 'Jugadores Registrados' },
              { value: `${stats.tournaments}+`, label: 'Torneos Realizados' },
              { value: '$0', label: 'Costo de Entrada' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-black text-gradient">{value}</div>
                <div className="text-gray-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED TOURNAMENTS ────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-20 px-4 bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black text-white mb-2">Torneos Destacados</h2>
                <p className="text-gray-400">Inscríbete y compite ahora</p>
              </div>
              <Link href="/torneos" className="text-[#FF3D00] hover:underline text-sm font-medium">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map(t => (
                <TournamentCard key={t.id} tournament={t} showBracketLink />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TOP 5 PLAYERS ───────────────────────────────────────────────── */}
      {topPlayers.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-black text-white mb-2">Top Jugadores LATAM</h2>
                <p className="text-gray-400">Líderes de la temporada</p>
              </div>
              <Link href="/clasificacion" className="text-[#FF3D00] hover:underline text-sm font-medium">
                Ver ranking →
              </Link>
            </div>
            <div className="bg-[#141414] border border-white/[0.07] rounded-xl overflow-hidden">
              {topPlayers.map((player, i) => (
                <div
                  key={player.id}
                  className="flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <span
                    className="w-7 text-center font-bold text-sm shrink-0"
                    style={{ color: i === 0 ? '#FF3D00' : '#555' }}
                  >
                    #{i + 1}
                  </span>
                  {player.avatar_url ? (
                    <img
                      src={player.avatar_url}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-av-gradient flex items-center justify-center font-bold text-white text-xs shrink-0">
                      {(player.username || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {player.username ? (
                      <Link
                        href={`/players/${player.username}`}
                        className="font-semibold text-white text-sm hover:text-[#FF3D00] transition-colors block truncate"
                      >
                        {player.username}
                      </Link>
                    ) : (
                      <span className="font-semibold text-white text-sm block truncate">Jugador</span>
                    )}
                    {player.country && (
                      <span className="text-gray-500 text-xs">
                        {COUNTRIES_MAP[player.country] ?? player.country}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-sm font-bold shrink-0"
                    style={{ color: i < 3 ? '#39FF14' : 'white' }}
                  >
                    {player.total > 0 ? `${player.winrate}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GAMES GRID ──────────────────────────────────────────────────── */}
      <section id="juegos" className="py-20 px-4 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Juegos Soportados</h2>
            <p className="text-gray-400">Compite en tu título favorito</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GAMES_DISPLAY.map(({ key, name, format }) => {
              const gKey  = toGameKey(key)
              const photo = GAME_PHOTOS[gKey]
              const color = GAME_COLORS[gKey] ?? '#FF3D00'
              return (
                <div
                  key={key}
                  className="game-card-hover relative rounded-xl overflow-hidden border border-white/[0.07] h-[120px] transition-all hover:scale-[1.02] cursor-default"
                  style={{ '--game-color': color } as React.CSSProperties}
                >
                  {photo && (
                    <img
                      src={photo}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top right, ${color}aa, transparent 60%)`,
                    }}
                  />
                  <div className="absolute bottom-3 left-3">
                    <div className="font-bold text-white text-sm leading-tight drop-shadow">{name}</div>
                    <div className="text-gray-300/80 text-xs mt-0.5">{format}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── MEDIA SECTION ───────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Ticker */}
          <p className="text-[#FF3D00] text-xs font-bold uppercase tracking-[3px] mb-4">
            Highlights Gaming
          </p>
          <div className="mb-16">
            <MediaTicker />
          </div>

          {/* YouTube grid — hidden when no IDs configured */}
          {YOUTUBE_IDS.some(id => id.length > 0) && (
            <>
              <p className="text-[#FF3D00] text-xs font-bold uppercase tracking-[3px] mb-4">
                Últimos Highlights
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 aspect-video rounded-xl overflow-hidden bg-[#141414]">
                  <iframe
                    src={`https://www.youtube.com/embed/${YOUTUBE_IDS[0]}?autoplay=0&rel=0`}
                    className="w-full h-full"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="flex flex-col gap-4">
                  {([YOUTUBE_IDS[1], YOUTUBE_IDS[2]] as string[])
                    .filter(id => id.length > 0)
                    .map((id, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden bg-[#141414]">
                        <iframe
                          src={`https://www.youtube.com/embed/${id}?autoplay=0&rel=0`}
                          className="w-full h-full"
                          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">¿Cómo Funciona?</h2>
            <p className="text-gray-400">En 3 simples pasos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '1', title: 'Crea tu cuenta',  desc: 'Regístrate gratis en menos de un minuto. Sin tarjeta de crédito.' },
              { n: '2', title: 'Elige tu torneo', desc: 'Explora los torneos disponibles y encuentra el que encaja con tu juego.' },
              { n: '3', title: 'Compite y gana',  desc: 'Sigue el bracket, coordina con rivales y lleva tu gaming al siguiente nivel.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div
                  className="w-14 h-14 rounded-full bg-av-gradient flex items-center justify-center font-black text-white text-xl mx-auto mb-4"
                  style={{ boxShadow: '0 0 20px rgba(255,61,0,0.35)' }}
                >
                  {n}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISCORD CTA ─────────────────────────────────────────────────── */}
      <section
        className="py-20 px-4"
        style={{
          background: 'linear-gradient(135deg, rgba(255,61,0,0.06) 0%, rgba(123,47,190,0.06) 100%)',
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6">💬</div>
          <h2 className="text-4xl font-black text-white mb-4">Únete a la comunidad</h2>
          <p className="text-gray-400 text-lg mb-2">
            Más de{' '}
            <span className="text-white font-bold">500 miembros</span>
            {' '}· Partidas organizadas · Anuncios de torneos
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Coordina, comparte resultados y conoce jugadores de LATAM
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
            style={{ background: '#5865F2', boxShadow: '0 0 20px rgba(88,101,242,0.4)' }}
          >
            Unirse al Discord →
          </a>
        </div>
      </section>

      {/* ── NOSOTROS ────────────────────────────────────────────────────── */}
      <section id="nosotros" className="py-20 px-4 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#FF3D00] text-xs font-bold uppercase tracking-[3px] mb-4">
              Nuestra misión
            </p>
            <h2 className="text-4xl font-black text-white mb-6">
              Impulsamos el esports en LATAM
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Arena Versus nació con un propósito claro: crear la primera plataforma de torneos
              esports verdaderamente accesible para toda Latinoamérica.
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              Creemos que el talento no tiene fronteras. Cada jugador merece la oportunidad de
              competir en un ambiente organizado, justo y emocionante — sin importar desde qué
              país juegue.
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 text-[#FF3D00] font-semibold hover:underline">
              Únete gratis →
            </Link>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, rgba(255,61,0,0.25), rgba(0,0,0,0.4))' }}
            />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-black text-white mb-6">
            ¿Listo para <span className="text-gradient">competir?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">Sin costo. Sin excusas. Solo gaming de alto nivel.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-av-gradient text-white font-bold text-lg hover:opacity-90 transition-opacity"
            style={{ boxShadow: '0 0 30px rgba(255,61,0,0.4)' }}
          >
            ⚡ Crear Mi Cuenta Gratis
          </Link>
          <p className="text-gray-500 text-sm mt-4">🔒 Sin tarjeta de crédito · Siempre gratis · LATAM Esports</p>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Type check**

```powershell
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```powershell
git add app/page.tsx
git commit -m "feat: full landing page redesign with 10 sections and new visual system"
```

---

## Task 7: Clasificacion page — visual update

**Files:**
- Modify: `app/clasificacion/page.tsx`

Changes:
- Add `avatar_url` to profiles query and `PlayerStats` interface
- Show avatar photo (or initial fallback)
- Rank #1 gets `#FF3D00` color, rest stay gray
- Winrate: `#39FF14` for top 3 players (i < 3), white otherwise
- Replace emoji game text with a `GameIcon` size `sm`
- Deeper background colors

- [ ] **Step 1: Replace `app/clasificacion/page.tsx`**

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import GameIcon from '@/components/ui/GameIcon'
import { GAMES_MAP, COUNTRIES_MAP } from '@/utils/constants'

interface PlayerStats {
  id: string
  username: string | null
  full_name: string | null
  country: string | null
  avatar_url: string | null
  tournaments: number
  wins: number
  losses: number
  draws: number
  total: number
  winrate: number
  mainGame: string
}

async function getStandings(): Promise<PlayerStats[]> {
  try {
    const supabase = await createClient()
    const [profilesRes, matchesRes, regsRes] = await Promise.all([
      supabase.from('profiles').select('id, username, full_name, country, avatar_url'),
      supabase.from('match_results').select('player_id, result, tournaments(game)'),
      supabase.from('registrations').select('player_id'),
    ])

    const profiles = profilesRes.data ?? []
    const matches = (matchesRes.data ?? []) as unknown as {
      player_id: string
      result: string
      tournaments: { game: string } | null
    }[]
    const regs = (regsRes.data ?? []) as { player_id: string }[]

    const tournamentCounts: Record<string, number> = {}
    regs.forEach(r => {
      tournamentCounts[r.player_id] = (tournamentCounts[r.player_id] ?? 0) + 1
    })

    const statsMap: Record<string, { wins: number; losses: number; draws: number; games: Record<string, number> }> = {}
    matches.forEach(m => {
      if (!statsMap[m.player_id]) statsMap[m.player_id] = { wins: 0, losses: 0, draws: 0, games: {} }
      const s = statsMap[m.player_id]
      if (m.result === 'win') s.wins++
      else if (m.result === 'loss') s.losses++
      else if (m.result === 'draw') s.draws++
      const game = m.tournaments?.game ?? ''
      if (game) s.games[game] = (s.games[game] ?? 0) + 1
    })

    return (
      profiles as {
        id: string
        username: string | null
        full_name: string | null
        country: string | null
        avatar_url: string | null
      }[]
    )
      .map(p => {
        const s = statsMap[p.id] ?? { wins: 0, losses: 0, draws: 0, games: {} }
        const total = s.wins + s.losses + s.draws
        const winrate = total > 0 ? Math.round((s.wins / total) * 100) : 0
        const mainGame = Object.entries(s.games).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
        return {
          id: p.id,
          username: p.username,
          full_name: p.full_name,
          country: p.country,
          avatar_url: p.avatar_url,
          tournaments: tournamentCounts[p.id] ?? 0,
          wins: s.wins,
          losses: s.losses,
          draws: s.draws,
          total,
          winrate,
          mainGame,
        }
      })
      .sort((a, b) => b.wins - a.wins || b.winrate - a.winrate || b.total - a.total)
  } catch {
    return []
  }
}

export default async function ClasificacionPage() {
  const players = await getStandings()

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-3">Clasificación</h1>
        <p className="text-gray-400">Ranking de jugadores por victorias y winrate</p>
      </div>

      <div className="bg-[#141414] border border-white/[0.07] rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/[0.07] bg-[#0f0f0f] text-gray-500 text-xs font-semibold uppercase tracking-wider">
          <span className="col-span-1">#</span>
          <span className="col-span-4">Jugador</span>
          <span className="col-span-2">Juego</span>
          <span className="col-span-1 text-center">T</span>
          <span className="col-span-1 text-center text-green-400">V</span>
          <span className="col-span-1 text-center text-red-400">D</span>
          <span className="col-span-1 text-center">E</span>
          <span className="col-span-1 text-right">WR</span>
        </div>

        {players.map((player, i) => (
          <div
            key={player.id}
            className="grid grid-cols-12 gap-2 md:gap-4 px-6 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors items-center"
          >
            {/* Rank */}
            <span
              className="col-span-1 font-bold text-sm"
              style={{
                color: i === 0 ? '#FF3D00'
                     : i === 1 ? '#d1d5db'
                     : i === 2 ? '#FF6D00'
                     : '#444',
              }}
            >
              {i + 1}
            </span>

            {/* Player */}
            <div className="col-span-7 md:col-span-4 flex items-center gap-3">
              {player.avatar_url ? (
                <img
                  src={player.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-av-gradient flex items-center justify-center font-bold text-white text-xs shrink-0">
                  {(player.username || '?')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                {player.username ? (
                  <Link
                    href={`/players/${player.username}`}
                    className="font-semibold text-white text-sm hover:text-[#FF3D00] transition-colors truncate block"
                  >
                    {player.username}
                  </Link>
                ) : (
                  <span className="font-semibold text-white text-sm truncate block">Jugador</span>
                )}
                {player.country && (
                  <span className="text-gray-500 text-xs">
                    {COUNTRIES_MAP[player.country] ?? player.country}
                  </span>
                )}
              </div>
            </div>

            {/* Main game */}
            <div className="hidden md:flex col-span-2 items-center gap-2">
              {player.mainGame ? (
                <>
                  <GameIcon game={player.mainGame} size="sm" />
                  <span className="text-sm text-gray-400 truncate">
                    {GAMES_MAP[player.mainGame]?.split(' ').slice(1).join(' ') ?? player.mainGame}
                  </span>
                </>
              ) : (
                <span className="text-gray-600">—</span>
              )}
            </div>

            {/* Stats */}
            <span className="hidden md:block col-span-1 text-center text-gray-400 text-sm">
              {player.tournaments}
            </span>
            <span className="hidden md:block col-span-1 text-center text-green-400 font-semibold text-sm">
              {player.wins}
            </span>
            <span className="hidden md:block col-span-1 text-center text-red-400 text-sm">
              {player.losses}
            </span>
            <span className="hidden md:block col-span-1 text-center text-gray-500 text-sm">
              {player.draws}
            </span>

            {/* Winrate */}
            <div className="col-span-4 md:col-span-1 text-right">
              <span
                className="font-bold text-sm"
                style={{
                  color: player.total === 0 ? '#444'
                       : i < 3             ? '#39FF14'
                       : 'white',
                }}
              >
                {player.total === 0 ? '—' : `${player.winrate}%`}
              </span>
            </div>
          </div>
        ))}

        {players.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">🏅</div>
            <p>No hay jugadores aún</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type check**

```powershell
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```powershell
git add app/clasificacion/page.tsx
git commit -m "feat: update clasificacion page with avatar, rank colors and neon winrate"
```

---

## Task 8: Player profile page — vibrant hero and badges

**Files:**
- Modify: `app/players/[username]/page.tsx`

Changes:
- Orange glow `box-shadow` on avatar (both photo and initial versions)
- Profile card background: `#141414` instead of `#1c1c1c`
- Stats cards: `#141414` bg + `hover:border-[#FF3D00]/20` accent
- Match badges: neon green for Victory (`#39FF14`), vivid red for Defeat

- [ ] **Step 1: Replace `app/players/[username]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { GAMES_MAP, COUNTRIES_MAP, formatDate } from '@/utils/constants'
import type { MatchResult, Profile } from '@/lib/types'

interface Props {
  params: Promise<{ username: string }>
}

export default async function PlayerProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user ?? null

  let profileData: Profile | null = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
    profileData = data
  } catch {
    // profile not found
  }
  if (!profileData) notFound()
  const profile = profileData

  const isOwner = user?.id === profile.id

  let matchResults: MatchResult[] = []
  try {
    const { data } = await supabase
      .from('match_results')
      .select('*, tournaments(title, game), opponent:profiles!match_results_opponent_id_fkey(username)')
      .eq('player_id', profile.id)
      .order('played_at', { ascending: false })
    matchResults = (data ?? []) as MatchResult[]
  } catch {
    matchResults = []
  }

  const total   = matchResults.length
  const wins    = matchResults.filter(m => m.result === 'win').length
  const losses  = matchResults.filter(m => m.result === 'loss').length
  const draws   = matchResults.filter(m => m.result === 'draw').length
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
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-8 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="w-20 h-20 rounded-full object-cover shrink-0"
            style={{ boxShadow: '0 0 30px rgba(255,61,0,0.35)' }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full bg-av-gradient flex items-center justify-center font-black text-white text-3xl shrink-0"
            style={{ boxShadow: '0 0 30px rgba(255,61,0,0.4)' }}
          >
            {initial}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-black text-white mb-1">{profile.username}</h1>
            {isOwner && (
              <Link
                href="/dashboard"
                className="shrink-0 text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
              >
                ✏️ Editar perfil
              </Link>
            )}
          </div>
          {profile.full_name && <p className="text-gray-400 mb-2">{profile.full_name}</p>}
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-400">
            {profile.country && (
              <span>🌍 {COUNTRIES_MAP[profile.country] ?? profile.country}</span>
            )}
            {profile.discord_tag && <span>🎮 {profile.discord_tag}</span>}
            {mainGame && (
              <span>{GAMES_MAP[mainGame]?.split(' ').slice(1).join(' ') ?? mainGame}</span>
            )}
          </div>
          {profile.bio && (
            <p className="mt-3 text-gray-300 text-sm max-w-md">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Winrate',   value: `${winrate}%`, icon: '📈' },
          { label: 'Victorias', value: wins,           icon: '✅' },
          { label: 'Derrotas',  value: losses,         icon: '❌' },
          { label: 'Empates',   value: draws,          icon: '🤝' },
          { label: 'Partidas',  value: total,          icon: '🎮' },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="bg-[#141414] border border-white/[0.07] hover:border-[#FF3D00]/20 rounded-xl p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-2xl font-black text-gradient">{value}</div>
            <div className="text-gray-400 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Historial de partidas */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.07]">
          <h2 className="font-bold text-white">Historial de Partidas</h2>
        </div>
        {matchResults.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">🎮</div>
            <p>Sin partidas registradas aún</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {matchResults.map(m => (
              <div key={m.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                <div
                  className="w-16 text-center text-xs font-bold px-2 py-1 rounded-full shrink-0"
                  style={
                    m.result === 'win'
                      ? { background: 'rgba(57,255,20,0.15)', color: '#39FF14' }
                      : m.result === 'loss'
                      ? { background: 'rgba(239,68,68,0.2)', color: '#f87171' }
                      : { background: 'rgba(255,255,255,0.08)', color: '#9ca3af' }
                  }
                >
                  {m.result === 'win' ? 'Victoria' : m.result === 'loss' ? 'Derrota' : 'Empate'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">
                    vs {m.opponent?.username ?? 'Oponente'}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {m.tournaments?.title ?? 'Torneo'}
                    {m.round ? ` · Ronda ${m.round}` : ''}
                    {m.score ? ` · ${m.score}` : ''}
                  </div>
                </div>
                <div className="text-gray-500 text-xs shrink-0">{formatDate(m.played_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/torneos" className="text-sm text-[#FF3D00] hover:underline">
          Ver torneos activos →
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type check**

```powershell
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```powershell
git add app/players/[username]/page.tsx
git commit -m "feat: update player profile with glow effects and vibrant match badges"
```

---

## Final verification

- [ ] **Run full build**

```powershell
npx next build
```

Expected: Build completes with no type errors or missing module errors.

- [ ] **Deploy to production**

```powershell
npx vercel --prod --force
```

Expected: Deployment URL printed. Verify landing page, torneos, clasificacion, and a player profile all look correct.
