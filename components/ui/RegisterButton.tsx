'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  tournamentId: string
  userId: string | null
  isRegistered: boolean
  isFull: boolean
  currentPlayers: number
}

export default function RegisterButton({ tournamentId, userId, isRegistered, isFull, currentPlayers }: Props) {
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(isRegistered)
  const [players, setPlayers] = useState(currentPlayers)
  const router = useRouter()

  if (!userId) {
    return (
      <a href="/login" className="block w-full text-center py-2 rounded-lg border border-[#ea3935]/40 text-[#ea3935] text-sm font-medium hover:bg-[#ea3935]/10 transition-all">
        Iniciar sesión para inscribirse
      </a>
    )
  }

  async function handleRegister() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: regError } = await supabase
        .from('registrations')
        .insert({ player_id: userId, tournament_id: tournamentId })
      if (regError) return
      await supabase
        .from('tournaments')
        .update({ current_players: players + 1 })
        .eq('id', tournamentId)
      setRegistered(true)
      setPlayers(p => p + 1)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleUnregister() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: delError } = await supabase
        .from('registrations')
        .delete()
        .eq('player_id', userId)
        .eq('tournament_id', tournamentId)
      if (delError) return
      await supabase
        .from('tournaments')
        .update({ current_players: Math.max(0, players - 1) })
        .eq('id', tournamentId)
      setRegistered(false)
      setPlayers(p => Math.max(0, p - 1))
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <button onClick={handleUnregister} disabled={loading}
        className="block w-full text-center py-2 rounded-lg border border-white/20 text-gray-400 text-sm font-medium hover:border-red-500/40 hover:text-red-400 transition-all disabled:opacity-50">
        {loading ? 'Procesando...' : '✓ Inscrito · Salir'}
      </button>
    )
  }

  if (isFull) {
    return (
      <div className="w-full text-center py-2 rounded-lg bg-white/5 text-gray-500 text-sm">
        Torneo lleno
      </div>
    )
  }

  return (
    <button onClick={handleRegister} disabled={loading}
      className="block w-full text-center py-2 rounded-lg bg-av-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
      {loading ? 'Procesando...' : '⚡ Inscribirme'}
    </button>
  )
}
