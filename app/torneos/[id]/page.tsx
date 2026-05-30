import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { GAMES_MAP, COUNTRIES_MAP, formatDate } from '@/utils/constants'
import type { Tournament, MatchResult } from '@/lib/types'
import StatusPill from '@/components/ui/StatusPill'
import RegisterButton from '@/components/ui/RegisterButton'

interface Props {
  params: Promise<{ id: string }>
}

interface Participant {
  id: string
  username: string | null
  country: string | null
}

function getRoundLabel(round: number, maxRound: number): string {
  const stepsFromFinal = maxRound - round
  if (stepsFromFinal === 0) return 'Final'
  if (stepsFromFinal === 1) return 'Semifinal'
  if (stepsFromFinal === 2) return 'Cuartos de Final'
  return `Ronda ${round}`
}

export default async function TournamentDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  const { data: tournamentData, error: tournamentError } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (tournamentError?.code !== 'PGRST116' && tournamentError) throw tournamentError
  if (!tournamentData) notFound()

  const t = tournamentData as Tournament & { description: string | null; prize_description: string | null }

  const [{ data: regsData }, { data: resultsData }, { data: myRegData }] = await Promise.all([
    supabase.from('registrations').select('player_id').eq('tournament_id', id),
    supabase
      .from('match_results')
      .select('*, player:profiles!match_results_player_id_fkey(username), opponent:profiles!match_results_opponent_id_fkey(username)')
      .eq('tournament_id', id)
      .eq('result', 'win')
      .order('round', { ascending: true })
      .order('played_at', { ascending: true }),
    userId
      ? supabase.from('registrations').select('id').eq('tournament_id', id).eq('player_id', userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const playerIds: string[] = (regsData ?? []).map((r: { player_id: string }) => r.player_id)
  const { data: profilesData } = playerIds.length > 0
    ? await supabase.from('profiles').select('id, username, country').in('id', playerIds)
    : { data: [] as Participant[] }

  const participants: Participant[] = (profilesData ?? []) as Participant[]
  const allResults = (resultsData ?? []) as unknown as (MatchResult & {
    player: { username: string | null } | null
    opponent: { username: string | null } | null
  })[]
  const isRegistered = !!myRegData

  const spotsLeft = t.max_players - t.current_players
  const pct = Math.min((t.current_players / t.max_players) * 100, 100)

  const bracketMatches = allResults
  const maxRound = bracketMatches.length > 0
    ? Math.max(...bracketMatches.map(m => m.round ?? 1))
    : 0

  const roundsMap = bracketMatches.reduce((acc, m) => {
    const r = m.round ?? 1
    if (!acc[r]) acc[r] = []
    acc[r].push(m)
    return acc
  }, {} as Record<number, typeof bracketMatches>)

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
      <Link href="/torneos" className="text-gray-500 text-sm hover:text-white transition-colors mb-6 inline-block">
        ← Volver a Torneos
      </Link>

      {/* Hero */}
      <div className="bg-[#1c1c1c] border border-white/7 rounded-2xl p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{(GAMES_MAP[t.game] ?? '🎮 ').split(' ')[0]}</div>
          <StatusPill status={t.status} />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">{t.title}</h1>
        {t.description && <p className="text-gray-400 mb-4">{t.description}</p>}
        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
          <span>📅 {formatDate(t.start_date)}</span>
          {t.format && <span>📋 {t.format}</span>}
          <span>🎮 {GAMES_MAP[t.game] ?? t.game}</span>
          {t.prize_description && <span>🏆 {t.prize_description}</span>}
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">{t.current_players}/{t.max_players} jugadores</span>
          <span className={spotsLeft <= 5 ? 'text-[#ea3935] font-semibold' : 'text-gray-400'}>
            {spotsLeft > 0 ? `${spotsLeft} cupos disponibles` : 'Torneo lleno'}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 mb-6">
          <div className="bg-av-gradient h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        {t.status === 'open' && (
          <div className="max-w-xs">
            <RegisterButton
              tournamentId={t.id}
              userId={userId}
              isRegistered={isRegistered}
              isFull={spotsLeft <= 0}
              currentPlayers={t.current_players}
            />
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="bg-[#1c1c1c] border border-white/7 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-white/7">
          <h2 className="font-bold text-white">Participantes ({participants.length})</h2>
        </div>
        {participants.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No hay inscritos aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
            {participants.map(p => {
              const inner = (
                <>
                  <div className="w-7 h-7 rounded-full bg-av-gradient flex items-center justify-center font-bold text-white text-xs shrink-0">
                    {(p.username || '?')[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-white truncate">{p.username ?? 'Jugador'}</span>
                  {p.country && (
                    <span className="text-xs text-gray-500 ml-auto shrink-0">
                      {COUNTRIES_MAP[p.country]?.split(' ')[0] ?? ''}
                    </span>
                  )}
                </>
              )
              return p.username ? (
                <Link key={p.id} href={`/players/${p.username}`}
                  className="flex items-center gap-2 bg-[#111111] rounded-lg px-3 py-2 border border-white/5 hover:border-[#ea3935]/30 transition-all">
                  {inner}
                </Link>
              ) : (
                <div key={p.id} className="flex items-center gap-2 bg-[#111111] rounded-lg px-3 py-2 border border-white/5">
                  {inner}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bracket */}
      <div className="bg-[#1c1c1c] border border-white/7 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/7">
          <h2 className="font-bold text-white">Bracket</h2>
        </div>
        {bracketMatches.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>
              {['upcoming', 'open'].includes(t.status)
                ? 'El bracket se publicará cuando inicie el torneo.'
                : 'No hay resultados registrados aún.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 overflow-x-auto p-4 md:p-6">
            {Object.entries(roundsMap)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([round, matches]) => (
                <div key={round} className="flex-1 min-w-[180px]">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3 px-1">
                    {getRoundLabel(Number(round), maxRound)}
                  </div>
                  <div className="flex flex-col gap-2">
                    {matches.map(m => {
                      const winnerUsername = m.player?.username ?? null
                      const loserUsername = m.opponent?.username ?? null
                      return (
                        <div key={m.id} className="bg-[#111111] border border-white/5 rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-green-400 font-bold text-xs shrink-0">W</span>
                              {winnerUsername ? (
                                <Link href={`/players/${winnerUsername}`} className="text-white text-sm font-medium truncate hover:text-[#ea3935] transition-colors">
                                  {winnerUsername}
                                </Link>
                              ) : (
                                <span className="text-white text-sm font-medium truncate">Jugador</span>
                              )}
                            </div>
                            {m.score && <span className="text-gray-400 text-xs font-mono shrink-0 ml-2">{m.score}</span>}
                          </div>
                          <div className="flex items-center px-3 py-2">
                            <span className="text-red-400 font-bold text-xs shrink-0 mr-2">L</span>
                            {loserUsername ? (
                              <Link href={`/players/${loserUsername}`} className="text-gray-500 text-sm truncate hover:text-[#ea3935] transition-colors">
                                {loserUsername}
                              </Link>
                            ) : (
                              <span className="text-gray-500 text-sm truncate">Oponente</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
