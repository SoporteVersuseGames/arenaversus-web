import { getGameIcon } from '@/utils/constants'

export default function GameIcon({ game, className = '' }: { game: string; className?: string }) {
  return <span className={className}>{getGameIcon(game)}</span>
}
