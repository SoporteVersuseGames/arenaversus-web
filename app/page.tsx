import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TournamentCard from '@/components/ui/TournamentCard'
import type { Tournament } from '@/lib/types'

async function getFeaturedTournaments(): Promise<Tournament[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .in('status', ['open', 'upcoming', 'in_progress'])
      .order('date', { ascending: true })
      .limit(4)
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
