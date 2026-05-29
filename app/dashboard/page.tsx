'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GAMES_MAP, STATUS_LABELS, STATUS_COLORS, COUNTRIES_MAP, formatDate } from '@/utils/constants'
import type { Profile, Registration, Tournament, MatchResult } from '@/lib/types'

type Panel = 'overview' | 'torneos' | 'perfil' | 'stats'

type RegistrationWithTournament = Registration & { tournaments: Tournament | null }

export default function DashboardPage() {
  const [panel, setPanel] = useState<Panel>('overview')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [registrations, setRegistrations] = useState<RegistrationWithTournament[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveOk, setSaveOk] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const userId = session.user.id
      const [profileRes, torneosRes, statsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('registrations').select('*, tournaments(*)').eq('player_id', userId),
        supabase.from('match_results')
          .select('*, tournaments(name, game), opponent:profiles!match_results_opponent_id_fkey(username)')
          .eq('player_id', userId)
          .order('played_at', { ascending: false }),
      ])
      setProfile(profileRes.data)
      setRegistrations((torneosRes.data ?? []) as RegistrationWithTournament[])
      setMatchResults((statsRes.data ?? []) as MatchResult[])
      setLoading(false)
    }
    init()
  }, [router])

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

  const navItems = [
    { key: 'overview' as Panel, icon: '🏠', label: 'Resumen', badge: undefined },
    { key: 'torneos' as Panel, icon: '🏆', label: 'Mis Torneos', badge: registrations.length },
    { key: 'stats' as Panel, icon: '📈', label: 'Mis Stats', badge: undefined },
    { key: 'perfil' as Panel, icon: '👤', label: 'Editar Perfil', badge: undefined },
  ]

  return (
    <div className="flex min-h-screen pt-16">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

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
            {navItems.map(({ key, icon, label, badge }) => (
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

      <main className="flex-1 md:ml-64 p-6">
        <div className="md:hidden flex items-center gap-3 mb-6">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-2">☰</button>
          <h1 className="font-bold text-white text-lg">
            {panel === 'overview' ? 'Resumen' : panel === 'torneos' ? 'Mis Torneos' : panel === 'stats' ? 'Mis Stats' : 'Editar Perfil'}
          </h1>
        </div>

        {panel === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-white hidden md:block">Hola, <span className="text-gradient">{profile?.username}</span> 👋</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: '🏆', value: registrations.length, label: 'Torneos Inscritos' },
                { icon: '✅', value: registrations.filter(r => r.tournaments?.status === 'finished').length, label: 'Torneos Jugados' },
                { icon: '⏳', value: registrations.filter(r => ['open', 'upcoming', 'in_progress'].includes(r.tournaments?.status ?? '')).length, label: 'Por Jugar' },
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
                    const t = r.tournaments
                    return (
                      <div key={r.id} className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-[#ea3935]/10 flex items-center justify-center">🏆</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{t?.name}</div>
                          <div className="text-gray-500 text-xs">{formatDate(t?.date)}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[t?.status ?? ''] ?? 'bg-white/10 text-gray-400'}`}>
                          {STATUS_LABELS[t?.status ?? ''] ?? t?.status}
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
                <Link href="/torneos" className="inline-block mt-4 px-6 py-2.5 rounded-lg bg-av-gradient text-white text-sm font-semibold">Ver Torneos</Link>
              </div>
            ) : registrations.map(r => {
              const t = r.tournaments
              return (
                <div key={r.id} className="bg-[#1c1c1c] border border-white/7 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-av-gradient flex items-center justify-center text-xl">
                    {(GAMES_MAP[t?.game ?? ''] ?? '🎮').split(' ')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white">{t?.name}</div>
                    <div className="text-gray-400 text-sm">{formatDate(t?.date)} · {t?.current_players}/{t?.max_players}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_COLORS[t?.status ?? ''] ?? 'bg-white/10 text-gray-400'}`}>
                    {STATUS_LABELS[t?.status ?? ''] ?? t?.status}
                  </span>
                  {t && ['open', 'upcoming'].includes(t.status) && (
                    <button onClick={() => handleUnregister(r.id, t.id, t.current_players)}
                      className="text-gray-500 hover:text-[#ea3935] text-xs transition-colors shrink-0">Salir</button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {panel === 'stats' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-white hidden md:block">Mis Stats</h1>
              {profile?.username && (
                <Link href={`/players/${profile.username}`} className="text-sm text-[#ea3935] hover:underline">
                  Ver perfil público →
                </Link>
              )}
            </div>
            {(() => {
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
              return (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { icon: '📈', value: `${winrate}%`, label: 'Winrate' },
                      { icon: '✅', value: wins, label: 'Victorias' },
                      { icon: '❌', value: losses, label: 'Derrotas' },
                      { icon: '🤝', value: draws, label: 'Empates' },
                      { icon: '🎮', value: total, label: 'Partidas' },
                    ].map(({ icon, value, label }) => (
                      <div key={label} className="bg-[#1c1c1c] border border-white/7 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-2">{icon}</div>
                        <div className="text-2xl font-black text-gradient">{value}</div>
                        <div className="text-gray-400 text-xs mt-1">{label}</div>
                      </div>
                    ))}
                  </div>
                  {mainGame && (
                    <div className="bg-[#1c1c1c] border border-white/7 rounded-xl p-4 flex items-center gap-4">
                      <div className="text-3xl">{GAMES_MAP[mainGame]?.split(' ')[0]}</div>
                      <div>
                        <div className="text-xs text-gray-500">Juego principal</div>
                        <div className="font-bold text-white">{GAMES_MAP[mainGame]?.split(' ').slice(1).join(' ') ?? mainGame}</div>
                      </div>
                    </div>
                  )}
                  <div className="bg-[#1c1c1c] border border-white/7 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/7">
                      <h3 className="font-bold text-white">Historial Reciente</h3>
                    </div>
                    {matchResults.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">Sin partidas registradas aún</div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {matchResults.slice(0, 10).map(m => (
                          <div key={m.id} className="px-6 py-3 flex items-center gap-4">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              m.result === 'win' ? 'bg-green-500/20 text-green-400' :
                              m.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                              'bg-white/10 text-gray-400'
                            }`}>
                              {m.result === 'win' ? 'Victoria' : m.result === 'loss' ? 'Derrota' : 'Empate'}
                            </span>
                            <div className="flex-1 min-w-0 text-sm">
                              <span className="text-white">vs {m.opponent?.username ?? 'Oponente'}</span>
                              <span className="text-gray-500 ml-2">{m.tournaments?.name}</span>
                            </div>
                            <span className="text-gray-500 text-xs">{formatDate(m.played_at)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
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
