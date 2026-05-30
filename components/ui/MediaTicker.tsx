'use client'

const TICKER_IMAGES = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=320&q=80',
  'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=320&q=80',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=320&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=320&q=80',
  'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=320&q=80',
  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=320&q=80',
  'https://images.unsplash.com/photo-1511882150382-421056c89033?w=320&q=80',
]

export default function MediaTicker() {
  // Items duplicated so -50% translateX creates a seamless loop
  const items = [...TICKER_IMAGES, ...TICKER_IMAGES]

  return (
    <div className="overflow-hidden">
      <div className="ticker-track flex gap-3 w-max">
        {items.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-40 h-[90px] rounded-lg overflow-hidden relative border border-white/5 hover:border-[#FF3D00]/40 transition-colors"
          >
            <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  )
}
