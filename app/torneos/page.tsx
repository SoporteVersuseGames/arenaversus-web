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
    <>
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-black text-white mb-3">Torneos</h1>
        <p className="text-gray-400 text-lg">Encuentra tu próxima competencia en LATAM</p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">

      {active.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-5 rounded-full bg-[#FF3D00]" />
            <h2 className="text-xl font-bold text-white">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#39FF14' }} /> Activos e Inscripciones Abiertas
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {active.map(t => (
              <TournamentCard key={t.id} tournament={t} showBracketLink userId={userId} isRegistered={registeredIds.has(t.id)} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-5 rounded-full bg-[#FF3D00]" />
            <h2 className="text-xl font-bold text-white">Próximamente</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {upcoming.map(t => <TournamentCard key={t.id} tournament={t} userId={userId} />)}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-5 rounded-full bg-white/20" />
            <h2 className="text-xl font-bold text-gray-500">Finalizados</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-60">
            {finished.map(t => (
              <TournamentCard key={t.id} tournament={t} showBracketLink userId={userId} isRegistered={registeredIds.has(t.id)} />
            ))}
          </div>
        </section>
      )}

      {tournaments.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="w-16 h-16 rounded-2xl bg-[#FF3D00]/10 border border-[#FF3D00]/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏆</span>
          </div>
          <p className="text-lg font-medium">No hay torneos disponibles aún</p>
        </div>
      )}
      </div>
    </>
  )
}
