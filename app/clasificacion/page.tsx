import { createClient } from '@/lib/supabase/server'
import { COUNTRIES_MAP } from '@/utils/constants'

async function getStandings() {
  try {
    const supabase = await createClient()
    const { data: profiles } = await supabase.from('profiles').select('id, username, full_name, country')
    const { data: regs } = await supabase.from('registrations').select('player_id')

    const counts: Record<string, number> = {}
    regs?.forEach((r: { player_id: string }) => { counts[r.player_id] = (counts[r.player_id] ?? 0) + 1 })

    return (profiles ?? [])
      .map(p => ({ ...p, tournament_count: counts[p.id] ?? 0 }))
      .sort((a, b) => b.tournament_count - a.tournament_count)
  } catch {
    return []
  }
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
