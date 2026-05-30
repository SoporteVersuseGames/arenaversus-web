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
    key: g.key as string,
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
              { value: stats.players > 0 ? `${stats.players}+` : '—', label: 'Jugadores Registrados' },
              { value: stats.tournaments > 0 ? `${stats.tournaments}+` : '—', label: 'Torneos Realizados' },
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
              const gKey  = toGameKey(key as string)
              const photo = GAME_PHOTOS[gKey]
              const color = GAME_COLORS[gKey] ?? '#FF3D00'
              return (
                <Link
                  key={key}
                  href="/torneos"
                  className="game-card-hover relative rounded-xl overflow-hidden border border-white/[0.07] h-[120px] transition-all hover:scale-[1.02] block"
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
                </Link>
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
          <div className="flex justify-center mb-6">
            <svg width="64" height="64" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60.105 4.898A58.55 58.55 0 0 0 45.653.415a.22.22 0 0 0-.233.11 40.784 40.784 0 0 0-1.8 3.697c-5.456-.817-10.886-.817-16.23 0-.485-1.162-1.201-2.587-1.83-3.697a.228.228 0 0 0-.233-.11 58.386 58.386 0 0 0-14.451 4.483.207.207 0 0 0-.095.082C1.578 18.73-.944 32.144.293 45.39a.244.244 0 0 0 .093.167c6.073 4.461 11.955 7.167 17.729 8.962a.23.23 0 0 0 .249-.082 42.08 42.08 0 0 0 3.627-5.9.225.225 0 0 0-.123-.312 38.772 38.772 0 0 1-5.539-2.64.228.228 0 0 1-.022-.378 31.17 31.17 0 0 0 1.1-.862.22.22 0 0 1 .23-.031c11.619 5.304 24.198 5.304 35.68 0a.219.219 0 0 1 .232.028c.356.293.728.586 1.103.865a.228.228 0 0 1-.02.378 36.384 36.384 0 0 1-5.54 2.637.227.227 0 0 0-.121.315 47.249 47.249 0 0 0 3.624 5.897.225.225 0 0 0 .249.084c5.801-1.794 11.684-4.5 17.757-8.961a.228.228 0 0 0 .092-.164c1.48-15.315-2.48-28.618-10.498-40.412a.18.18 0 0 0-.093-.084ZM23.725 37.332c-3.498 0-6.38-3.212-6.38-7.156 0-3.944 2.826-7.156 6.38-7.156 3.582 0 6.437 3.24 6.38 7.156 0 3.944-2.826 7.156-6.38 7.156Zm23.593 0c-3.498 0-6.38-3.212-6.38-7.156 0-3.944 2.825-7.156 6.38-7.156 3.582 0 6.437 3.24 6.38 7.156 0 3.944-2.798 7.156-6.38 7.156Z" fill="#5865F2"/>
            </svg>
          </div>
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
