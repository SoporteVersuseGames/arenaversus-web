import Link from 'next/link'
import type { Tournament } from '@/lib/types'
import StatusPill from './StatusPill'
import GameIcon from './GameIcon'
import { formatDate } from '@/utils/constants'
import RegisterButton from './RegisterButton'

interface TournamentCardProps {
  tournament: Tournament
  showBracketLink?: boolean
  userId?: string | null
  isRegistered?: boolean
}

export default function TournamentCard({ tournament, showBracketLink = false, userId, isRegistered = false }: TournamentCardProps) {
  const spotsLeft = tournament.max_players - tournament.current_players
  const pct = Math.min((tournament.current_players / tournament.max_players) * 100, 100)
  const isOpen = tournament.status === 'open'

  return (
    <div className="bg-[#1c1c1c] border border-white/7 rounded-xl p-5 hover:border-[#ea3935]/30 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl"><GameIcon game={tournament.game} /></div>
        <StatusPill status={tournament.status} />
      </div>
      <h3 className="font-bold text-white text-base mb-1 group-hover:text-[#ea3935] transition-colors">
        {tournament.title}
      </h3>
      <p className="text-gray-400 text-sm mb-4">{formatDate(tournament.start_date)}</p>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-400">{tournament.current_players}/{tournament.max_players} jugadores</span>
        <span className={spotsLeft <= 5 ? 'text-[#ea3935] font-semibold' : 'text-gray-400'}>
          {spotsLeft > 0 ? `${spotsLeft} cupos` : 'Lleno'}
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1 mb-4">
        <div className="bg-av-gradient h-1 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="space-y-2">
        {isOpen && (
          <RegisterButton
            tournamentId={tournament.id}
            userId={userId ?? null}
            isRegistered={isRegistered}
            isFull={spotsLeft <= 0}
            currentPlayers={tournament.current_players}
          />
        )}
        {showBracketLink && (
          <Link href={`/torneos/${tournament.id}`} className="block text-center py-2 rounded-lg border border-[#ea3935]/40 text-[#ea3935] text-sm font-medium hover:bg-[#ea3935]/10 transition-all">
            Ver torneo →
          </Link>
        )}
      </div>
    </div>
  )
}
