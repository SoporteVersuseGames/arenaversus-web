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
    const { data } = await supabase.from('profiles').select('*').eq('username', username).single()
    profileData = data
  } catch {
    // profile not found or network error
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
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-av-gradient flex items-center justify-center font-black text-white text-3xl shrink-0">
            {initial}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-black text-white mb-1">{profile.username}</h1>
            {isOwner && (
              <Link href="/dashboard" className="shrink-0 text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
                ✏️ Editar perfil
              </Link>
            )}
          </div>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Winrate', value: `${winrate}%`, icon: '📈' },
          { label: 'Victorias', value: wins, icon: '✅' },
          { label: 'Derrotas', value: losses, icon: '❌' },
          { label: 'Empates', value: draws, icon: '🤝' },
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
                    {m.tournaments?.title ?? 'Torneo'}{m.round ? ` · Ronda ${m.round}` : ''}{m.score ? ` · ${m.score}` : ''}
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
