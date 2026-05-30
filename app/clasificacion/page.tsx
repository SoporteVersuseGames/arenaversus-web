import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import GameIcon from '@/components/ui/GameIcon'
import CyberpunkBg from '@/components/ui/CyberpunkBg'
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
    <>
      {/* Cyberpunk page header */}
      <div className="relative overflow-hidden pt-24 pb-14">
        <CyberpunkBg variant="header" />
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <h1 className="text-5xl font-black text-white mb-3">Clasificación</h1>
          <p className="text-gray-400 text-lg">Ranking de jugadores por victorias y winrate</p>
        </div>
      </div>

      {/* Table content */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
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
                     : '#666',
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
    </>
  )
}
