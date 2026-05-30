import Link from 'next/link'
import type { Tournament } from '@/lib/types'
import StatusPill from './StatusPill'
import { formatDate, toGameKey, GAME_PHOTOS, GAME_COLORS } from '@/utils/constants'
import RegisterButton from './RegisterButton'

interface TournamentCardProps {
  tournament: Tournament
  showBracketLink?: boolean
  userId?: string | null
  isRegistered?: boolean
}

export default function TournamentCard({
  tournament,
  showBracketLink = false,
  userId,
  isRegistered = false,
}: TournamentCardProps) {
  const spotsLeft = tournament.max_players - tournament.current_players
  const pct       = Math.min((tournament.current_players / tournament.max_players) * 100, 100)
  const isOpen    = tournament.status === 'open'

  const key   = toGameKey(tournament.game)
  const photo = GAME_PHOTOS[key]
  const color = GAME_COLORS[key] ?? '#FF3D00'

  return (
    <div
      className="game-card-hover bg-[#141414] border border-white/[0.07] rounded-xl overflow-hidden transition-all group"
      style={{ '--game-color': color } as React.CSSProperties}
    >
      {/* Photo header */}
      <div className="relative h-20 overflow-hidden">
        {photo ? (
          <>
            <img
              src={photo}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              loading="lazy"
            />
            <div className="absolute inset-0" style={{ backgroundColor: color + '73' }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: color + 'aa' }} />
        )}
        <div className="absolute inset-0 flex items-end justify-between px-3 pb-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider drop-shadow">
            {tournament.game}
          </span>
          <StatusPill status={tournament.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-white text-base mb-1 group-hover:text-[#FF3D00] transition-colors">
          {tournament.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4">{formatDate(tournament.start_date)}</p>

        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">
            {tournament.current_players}/{tournament.max_players} jugadores
          </span>
          <span className={spotsLeft <= 5 ? 'text-[#FF3D00] font-semibold' : 'text-gray-400'}>
            {spotsLeft > 0 ? `${spotsLeft} cupos` : 'Lleno'}
          </span>
        </div>

        <div className="w-full bg-white/10 rounded-full h-1 mb-4">
          <div
            className="h-1 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
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
            <Link
              href={`/torneos/${tournament.id}`}
              className="block text-center py-2 rounded-lg border text-sm font-medium transition-all hover:bg-white/5"
              style={{ borderColor: color + '66', color }}
            >
              Ver torneo →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
