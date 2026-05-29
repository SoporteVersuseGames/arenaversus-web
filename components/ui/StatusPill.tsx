import { STATUS_LABELS, STATUS_COLORS } from '@/utils/constants'

export default function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-white/10 text-gray-400'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
