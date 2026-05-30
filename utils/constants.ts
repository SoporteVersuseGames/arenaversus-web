export const GAMES_MAP: Record<string, string> = {
  'FC26': '⚽ FC 26',
  'Valorant': '🎯 Valorant',
  'League of Legends': '⚔️ LoL',
  'Fortnite': '🔫 Fortnite',
  'Free Fire': '🔥 Free Fire',
  'PUBG': '🎯 PUBG',
  'Call of Duty': '💥 CoD',
  'Rocket League': '🚀 Rocket League',
  'Street Fighter': '👊 Street Fighter',
  'Tekken': '🥋 Tekken',
  'Clash Royale': '👑 Clash Royale',
  'Mobile Legends': '📱 Mobile Legends',
}

export const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Próximamente',
  open: 'Inscripciones',
  in_progress: 'En Curso',
  finished: 'Finalizado',
}

export const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-500/20 text-blue-400',
  open: 'bg-green-500/20 text-green-400',
  in_progress: 'bg-red-500/20 text-red-400',
  finished: 'bg-white/10 text-gray-400',
}

export const COUNTRIES_MAP: Record<string, string> = {
  AR: '🇦🇷 Argentina', MX: '🇲🇽 México', CO: '🇨🇴 Colombia',
  CL: '🇨🇱 Chile', PE: '🇵🇪 Perú', VE: '🇻🇪 Venezuela',
  EC: '🇪🇨 Ecuador', BO: '🇧🇴 Bolivia', PY: '🇵🇾 Paraguay',
  UY: '🇺🇾 Uruguay', CR: '🇨🇷 Costa Rica', GT: '🇬🇹 Guatemala',
  PA: '🇵🇦 Panamá', DO: '🇩🇴 Rep. Dominicana', ES: '🇪🇸 España',
}

export function getGameIcon(game: string): string {
  return GAMES_MAP[game] ?? `🎮 ${game}`
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Por definir'
  const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}
