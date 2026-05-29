export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  bio: string | null
  discord_tag: string | null
  country: string | null
  updated_at: string | null
}

export interface Tournament {
  id: string
  name: string
  game: string
  status: 'upcoming' | 'open' | 'in_progress' | 'finished'
  max_players: number
  current_players: number
  date: string | null
  format: string | null
}

export interface Registration {
  id: string
  player_id: string
  tournament_id: string
  registered_at: string
  tournaments?: Tournament
}

export interface PlayerGame {
  id: string
  player_id: string
  game_name: string
}
