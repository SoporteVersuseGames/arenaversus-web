# Arena Versus V2 — Fase 1: Migración Next.js

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar las 7 páginas HTML estáticas de arenaversus.com a Next.js 15 con TypeScript, Tailwind CSS y componentes reutilizables, manteniendo Supabase como backend sin cambios.

**Architecture:** App Router de Next.js 15. Componentes compartidos (Navbar, Footer, UI) viven una sola vez. Supabase se accede via `@supabase/ssr` con clientes separados para server y client components. Middleware protege `/dashboard` y `/admin`.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, @supabase/ssr, next/font/google

---

## Archivos a crear

```
arenaversus-v2/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx
│   ├── torneos/page.tsx
│   ├── clasificacion/page.tsx
│   └── admin/page.tsx
├── components/
│   ├── layout/Navbar.tsx
│   ├── layout/Footer.tsx
│   ├── ui/GameIcon.tsx
│   ├── ui/StatusPill.tsx
│   ├── ui/StatCard.tsx
│   └── ui/TournamentCard.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   └── types.ts
├── utils/constants.ts
├── middleware.ts
└── styles/globals.css
```

---

## Task 1: Inicializar proyecto

**Files:**
- Create: `C:\Users\milo_\OneDrive\Escritorio\ArenaVersus_V2\` (proyecto Next.js)

- [ ] **Step 1: Crear proyecto Next.js 15**

Ejecutar en PowerShell desde `C:\Users\milo_\OneDrive\Escritorio\`:

```powershell
npx create-next-app@latest ArenaVersus_V2 --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

- [ ] **Step 2: Instalar dependencias adicionales**

```powershell
cd "C:\Users\milo_\OneDrive\Escritorio\ArenaVersus_V2"
npm install @supabase/ssr @supabase/supabase-js
```

- [ ] **Step 3: Crear archivo .env.local**

Crear `C:\Users\milo_\OneDrive\Escritorio\ArenaVersus_V2\.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

> Reemplaza con las mismas credenciales que usa la V1 en GitHub.

- [ ] **Step 4: Verificar arranque**

```powershell
npm run dev
```

Abrir http://localhost:3000 — debe mostrar la página por defecto de Next.js.

- [ ] **Step 5: Commit inicial**

```powershell
git add -A
git commit -m "chore: init Next.js 15 + Tailwind + Supabase SSR"
```

---

## Task 2: Tipos, constantes y clientes Supabase

**Files:**
- Create: `lib/types.ts`
- Create: `utils/constants.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Crear lib/types.ts**

```typescript
// lib/types.ts
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
```

- [ ] **Step 2: Crear utils/constants.ts**

```typescript
// utils/constants.ts
export const GAMES_MAP: Record<string, string> = {
  'FC26': '⚽ FC 26',
  'Valorant': '🎯 Valorant',
  'League of Legends': '⚔️ LoL',
  'Fortnite': '🔫 Fortnite',
  'Free Fire': '🔥 Free Fire',
  'PUBG': '🎯 PUBG',
  'Call of Duty': '💥 CoD',
  'Rocket League': '🚀 Rocket League',
  'Street Fighter': '👊 Street Fighter',
  'Tekken': '🥋 Tekken',
  'Clash Royale': '👑 Clash Royale',
  'Mobile Legends': '📱 Mobile Legends',
}

export const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Próximamente',
  open: 'Inscripciones',
  in_progress: 'En Curso',
  finished: 'Finalizado',
}

export const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-500/20 text-blue-400',
  open: 'bg-green-500/20 text-green-400',
  in_progress: 'bg-[#ea3935]/20 text-[#ea3935]',
  finished: 'bg-white/10 text-gray-400',
}

export const COUNTRIES_MAP: Record<string, string> = {
  AR: '🇦🇷 Argentina', MX: '🇲🇽 México', CO: '🇨🇴 Colombia',
  CL: '🇨🇱 Chile', PE: '🇵🇪 Perú', VE: '🇻🇪 Venezuela',
  EC: '🇪🇨 Ecuador', BO: '🇧🇴 Bolivia', PY: '🇵🇾 Paraguay',
  UY: '🇺🇾 Uruguay', CR: '🇨🇷 Costa Rica', GT: '🇬🇹 Guatemala',
  PA: '🇵🇦 Panamá', DO: '🇩🇴 Rep. Dominicana', ES: '🇪🇸 España',
}

export function getGameIcon(game: string): string {
  return GAMES_MAP[game] ?? `🎮 ${game}`
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Por definir'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}
```

- [ ] **Step 3: Crear lib/supabase/client.ts**

```typescript
// lib/supabase/client.ts
'use client'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 4: Crear lib/supabase/server.ts**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 5: Crear middleware.ts**

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/admin')

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
```

- [ ] **Step 6: Verificar compilación TypeScript**

```powershell
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 7: Commit**

```powershell
git add -A
git commit -m "feat: types, constants, supabase clients, middleware"
```

---

## Task 3: Estilos globales y layout

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`
- Create: `app/layout.tsx`

- [ ] **Step 1: Actualizar tailwind.config.ts**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'av-red': '#ea3935',
        'av-orange': '#ec622b',
        'av-black': '#111111',
        'av-black2': '#1c1c1c',
      },
      backgroundImage: {
        'av-gradient': 'linear-gradient(135deg, #ea3935 0%, #ec622b 100%)',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Reemplazar app/globals.css**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --red: #ea3935;
  --orange: #ec622b;
  --gradient: linear-gradient(135deg, #ea3935 0%, #ec622b 100%);
  --black: #111111;
  --black2: #1c1c1c;
  --border: 1px solid rgba(255,255,255,0.07);
  --transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
}

@layer utilities {
  .text-gradient {
    background: var(--gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .border-av { border: var(--border); }
}
```

- [ ] **Step 3: Crear app/layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter_Tight } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const interTight = Inter_Tight({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Arena Versus — Torneos Esports LATAM',
  description: 'La plataforma oficial de torneos esports profesionales en LATAM.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={interTight.className}>
      <body className="bg-[#111111] text-white antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "feat: global styles, tailwind config, root layout"
```

---

## Task 4: Componentes de layout (Navbar y Footer)

**Files:**
- Create: `components/layout/Navbar.tsx`
- Create: `components/layout/Footer.tsx`

- [ ] **Step 1: Crear components/layout/Navbar.tsx**

```tsx
// components/layout/Navbar.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) checkAdmin(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) checkAdmin(session.user.id)
      else setIsAdmin(false)
    })

    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', onScroll) }
  }, [])

  async function checkAdmin(userId: string) {
    const supabase = createClient()
    const { data } = await supabase.from('admins').select('id').eq('user_id', userId).single()
    setIsAdmin(!!data)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#111111]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-av-gradient flex items-center justify-center font-black text-white text-sm">
            AV
          </div>
          <span className="font-bold text-white hidden sm:block">Arena Versus</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {[['Torneos', '/torneos'], ['Clasificación', '/clasificacion'], ['Juegos', '/#juegos'], ['Nosotros', '/#nosotros']].map(([label, href]) => (
            <Link key={href} href={href} className="text-gray-300 hover:text-white transition-colors">{label}</Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && <Link href="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">⚙ Admin</Link>}
              <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-[#1c1c1c] border border-white/10 text-white text-sm hover:border-[#ea3935]/50 transition-all">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition-colors">Salir</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 hover:text-white text-sm transition-colors">Iniciar sesión</Link>
              <Link href="/register" className="px-4 py-2 rounded-lg bg-av-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                Registrarse
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#111111] border-t border-white/10 px-4 py-4 flex flex-col gap-3">
          {[['Torneos', '/torneos'], ['Clasificación', '/clasificacion']].map(([label, href]) => (
            <Link key={href} href={href} className="text-gray-300 py-2 text-sm" onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-300 py-2 text-sm" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="text-left text-[#ea3935] py-2 text-sm">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 py-2 text-sm" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
              <Link href="/register" className="py-2.5 rounded-lg bg-av-gradient text-white text-sm font-semibold text-center" onClick={() => setMenuOpen(false)}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
```

- [ ] **Step 2: Crear components/layout/Footer.tsx**

```tsx
// components/layout/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-white/7 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-av-gradient flex items-center justify-center font-black text-white text-sm">AV</div>
              <span className="font-bold text-white">Arena Versus</span>
            </div>
            <p className="text-gray-400 text-sm">La plataforma oficial de torneos esports para LATAM.</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Plataforma</h4>
            <ul className="space-y-2">
              {[['Torneos', '/torneos'], ['Clasificación', '/clasificacion'], ['Registrarse', '/register']].map(([l, h]) => (
                <li key={h}><Link href={h} className="text-gray-400 hover:text-white text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Comunidad</h4>
            <ul className="space-y-2">
              {[['Discord', '#'], ['Instagram', '#'], ['TikTok', '#'], ['Twitter/X', '#']].map(([l, h]) => (
                <li key={l}><a href={h} className="text-gray-400 hover:text-white text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Empresa</h4>
            <ul className="space-y-2">
              {[['Nosotros', '/#nosotros'], ['Contacto', '/#nosotros']].map(([l, h]) => (
                <li key={l}><Link href={h} className="text-gray-400 hover:text-white text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/7 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <span>© 2026 Arena Versus. Todos los derechos reservados.</span>
          <span>🔒 Sin tarjeta de crédito · Siempre gratis · LATAM Esports</span>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Verificar compilación**

```powershell
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "feat: Navbar and Footer components"
```

---

## Task 5: Componentes UI

**Files:**
- Create: `components/ui/GameIcon.tsx`
- Create: `components/ui/StatusPill.tsx`
- Create: `components/ui/StatCard.tsx`
- Create: `components/ui/TournamentCard.tsx`

- [ ] **Step 1: Crear components/ui/GameIcon.tsx**

```tsx
// components/ui/GameIcon.tsx
import { getGameIcon } from '@/utils/constants'

export default function GameIcon({ game, className = '' }: { game: string; className?: string }) {
  return <span className={className}>{getGameIcon(game)}</span>
}
```

- [ ] **Step 2: Crear components/ui/StatusPill.tsx**

```tsx
// components/ui/StatusPill.tsx
import { STATUS_LABELS, STATUS_COLORS } from '@/utils/constants'

export default function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-white/10 text-gray-400'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
```

- [ ] **Step 3: Crear components/ui/StatCard.tsx**

```tsx
// components/ui/StatCard.tsx
'use client'
import { useEffect, useRef } from 'react'

interface StatCardProps { icon: string; value: number; label: string; suffix?: string }

export default function StatCard({ icon, value, label, suffix = '' }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const duration = 1500
    const startTime = performance.now()
    function update(now: number) {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      el!.textContent = Math.round(eased * value) + suffix
      if (progress < 1) requestAnimationFrame(update)
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { requestAnimationFrame(update); observer.disconnect() }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, suffix])

  return (
    <div className="bg-[#1c1c1c] border border-white/7 rounded-xl p-6 text-center">
      <div className="text-3xl mb-3">{icon}</div>
      <div ref={ref} className="text-4xl font-black text-gradient mb-2">0{suffix}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  )
}
```

- [ ] **Step 4: Crear components/ui/TournamentCard.tsx**

```tsx
// components/ui/TournamentCard.tsx
import Link from 'next/link'
import type { Tournament } from '@/lib/types'
import StatusPill from './StatusPill'
import GameIcon from './GameIcon'
import { formatDate } from '@/utils/constants'

interface TournamentCardProps { tournament: Tournament; showBracketLink?: boolean }

export default function TournamentCard({ tournament, showBracketLink = false }: TournamentCardProps) {
  const spotsLeft = tournament.max_players - tournament.current_players
  const pct = (tournament.current_players / tournament.max_players) * 100

  return (
    <div className="bg-[#1c1c1c] border border-white/7 rounded-xl p-5 hover:border-[#ea3935]/30 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl"><GameIcon game={tournament.game} /></div>
        <StatusPill status={tournament.status} />
      </div>
      <h3 className="font-bold text-white text-base mb-1 group-hover:text-[#ea3935] transition-colors">
        {tournament.name}
      </h3>
      <p className="text-gray-400 text-sm mb-4">{formatDate(tournament.date)}</p>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-400">{tournament.current_players}/{tournament.max_players} jugadores</span>
        <span className={spotsLeft <= 5 ? 'text-[#ea3935] font-semibold' : 'text-gray-400'}>
          {spotsLeft > 0 ? `${spotsLeft} cupos` : 'Lleno'}
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1 mb-4">
        <div className="bg-av-gradient h-1 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      {showBracketLink && (
        <Link href={`/torneos/${tournament.id}`} className="block text-center py-2 rounded-lg border border-[#ea3935]/40 text-[#ea3935] text-sm font-medium hover:bg-[#ea3935]/10 transition-all">
          Ver bracket →
        </Link>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Verificar compilación**

```powershell
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```powershell
git add -A
git commit -m "feat: UI components (GameIcon, StatusPill, StatCard, TournamentCard)"
```

---

## Task 6: Landing page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Reemplazar app/page.tsx**

```tsx
// app/page.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TournamentCard from '@/components/ui/TournamentCard'
import type { Tournament } from '@/lib/types'

async function getFeaturedTournaments(): Promise<Tournament[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tournaments')
    .select('*')
    .in('status', ['open', 'upcoming', 'in_progress'])
    .order('date', { ascending: true })
    .limit(4)
  return data ?? []
}

async function getStats() {
  const supabase = await createClient()
  const [{ count: players }, { count: tournaments }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('tournaments').select('*', { count: 'exact', head: true }),
  ])
  return { players: players ?? 0, tournaments: tournaments ?? 0 }
}

const GAMES = [
  { name: 'FC 26', icon: '⚽', players: '11 vs 11' },
  { name: 'Valorant', icon: '🎯', players: '5 vs 5' },
  { name: 'League of Legends', icon: '⚔️', players: '5 vs 5' },
  { name: 'Fortnite', icon: '🔫', players: 'Battle Royale' },
  { name: 'Free Fire', icon: '🔥', players: 'Battle Royale' },
  { name: 'Rocket League', icon: '🚀', players: '3 vs 3' },
  { name: 'Street Fighter', icon: '👊', players: '1 vs 1' },
  { name: 'Clash Royale', icon: '👑', players: '1 vs 1' },
]

export default async function HomePage() {
  const [featured, stats] = await Promise.all([getFeaturedTournaments(), getStats()])

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ea3935]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#ec622b]/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-[#ea3935]/10 border border-[#ea3935]/30 rounded-full px-4 py-2 text-sm text-[#ea3935] font-medium mb-8">
            <span className="w-2 h-2 bg-[#ea3935] rounded-full animate-pulse" />
            Plataforma Oficial de Torneos LATAM
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
            <Link href="/register" className="px-8 py-4 rounded-xl bg-av-gradient text-white font-bold text-lg hover:opacity-90 transition-opacity">
              ⚡ Empieza Ahora
            </Link>
            <Link href="/torneos" className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-lg hover:border-[#ea3935]/50 hover:bg-white/5 transition-all">
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

      {/* FEATURES */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">¿Por qué Arena Versus?</h2>
            <p className="text-gray-400 text-lg">La Liga que Hace La Diferencia</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🏆', title: 'Compite y Escala', desc: 'Estructura profesional al alcance de cualquier jugador en LATAM. Reglamentos claros, árbitros, resultados verificados.' },
              { icon: '🎮', title: 'Tu Estilo de Juego', desc: 'Torneos para todos los juegos competitivos. FC 26, Valorant, LoL, Fortnite y más. Elige tu arena.' },
              { icon: '⚡', title: 'Resultados en Tiempo Real', desc: 'Brackets actualizados al instante. Sigue el progreso de cada partida y conoce tu siguiente rival.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#1c1c1c] border border-white/7 rounded-xl p-6 hover:border-[#ea3935]/30 transition-all">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED TOURNAMENTS */}
      {featured.length > 0 && (
        <section className="py-20 px-4 bg-[#0d0d0d]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black text-white mb-2">Torneos Destacados</h2>
                <p className="text-gray-400">Inscríbete y compite ahora</p>
              </div>
              <Link href="/torneos" className="text-[#ea3935] hover:underline text-sm font-medium">Ver todos →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map(t => <TournamentCard key={t.id} tournament={t} showBracketLink />)}
            </div>
          </div>
        </section>
      )}

      {/* GAMES */}
      <section id="juegos" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Juegos Soportados</h2>
            <p className="text-gray-400">Compite en tu título favorito</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GAMES.map(({ name, icon, players }) => (
              <div key={name} className="bg-[#1c1c1c] border border-white/7 rounded-xl p-5 text-center hover:border-[#ea3935]/30 transition-all">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="font-semibold text-white text-sm">{name}</div>
                <div className="text-gray-500 text-xs mt-1">{players}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">¿Cómo Funciona?</h2>
            <p className="text-gray-400">En 3 simples pasos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '1', title: 'Crea tu cuenta', desc: 'Regístrate gratis en menos de un minuto. Sin tarjeta de crédito.' },
              { n: '2', title: 'Elige tu torneo', desc: 'Explora los torneos disponibles y encuentra el que encaja con tu juego.' },
              { n: '3', title: 'Compite y gana', desc: 'Sigue el bracket, coordina con rivales y lleva tu gaming al siguiente nivel.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="w-14 h-14 rounded-full bg-av-gradient flex items-center justify-center font-black text-white text-xl mx-auto mb-4">{n}</div>
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-black text-white mb-6">
            ¿Listo para <span className="text-gradient">competir?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">Sin costo. Sin excusas. Solo gaming de alto nivel.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-av-gradient text-white font-bold text-lg hover:opacity-90 transition-opacity">
            ⚡ Crear Mi Cuenta Gratis
          </Link>
          <p className="text-gray-500 text-sm mt-4">🔒 Sin tarjeta de crédito · Siempre gratis · LATAM Esports</p>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Verificar build**

```powershell
npm run build
```

Esperado: build exitoso sin errores.

- [ ] **Step 3: Commit**

```powershell
git add -A
git commit -m "feat: landing page"
```

---

## Task 7: Páginas de autenticación

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/register/page.tsx`

- [ ] **Step 1: Crear app/login/page.tsx**

```tsx
// app/login/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-av-gradient flex items-center justify-center font-black text-white text-lg mx-auto mb-4">AV</div>
          <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
          <p className="text-gray-400 text-sm mt-2">Accede a tu cuenta de Arena Versus</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#1c1c1c] border border-white/7 rounded-xl p-6 space-y-4">
          {error && <div className="bg-[#ea3935]/10 border border-[#ea3935]/30 rounded-lg p-3 text-[#ea3935] text-sm">{error}</div>}
          <div>
            <label className="block text-gray-300 text-sm mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com"
              className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ea3935]/50 transition-colors" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ea3935]/50 transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-av-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-[#ea3935] hover:underline">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Crear app/register/page.tsx**

```tsx
// app/register/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password, options: { data: { username } }
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, username, full_name: '', updated_at: new Date().toISOString()
      })
      router.push('/dashboard'); router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-av-gradient flex items-center justify-center font-black text-white text-lg mx-auto mb-4">AV</div>
          <h1 className="text-2xl font-bold text-white">Crear cuenta gratis</h1>
          <p className="text-gray-400 text-sm mt-2">🔒 Sin tarjeta de crédito · Siempre gratis</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#1c1c1c] border border-white/7 rounded-xl p-6 space-y-4">
          {error && <div className="bg-[#ea3935]/10 border border-[#ea3935]/30 rounded-lg p-3 text-[#ea3935] text-sm">{error}</div>}
          <div>
            <label className="block text-gray-300 text-sm mb-1.5">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} placeholder="GamerPro123"
              className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ea3935]/50 transition-colors" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com"
              className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ea3935]/50 transition-colors" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres"
              className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ea3935]/50 transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-av-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Creando cuenta...' : '⚡ Crear Mi Cuenta Gratis'}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[#ea3935] hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```powershell
git add -A
git commit -m "feat: login and register pages"
```

---

## Task 8: Dashboard

**Files:**
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1: Crear app/dashboard/page.tsx**

```tsx
// app/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GAMES_MAP, STATUS_LABELS, STATUS_COLORS, COUNTRIES_MAP, formatDate } from '@/utils/constants'
import type { Profile, Registration } from '@/lib/types'

type Panel = 'overview' | 'torneos' | 'perfil'

export default function DashboardPage() {
  const [panel, setPanel] = useState<Panel>('overview')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveOk, setSaveOk] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const userId = session.user.id
      const [profileRes, torneosRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('registrations').select('*, tournaments(*)').eq('player_id', userId),
      ])
      setProfile(profileRes.data)
      setRegistrations(torneosRes.data ?? [])
      setLoading(false)
    }
    init()
  }, [])

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const supabase = createClient()
    const fd = new FormData(e.currentTarget)
    const updates = {
      username: fd.get('username') as string,
      full_name: `${fd.get('firstName')} ${fd.get('lastName')}`.trim(),
      bio: fd.get('bio') as string,
      discord_tag: fd.get('discord') as string,
      country: fd.get('country') as string,
      updated_at: new Date().toISOString(),
    }
    await supabase.from('profiles').update(updates).eq('id', profile.id)
    setProfile(prev => prev ? { ...prev, ...updates } : prev)
    setSaving(false); setSaveOk(true)
    setTimeout(() => setSaveOk(false), 3000)
  }

  async function handleUnregister(regId: string, tournamentId: string, currentPlayers: number) {
    const supabase = createClient()
    await supabase.from('registrations').delete().eq('id', regId)
    await supabase.from('tournaments').update({ current_players: Math.max(0, currentPlayers - 1) }).eq('id', tournamentId)
    setRegistrations(prev => prev.filter(r => r.id !== regId))
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/'); router.refresh()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#ea3935] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const initial = (profile?.username || '?')[0].toUpperCase()
  const [firstName = '', ...lastParts] = (profile?.full_name ?? '').split(' ')

  return (
    <div className="flex min-h-screen pt-16">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-[#111111] border-r border-white/7 z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-av-gradient flex items-center justify-center font-bold text-white">{initial}</div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#111111]" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-white text-sm truncate">{profile?.username}</div>
              <div className="text-gray-500 text-xs">Jugador Arena Versus</div>
            </div>
          </div>
          <nav className="space-y-1">
            {([
              { key: 'overview', icon: '🏠', label: 'Resumen' },
              { key: 'torneos', icon: '🏆', label: 'Mis Torneos', badge: registrations.length },
              { key: 'perfil', icon: '👤', label: 'Editar Perfil' },
            ] as const).map(({ key, icon, label, badge }) => (
              <button key={key} onClick={() => { setPanel(key); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${panel === key ? 'bg-[#ea3935]/10 text-[#ea3935] font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <span>{icon}</span>
                <span className="flex-1 text-left">{label}</span>
                {badge !== undefined && badge > 0 && <span className="bg-[#ea3935] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button onClick={handleLogout} className="w-full py-2.5 rounded-lg border border-[#ea3935]/30 text-[#ea3935] text-sm font-medium hover:bg-[#ea3935]/10 transition-all">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 p-6">
        <div className="md:hidden flex items-center gap-3 mb-6">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-2">☰</button>
          <h1 className="font-bold text-white text-lg">{panel === 'overview' ? 'Resumen' : panel === 'torneos' ? 'Mis Torneos' : 'Editar Perfil'}</h1>
        </div>

        {panel === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-white hidden md:block">Hola, <span className="text-gradient">{profile?.username}</span> 👋</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🏆', value: registrations.length, label: 'Torneos Inscritos' },
                { icon: '✅', value: registrations.filter(r => (r.tournaments as any)?.status === 'finished').length, label: 'Torneos Jugados' },
                { icon: '⏳', value: registrations.filter(r => ['open', 'upcoming', 'in_progress'].includes((r.tournaments as any)?.status)).length, label: 'Por Jugar' },
              ].map(({ icon, value, label }) => (
                <div key={label} className="bg-[#1c1c1c] border border-white/7 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-2xl font-black text-gradient">{value}</div>
                  <div className="text-gray-400 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="bg-[#1c1c1c] border border-white/7 rounded-xl p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-av-gradient flex items-center justify-center font-black text-white text-2xl">{initial}</div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Jugador Arena Versus</div>
                <div className="text-2xl font-black text-gradient">{profile?.username}</div>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                  {profile?.country && <span>{COUNTRIES_MAP[profile.country] ?? profile.country}</span>}
                  {profile?.discord_tag && <span>🎮 {profile.discord_tag}</span>}
                </div>
              </div>
            </div>
            {registrations.length > 0 && (
              <div className="bg-[#1c1c1c] border border-white/7 rounded-xl p-5">
                <h3 className="font-bold text-white mb-4">Actividad Reciente</h3>
                <div className="space-y-3">
                  {registrations.slice(0, 3).map(r => {
                    const t = r.tournaments as any
                    return (
                      <div key={r.id} className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-[#ea3935]/10 flex items-center justify-center">🏆</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{t?.name}</div>
                          <div className="text-gray-500 text-xs">{formatDate(t?.date)}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[t?.status] ?? 'bg-white/10 text-gray-400'}`}>
                          {STATUS_LABELS[t?.status] ?? t?.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {panel === 'torneos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-white hidden md:block">Mis Torneos</h1>
              <Link href="/torneos" className="text-sm text-[#ea3935] hover:underline">+ Inscribirme en más</Link>
            </div>
            {registrations.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-[#1c1c1c] border border-white/7 rounded-xl">
                <div className="text-4xl mb-3">🏆</div>
                <p className="font-medium">No estás inscrito en ningún torneo</p>
                <Link href="/torneos" className="inline-block mt-4 px-6 py-2.5 rounded-lg bg-av-gradient text-white text-sm font-semibold">
                  Ver Torneos
                </Link>
              </div>
            ) : registrations.map(r => {
              const t = r.tournaments as any
              return (
                <div key={r.id} className="bg-[#1c1c1c] border border-white/7 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-av-gradient flex items-center justify-center text-xl">
                    {(GAMES_MAP[t?.game] ?? '🎮').split(' ')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white">{t?.name}</div>
                    <div className="text-gray-400 text-sm">{formatDate(t?.date)} · {t?.current_players}/{t?.max_players}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_COLORS[t?.status] ?? 'bg-white/10 text-gray-400'}`}>
                    {STATUS_LABELS[t?.status] ?? t?.status}
                  </span>
                  {['open', 'upcoming'].includes(t?.status) && (
                    <button onClick={() => handleUnregister(r.id, t.id, t.current_players)}
                      className="text-gray-500 hover:text-[#ea3935] text-xs transition-colors shrink-0">Salir</button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {panel === 'perfil' && profile && (
          <div className="max-w-lg">
            <h1 className="text-2xl font-black text-white mb-6 hidden md:block">Editar Perfil</h1>
            <form onSubmit={handleSaveProfile} className="bg-[#1c1c1c] border border-white/7 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1.5">Nombre</label>
                  <input name="firstName" defaultValue={firstName} className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ea3935]/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1.5">Apellido</label>
                  <input name="lastName" defaultValue={lastParts.join(' ')} className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ea3935]/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1.5">Username</label>
                <input name="username" defaultValue={profile.username ?? ''} required className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ea3935]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1.5">País</label>
                <select name="country" defaultValue={profile.country ?? ''} className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ea3935]/50 transition-colors">
                  <option value="">Seleccionar país</option>
                  {Object.entries(COUNTRIES_MAP).map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1.5">Discord</label>
                <input name="discord" defaultValue={profile.discord_tag ?? ''} placeholder="usuario#0000" className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ea3935]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1.5">Bio</label>
                <textarea name="bio" defaultValue={profile.bio ?? ''} rows={3} className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ea3935]/50 transition-colors resize-none" />
              </div>
              <div className="flex items-center gap-4">
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg bg-av-gradient text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
                  {saving ? 'Guardando...' : '💾 Guardar cambios'}
                </button>
                {saveOk && <span className="text-green-400 text-sm">✅ ¡Guardado!</span>}
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add -A
git commit -m "feat: dashboard page"
```

---

## Task 9: Torneos y Clasificación

**Files:**
- Create: `app/torneos/page.tsx`
- Create: `app/clasificacion/page.tsx`

- [ ] **Step 1: Crear app/torneos/page.tsx**

```tsx
// app/torneos/page.tsx
import { createClient } from '@/lib/supabase/server'
import TournamentCard from '@/components/ui/TournamentCard'
import type { Tournament } from '@/lib/types'

async function getTournaments(): Promise<Tournament[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('tournaments').select('*').order('date', { ascending: true })
  return data ?? []
}

export default async function TorneosPage() {
  const all = await getTournaments()
  const active = all.filter(t => ['open', 'in_progress'].includes(t.status))
  const upcoming = all.filter(t => t.status === 'upcoming')
  const finished = all.filter(t => t.status === 'finished')

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-3">Torneos</h1>
        <p className="text-gray-400">Encuentra tu próxima competencia en LATAM</p>
      </div>

      {active.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Activos e Inscripciones Abiertas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {active.map(t => <TournamentCard key={t.id} tournament={t} showBracketLink />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Próximamente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {upcoming.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-500 mb-6">Finalizados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-60">
            {finished.map(t => <TournamentCard key={t.id} tournament={t} showBracketLink />)}
          </div>
        </section>
      )}

      {all.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-lg font-medium">No hay torneos disponibles aún</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Crear app/clasificacion/page.tsx**

```tsx
// app/clasificacion/page.tsx
import { createClient } from '@/lib/supabase/server'
import { COUNTRIES_MAP } from '@/utils/constants'

async function getStandings() {
  const supabase = await createClient()
  const { data: profiles } = await supabase.from('profiles').select('id, username, full_name, country')
  const { data: regs } = await supabase.from('registrations').select('player_id')

  const counts: Record<string, number> = {}
  regs?.forEach(r => { counts[r.player_id] = (counts[r.player_id] ?? 0) + 1 })

  return (profiles ?? [])
    .map(p => ({ ...p, tournament_count: counts[p.id] ?? 0 }))
    .sort((a, b) => b.tournament_count - a.tournament_count)
}

export default async function ClasificacionPage() {
  const players = await getStandings()

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-3">Clasificación</h1>
        <p className="text-gray-400">Ranking de jugadores por participación</p>
      </div>
      <div className="bg-[#1c1c1c] border border-white/7 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/7 text-gray-500 text-xs font-semibold uppercase tracking-wider">
          <span className="col-span-1">#</span>
          <span className="col-span-6">Jugador</span>
          <span className="col-span-3">País</span>
          <span className="col-span-2 text-right">Torneos</span>
        </div>
        {players.map((player, i) => (
          <div key={player.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/3 transition-colors items-center">
            <span className={`col-span-1 font-bold text-sm ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-[#ec622b]' : 'text-gray-500'}`}>
              {i + 1}
            </span>
            <div className="col-span-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-av-gradient flex items-center justify-center font-bold text-white text-xs">
                {(player.username || '?')[0].toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-white text-sm">{player.username ?? 'Jugador'}</div>
                {player.full_name && <div className="text-gray-500 text-xs">{player.full_name}</div>}
              </div>
            </div>
            <span className="col-span-3 text-gray-400 text-sm">
              {player.country ? (COUNTRIES_MAP[player.country] ?? player.country) : '—'}
            </span>
            <span className="col-span-2 text-right font-bold text-white text-sm">{player.tournament_count}</span>
          </div>
        ))}
        {players.length === 0 && (
          <div className="text-center py-16 text-gray-500"><div className="text-4xl mb-3">🏅</div><p>No hay jugadores aún</p></div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```powershell
git add -A
git commit -m "feat: torneos and clasificacion pages"
```

---

## Task 10: Admin

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Crear app/admin/page.tsx**

```tsx
// app/admin/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GAMES_MAP, STATUS_LABELS, STATUS_COLORS, formatDate } from '@/utils/constants'
import type { Tournament } from '@/lib/types'

export default function AdminPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: adminData } = await supabase.from('admins').select('id').eq('user_id', session.user.id).single()
      if (!adminData) { router.push('/'); return }
      loadTournaments()
    }
    init()
  }, [])

  async function loadTournaments() {
    const supabase = createClient()
    const { data } = await supabase.from('tournaments').select('*').order('date', { ascending: true })
    setTournaments(data ?? [])
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setCreating(true)
    const supabase = createClient()
    const fd = new FormData(e.currentTarget)
    await supabase.from('tournaments').insert({
      name: fd.get('name') as string,
      game: fd.get('game') as string,
      max_players: parseInt(fd.get('maxPlayers') as string),
      date: (fd.get('date') as string) || null,
      format: (fd.get('format') as string) || null,
      status: 'upcoming',
      current_players: 0,
    });
    (e.target as HTMLFormElement).reset()
    setCreating(false); loadTournaments()
  }

  async function updateStatus(id: string, status: Tournament['status']) {
    const supabase = createClient()
    await supabase.from('tournaments').update({ status }).eq('id', id)
    setTournaments(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  async function deleteTournament(id: string) {
    if (!confirm('¿Eliminar este torneo?')) return
    const supabase = createClient()
    await supabase.from('tournaments').delete().eq('id', id)
    setTournaments(prev => prev.filter(t => t.id !== id))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#ea3935] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">⚙ Panel de Administración</h1>
        <p className="text-gray-400">Gestión de torneos Arena Versus</p>
      </div>

      <div className="bg-[#1c1c1c] border border-white/7 rounded-xl p-6 mb-8">
        <h2 className="font-bold text-white mb-4">Crear Torneo</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Copa Valorant LATAM', required: true },
            { name: 'maxPlayers', label: 'Máx. Jugadores', type: 'number', placeholder: '16', required: true },
            { name: 'date', label: 'Fecha', type: 'date', placeholder: '', required: false },
            { name: 'format', label: 'Formato', type: 'text', placeholder: 'Eliminación simple', required: false },
          ].map(({ name, label, type, placeholder, required }) => (
            <div key={name}>
              <label className="block text-gray-400 text-xs mb-1">{label}</label>
              <input name={name} type={type} placeholder={placeholder} required={required} defaultValue={type === 'number' ? '16' : undefined}
                className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ea3935]/50" />
            </div>
          ))}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Juego</label>
            <select name="game" required className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ea3935]/50">
              {Object.entries(GAMES_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={creating} className="w-full py-2 rounded-lg bg-av-gradient text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
              {creating ? 'Creando...' : '+ Crear Torneo'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#1c1c1c] border border-white/7 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/7">
          <h2 className="font-bold text-white">Todos los Torneos ({tournaments.length})</h2>
        </div>
        <div className="divide-y divide-white/5">
          {tournaments.map(t => (
            <div key={t.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">{t.name}</div>
                <div className="text-gray-400 text-sm">{GAMES_MAP[t.game] ?? t.game} · {formatDate(t.date)} · {t.current_players}/{t.max_players}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span>
              <select value={t.status} onChange={e => updateStatus(t.id, e.target.value as Tournament['status'])}
                className="bg-[#111111] border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none">
                <option value="upcoming">Próximamente</option>
                <option value="open">Abrir Inscripciones</option>
                <option value="in_progress">Iniciar</option>
                <option value="finished">Finalizar</option>
              </select>
              <button onClick={() => deleteTournament(t.id)} className="text-gray-500 hover:text-[#ea3935] text-xs transition-colors">Eliminar</button>
            </div>
          ))}
          {tournaments.length === 0 && <div className="text-center py-12 text-gray-500">No hay torneos creados aún</div>}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add -A
git commit -m "feat: admin page"
```

---

## Task 11: QA y deploy

- [ ] **Step 1: Build de producción**

```powershell
npm run build
```

Esperado: sin errores. Si hay errores de TypeScript, corregirlos antes de continuar.

- [ ] **Step 2: QA manual — checklist**

Levantar servidor de desarrollo:
```powershell
npm run dev
```

Verificar en http://localhost:3000:

| Página | Verificar |
|---|---|
| `/` | Hero, torneos destacados, juegos, pasos, CTA |
| `/torneos` | Lista agrupada por estado |
| `/clasificacion` | Tabla de jugadores ordenada |
| `/login` | Formulario funciona, redirige a /dashboard |
| `/register` | Crea cuenta, crea perfil en Supabase |
| `/dashboard` | Carga datos del usuario, 3 paneles, logout |
| `/admin` | Solo accesible con usuario admin, CRUD torneos |
| Navbar | Auth condicional, hamburger mobile |
| Footer | Links correctos |

- [ ] **Step 3: Conectar repo a Vercel**

1. Ir a vercel.com → New Project
2. Importar desde GitHub: `SoporteVersuseGames/arenaversus-web` (o crear repo nuevo `arenaversus-v2`)
3. Agregar variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

- [ ] **Step 4: Commit final de Fase 1**

```powershell
git add -A
git commit -m "feat: Fase 1 completa — migración Next.js 15"
```

---

## Spec Coverage Check

| Requisito del spec | Task que lo cubre |
|---|---|
| Next.js 15 + TypeScript + Tailwind | Task 1 |
| @supabase/ssr clientes separados | Task 2 |
| Middleware auth /dashboard y /admin | Task 2 |
| CSS variables V1 conservadas | Task 3 |
| Navbar y Footer únicos | Task 4 |
| GameIcon, StatusPill, StatCard, TournamentCard | Task 5 |
| Landing con todas las secciones de V1 | Task 6 |
| Login y Register funcionales | Task 7 |
| Dashboard con 3 paneles | Task 8 |
| Torneos agrupados por estado | Task 9 |
| Clasificación con ranking | Task 9 |
| Admin CRUD torneos | Task 10 |
| Deploy Vercel | Task 11 |
