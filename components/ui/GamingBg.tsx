interface GamingBgProps {
  variant?: 'full' | 'header'
}

const PARTICLES = [
  { id: 1,  left: 3,  size: 2, dur: 9,  del: 0,   color: 'rgba(255,61,0,0.70)',    drift: 15,  glow: 'rgba(255,61,0,0.5)'   },
  { id: 2,  left: 8,  size: 3, dur: 13, del: 2.1, color: 'rgba(255,255,255,0.50)', drift: -20, glow: 'rgba(255,255,255,0.3)' },
  { id: 3,  left: 15, size: 1, dur: 7,  del: 0.8, color: 'rgba(255,109,0,0.60)',   drift: 10,  glow: 'rgba(255,109,0,0.4)'  },
  { id: 4,  left: 22, size: 4, dur: 15, del: 3.5, color: 'rgba(255,255,255,0.30)', drift: -10, glow: 'rgba(255,255,255,0.2)' },
  { id: 5,  left: 28, size: 2, dur: 10, del: 1.2, color: 'rgba(255,61,0,0.55)',    drift: 25,  glow: 'rgba(255,61,0,0.4)'   },
  { id: 6,  left: 35, size: 3, dur: 8,  del: 4.8, color: 'rgba(0,229,255,0.28)',   drift: -15, glow: 'rgba(0,229,255,0.2)'  },
  { id: 7,  left: 42, size: 1, dur: 12, del: 0.3, color: 'rgba(255,255,255,0.45)', drift: 8,   glow: 'rgba(255,255,255,0.3)' },
  { id: 8,  left: 48, size: 5, dur: 18, del: 6.1, color: 'rgba(255,61,0,0.40)',    drift: -30, glow: 'rgba(255,61,0,0.3)'   },
  { id: 9,  left: 55, size: 2, dur: 9,  del: 2.7, color: 'rgba(255,109,0,0.65)',   drift: 20,  glow: 'rgba(255,109,0,0.4)'  },
  { id: 10, left: 62, size: 3, dur: 11, del: 1.6, color: 'rgba(255,255,255,0.38)', drift: -5,  glow: 'rgba(255,255,255,0.2)' },
  { id: 11, left: 68, size: 1, dur: 7,  del: 5.3, color: 'rgba(255,61,0,0.70)',    drift: 12,  glow: 'rgba(255,61,0,0.5)'   },
  { id: 12, left: 75, size: 4, dur: 14, del: 3.1, color: 'rgba(191,0,255,0.22)',   drift: -20, glow: 'rgba(191,0,255,0.15)' },
  { id: 13, left: 82, size: 2, dur: 10, del: 0.5, color: 'rgba(255,255,255,0.42)', drift: 18,  glow: 'rgba(255,255,255,0.25)'},
  { id: 14, left: 88, size: 3, dur: 16, del: 7.2, color: 'rgba(255,61,0,0.52)',    drift: -12, glow: 'rgba(255,61,0,0.35)'  },
  { id: 15, left: 95, size: 1, dur: 8,  del: 2.3, color: 'rgba(255,109,0,0.58)',   drift: -8,  glow: 'rgba(255,109,0,0.35)' },
  { id: 16, left: 10, size: 2, dur: 11, del: 8.5, color: 'rgba(255,255,255,0.32)', drift: 22,  glow: 'rgba(255,255,255,0.2)' },
  { id: 17, left: 18, size: 3, dur: 13, del: 4.0, color: 'rgba(255,61,0,0.42)',    drift: -25, glow: 'rgba(255,61,0,0.3)'   },
  { id: 18, left: 30, size: 1, dur: 6,  del: 9.1, color: 'rgba(0,229,255,0.22)',   drift: 5,   glow: 'rgba(0,229,255,0.15)' },
  { id: 19, left: 40, size: 4, dur: 17, del: 1.8, color: 'rgba(255,255,255,0.28)', drift: -18, glow: 'rgba(255,255,255,0.15)'},
  { id: 20, left: 52, size: 2, dur: 9,  del: 6.8, color: 'rgba(255,61,0,0.62)',    drift: 30,  glow: 'rgba(255,61,0,0.4)'   },
  { id: 21, left: 60, size: 3, dur: 12, del: 3.6, color: 'rgba(255,109,0,0.45)',   drift: -14, glow: 'rgba(255,109,0,0.3)'  },
  { id: 22, left: 72, size: 1, dur: 8,  del: 5.7, color: 'rgba(255,255,255,0.48)', drift: 6,   glow: 'rgba(255,255,255,0.3)' },
  { id: 23, left: 80, size: 6, dur: 20, del: 0.9, color: 'rgba(255,61,0,0.32)',    drift: -22, glow: 'rgba(255,61,0,0.25)'  },
  { id: 24, left: 90, size: 2, dur: 10, del: 4.4, color: 'rgba(191,0,255,0.18)',   drift: 16,  glow: 'rgba(191,0,255,0.12)' },
  { id: 25, left: 25, size: 3, dur: 14, del: 7.8, color: 'rgba(255,255,255,0.35)', drift: -8,  glow: 'rgba(255,255,255,0.2)' },
  { id: 26, left: 45, size: 1, dur: 7,  del: 2.0, color: 'rgba(255,61,0,0.68)',    drift: 14,  glow: 'rgba(255,61,0,0.45)'  },
  { id: 27, left: 65, size: 2, dur: 11, del: 8.9, color: 'rgba(255,109,0,0.52)',   drift: -28, glow: 'rgba(255,109,0,0.35)' },
  { id: 28, left: 85, size: 3, dur: 15, del: 3.3, color: 'rgba(255,255,255,0.30)', drift: 20,  glow: 'rgba(255,255,255,0.18)'},
]

export default function GamingBg({ variant = 'full' }: GamingBgProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Top center orange glow */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '70%',
          background: variant === 'full'
            ? 'radial-gradient(ellipse 75% 55% at 50% -5%, rgba(255,61,0,0.16) 0%, transparent 65%)'
            : 'radial-gradient(ellipse 90% 80% at 50% -15%, rgba(255,61,0,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Bottom violet tint */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '40%',
          background: 'radial-gradient(ellipse 60% 50% at 50% 110%, rgba(191,0,255,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Side ambient glows */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 40% 60% at -5% 50%, rgba(255,61,0,0.07) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 40% 60% at 105% 50%, rgba(0,180,255,0.05) 0%, transparent 60%)',
        }}
      />

      {/* Particles */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="gaming-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.glow}`,
            animationDuration: `${p.dur}s`,
            animationDelay: `-${p.del}s`,
            '--particle-drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
