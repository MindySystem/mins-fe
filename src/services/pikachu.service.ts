import api from '@/services/api'

export type SavePikachuGamePayload = {
  player_name: string
  score: number
  level_reached: number
  highest_level: number
  result: 'won' | 'lost'
  time_left: number
  difficulty_id: 'easy' | 'classic' | 'hard'
  is_standalone: boolean
  stats: {
    combo: number
    mistakes: number
    hints_left: number
    shuffles_left: number
    remaining_tiles: number
  }
}

export type PikachuLeaderboardEntry = {
  rank: number
  playerName: string
  score: number
  levelReached: number
  highestLevel: number
  gamesPlayed: number
  playedAt: string | null
}

export const pikachuService = {
  getLeaderboard() {
    return api.get('/pikachu/leaderboard') as Promise<{
      data: PikachuLeaderboardEntry[]
    }>
  },

  saveGame(payload: SavePikachuGamePayload) {
    return api.post('/pikachu/sessions', payload) as Promise<{
      message: string
      data: {
        id: number
        playerName: string
        score: number
        levelReached: number
        highestLevel: number
        result: 'won' | 'lost'
        playedAt: string
      }
    }>
  },
}
