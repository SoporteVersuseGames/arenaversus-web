'use client'
import { useEffect, useRef } from 'react'

interface StatCardProps { icon: string; value: number; label: string; suffix?: string }

export default function StatCard({ icon, value, label, suffix = '' }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const duration = 1500
    const startTime = performance.now()
    function update(now: number) {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      el!.textContent = Math.round(eased * value) + suffix
      if (progress < 1) requestAnimationFrame(update)
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { requestAnimationFrame(update); observer.disconnect() }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, suffix])

  return (
    <div className="bg-[#1c1c1c] border border-white/7 rounded-xl p-6 text-center">
      <div className="text-3xl mb-3">{icon}</div>
      <div ref={ref} className="text-4xl font-black text-gradient mb-2">0{suffix}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  )
}
