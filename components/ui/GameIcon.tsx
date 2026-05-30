import { toGameKey, GAME_PHOTOS, GAME_COLORS } from '@/utils/constants'

interface GameIconProps {
  game: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES: Record<string, { box: string; text: string }> = {
  sm: { box: 'w-8 h-8',          text: 'text-[10px]' },
  md: { box: 'w-12 h-12',        text: 'text-xs'     },
  lg: { box: 'w-full h-[120px]', text: 'text-base'   },
}

export default function GameIcon({ game, size = 'md', className = '' }: GameIconProps) {
  const key   = toGameKey(game)
  const photo = GAME_PHOTOS[key]
  const color = GAME_COLORS[key] ?? '#FF3D00'
  const { box, text } = SIZES[size]

  if (!photo) {
    return (
      <div
        className={`${box} rounded-lg flex items-center justify-center font-bold text-white ${text} shrink-0 ${className}`}
        style={{ backgroundColor: color }}
      >
        {game.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div className={`${box} relative rounded-lg overflow-hidden shrink-0 ${className}`}>
      <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${color}66, transparent)` }}
      />
    </div>
  )
}
