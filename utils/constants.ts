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

export const GAME_KEY_MAP: Record<string, string> = {
  'FC26':              'fc26',
  'Valorant':          'valorant',
  'League of Legends': 'lol',
  'Fortnite':          'fortnite',
  'Free Fire':         'free_fire',
  'PUBG':              'pubg',
  'Call of Duty':      'cod',
  'Rocket League':     'rocket_league',
  'Street Fighter':    'street_fighter',
  'Tekken':            'tekken',
  'Clash Royale':      'clash_royale',
  'Mobile Legends':    'mobile_legends',
}

export function toGameKey(game: string): string {
  return GAME_KEY_MAP[game] ?? game.toLowerCase().replace(/\s+/g, '_')
}

export const GAME_COLORS: Record<string, string> = {
  fc26:           '#FF3D00',
  valorant:       '#00E5FF',
  lol:            '#BF00FF',
  fortnite:       '#00CFFF',
  free_fire:      '#FF8C00',
  rocket_league:  '#00B4FF',
  street_fighter: '#DC2626',
  clash_royale:   '#A855F7',
}

export const GAME_PHOTOS: Record<string, string> = {
  fc26:           'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=80',
  valorant:       'https://images.unsplash.com/photo-1542751110-97427bbecfd7?w=600&q=80',
  lol:            'https://images.unsplash.com/photo-1511882150382-421056c89033?w=600&q=80',
  fortnite:       'https://images.unsplash.com/photo-1561883088-039e53143d73?w=600&q=80',
  free_fire:      'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&q=80',
  rocket_league:  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80',
  street_fighter: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
  clash_royale:   'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&q=80',
}

export const GAMES_DISPLAY = [
  { key: 'FC26',              name: 'FC 26',             format: '11 vs 11'      },
  { key: 'Valorant',          name: 'Valorant',          format: '5 vs 5'        },
  { key: 'League of Legends', name: 'League of Legends', format: '5 vs 5'        },
  { key: 'Fortnite',          name: 'Fortnite',          format: 'Battle Royale'  },
  { key: 'Free Fire',         name: 'Free Fire',         format: 'Battle Royale'  },
  { key: 'Rocket League',     name: 'Rocket League',     format: '3 vs 3'        },
  { key: 'Street Fighter',    name: 'Street Fighter',    format: '1 vs 1'        },
  { key: 'Clash Royale',      name: 'Clash Royale',      format: '1 vs 1'        },
] as const
