'use client'

import { useState } from 'react'
import GameIcon from './GameIcon'
import { toGameKey, GAME_COLORS, GAME_PHOTOS } from '@/utils/constants'

export type HeroGame = {
  key: string   // DB value: 'FC26', 'Valorant', etc.
  name: string  // display name
  count: number // number of active tournaments for this game
}

interface HeroTabsProps {
  games: HeroGame[]
}

export default function HeroTabs({ games }: HeroTabsProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  const active  = games[activeIdx] ?? games[0]
  const gameKey = toGameKey(active?.key ?? '')
  const photo   = GAME_PHOTOS[gameKey]
  const color   = GAME_COLORS[gameKey] ?? '#FF3D00'

  return (
    <>
      {/* Dynamic background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {photo && (
          <img
            key={photo}
            src={photo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.22, animation: 'fadeIn 0.6s ease' }}
          />
        )}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: `radial-gradient(ellipse 80% 55% at 50% 35%, ${color}28 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80" />
      </div>

      {/* Tab strip — pinned to bottom of hero section */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/70 backdrop-blur-sm">
        <div className="overflow-x-auto relative">
          <div className="flex min-w-max md:min-w-0 md:w-full">
            {games.map((game, idx) => {
              const gKey    = toGameKey(game.key)
              const gColor  = GAME_COLORS[gKey] ?? '#FF3D00'
              const isActive = idx === activeIdx
              return (
                <button
                  key={game.key}
                  onClick={() => setActiveIdx(idx)}
                  className="flex items-center justify-center gap-2 px-4 py-3 relative shrink-0 md:flex-1 transition-opacity"
                  style={{ opacity: isActive ? 1 : 0.45 }}
                >
                  <GameIcon game={game.key} size="sm" />
                  <div className="text-left">
                    <div className="text-white text-xs font-semibold whitespace-nowrap leading-tight">
                      {game.name}
                    </div>
                    <div className="text-gray-400 text-[10px] leading-tight">
                      {game.count} {game.count === 1 ? 'torneo' : 'torneos'}
                    </div>
                  </div>
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: gColor }}
                    />
                  )}
                </button>
              )
            })}
          </div>
          {/* Right fade indicator — visible on mobile, hidden on wider screens */}
          <div
            className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none md:hidden"
            style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.8))' }}
          />
        </div>
      </div>
    </>
  )
}
