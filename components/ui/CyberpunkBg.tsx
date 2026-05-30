interface CyberpunkBgProps {
  variant?: 'full' | 'header'
}

export default function CyberpunkBg({ variant = 'full' }: CyberpunkBgProps) {
  const isHeader = variant === 'header'

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Top glow */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '60%',
          background: isHeader
            ? 'radial-gradient(ellipse 90% 80% at 50% -20%, rgba(255,61,0,0.18) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(255,61,0,0.20) 0%, transparent 65%)',
        }}
      />

      {/* Side glows */}
      <div
        className="absolute top-0 left-0 bottom-0 w-1/3"
        style={{
          background: 'radial-gradient(ellipse 100% 60% at -10% 40%, rgba(191,0,255,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-0 right-0 bottom-0 w-1/3"
        style={{
          background: 'radial-gradient(ellipse 100% 60% at 110% 40%, rgba(0,229,255,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Lightning bolts */}
      <svg
        className="cyberpunk-lightning absolute"
        style={{ top: '8%', left: '12%', width: 28, height: 72 }}
        viewBox="0 0 28 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20 0L8 36h10L4 72l28-42H18L20 0z" fill="#FF3D00" />
      </svg>

      <svg
        className="cyberpunk-lightning cyberpunk-lightning-2 absolute"
        style={{ top: '5%', right: '16%', width: 22, height: 56 }}
        viewBox="0 0 22 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16 0L6 28h8L2 56l22-33H14L16 0z" fill="#FF6D00" />
      </svg>

      <svg
        className="cyberpunk-lightning cyberpunk-lightning-3 absolute"
        style={{ top: '12%', left: '60%', width: 18, height: 46 }}
        viewBox="0 0 18 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M13 0L5 23h7L1 46l18-27H12L13 0z" fill="#FF3D00" />
      </svg>

      {/* Perspective grid */}
      <div className="cyberpunk-grid" />

      {/* Scanlines */}
      <div className="cyberpunk-scanlines" />
    </div>
  )
}
