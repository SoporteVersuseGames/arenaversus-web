import { createClient } from '@/lib/supabase/server'
import TournamentCard from '@/components/ui/TournamentCard'
import type { Tournament } from '@/lib/types'

async function getData(): Promise<{ tournaments: Tournament[]; userId: string | null; registeredIds: Set<string> }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null

    const [tournamentsRes, registrationsRes] = await Promise.all([
      supabase.from('tournaments').select('*').order('start_date', { ascending: true }),
      userId
        ? supabase.from('registrations').select('tournament_id').eq('player_id', userId)
        : Promise.resolve({ data: [] as { tournament_id: string }[] }),
    ])

    const registeredIds = new Set<string>(
      (registrationsRes.data ?? []).map((r) => r.tournament_id)
    )

    return { tournaments: tournamentsRes.data ?? [], userId, registeredIds }
  } catch {
    return { tournaments: [], userId: null, registeredIds: new Set() }
  }
}

export default async function TorneosPage() {
  const { tournaments, userId, registeredIds } = await getData()
  const active = tournaments.filter(t => ['open', 'in_progress'].includes(t.status))
  const upcoming = tournaments.filter(t => t.status === 'upcoming')
  const finished = tournaments.filter(t => t.status === 'finished')

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
            {active.map(t => (
              <TournamentCard key={t.id} tournament={t} showBracketLink userId={userId} isRegistered={registeredIds.has(t.id)} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Próximamente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {upcoming.map(t => <TournamentCard key={t.id} tournament={t} userId={userId} />)}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-500 mb-6">Finalizados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-60">
            {finished.map(t => (
              <TournamentCard key={t.id} tournament={t} showBracketLink userId={userId} isRegistered={registeredIds.has(t.id)} />
            ))}
          </div>
        </section>
      )}

      {tournaments.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-lg font-medium">No hay torneos disponibles aún</p>
        </div>
      )}
    </div>
  )
}
