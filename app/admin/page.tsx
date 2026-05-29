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
          <div>
            <label className="block text-gray-400 text-xs mb-1">Nombre</label>
            <input name="name" required placeholder="Copa Valorant LATAM" className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ea3935]/50" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Juego</label>
            <select name="game" required className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ea3935]/50">
              {Object.entries(GAMES_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Máx. Jugadores</label>
            <input name="maxPlayers" type="number" defaultValue={16} min={2} required className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ea3935]/50" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Fecha</label>
            <input name="date" type="date" className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ea3935]/50" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Formato</label>
            <input name="format" placeholder="Eliminación simple" className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ea3935]/50" />
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
