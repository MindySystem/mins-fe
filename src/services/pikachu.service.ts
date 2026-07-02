import api from '@/services/api'
import type { DifficultyConfig, LevelConfig, PikachuMode } from '@/pages/pikachu/types'

export type SavePikachuGamePayload = {
  client_event_id?: string
  player_name: string
  score: number
  level_reached: number
  highest_level: number
  result: 'won' | 'lost'
  time_left: number
  difficulty_id: 'easy' | 'classic' | 'hard'
  mode_code?: string
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

export type PikachuBootstrapResponse = {
  version: string
  assetVersion: string
  modes: PikachuMode[]
  difficulties: DifficultyConfig[]
  levels: LevelConfig[]
  leaderboard: PikachuLeaderboardEntry[]
}

export type PikachuAdminDifficulty = DifficultyConfig & {
  isEnabled: boolean
  sortOrder: number
}

export type PikachuAdminLevel = LevelConfig & {
  isEnabled: boolean
  sortOrder: number
}

export type PikachuAdminConfigResponse = Omit<PikachuBootstrapResponse, 'leaderboard' | 'difficulties' | 'levels'> & {
  stats: {
    modes: number
    enabledModes: number
    scores: number
    offlineSyncedScores: number
  }
  difficulties: PikachuAdminDifficulty[]
  levels: PikachuAdminLevel[]
}

export type SavePikachuGameResponse = {
  message: string
  data: {
    id: number
    clientEventId: string | null
    playerName: string
    score: number
    levelReached: number
    highestLevel: number
    result: 'won' | 'lost'
    difficultyId: string
    modeCode: string | null
    playedAt: string
  }
}

export type PikachuModePayload = {
  code: string
  name: string
  description?: string | null
  tileSource: 'icon' | 'image'
  isDefault?: boolean
  isEnabled?: boolean
  sortOrder?: number
  version?: string
}

export type PikachuModeAssetPayload = {
  symbolId: string
  label: string
  imageSrc?: string | null
  iconName?: string | null
  color?: string | null
  bg?: string | null
  ring?: string | null
  glow?: string | null
  sortOrder?: number
}

export type PikachuDifficultyPayload = Partial<Omit<DifficultyConfig, 'id'>> & {
  isEnabled?: boolean
  sortOrder?: number
}

export type PikachuLevelPayload = Partial<LevelConfig> & {
  isEnabled?: boolean
  sortOrder?: number
}

export const pikachuService = {
  getBootstrap() {
    return api.get('/pikachu/bootstrap') as Promise<PikachuBootstrapResponse>
  },

  getLeaderboard() {
    return api.get('/pikachu/leaderboard') as Promise<{
      data: PikachuLeaderboardEntry[]
    }>
  },

  saveGame(payload: SavePikachuGamePayload) {
    return api.post('/pikachu/sessions', payload) as Promise<SavePikachuGameResponse>
  },

  getAdminConfig() {
    return api.get('/admin/pikachu') as Promise<PikachuAdminConfigResponse>
  },

  createMode(payload: PikachuModePayload) {
    return api.post('/admin/pikachu/modes', payload) as Promise<{ message: string; data: PikachuMode }>
  },

  updateMode(modeId: string, payload: PikachuModePayload) {
    return api.put(`/admin/pikachu/modes/${modeId}`, payload) as Promise<{ message: string; data: PikachuMode }>
  },

  deleteMode(modeId: string) {
    return api.delete(`/admin/pikachu/modes/${modeId}`) as Promise<{ message: string }>
  },

  createAsset(modeId: string, payload: PikachuModeAssetPayload) {
    return api.post(`/admin/pikachu/modes/${modeId}/assets`, payload) as Promise<{
      message: string
      data: PikachuMode['assets'][number]
    }>
  },

  updateAsset(modeId: string, assetId: string, payload: PikachuModeAssetPayload) {
    return api.put(`/admin/pikachu/modes/${modeId}/assets/${assetId}`, payload) as Promise<{
      message: string
      data: PikachuMode['assets'][number]
    }>
  },

  deleteAsset(modeId: string, assetId: string) {
    return api.delete(`/admin/pikachu/modes/${modeId}/assets/${assetId}`) as Promise<{ message: string }>
  },

  updateDifficulty(difficultyId: string, payload: PikachuDifficultyPayload) {
    return api.patch(`/admin/pikachu/difficulties/${difficultyId}`, payload) as Promise<{
      message: string
      data: DifficultyConfig
    }>
  },

  updateLevel(level: number, payload: PikachuLevelPayload) {
    return api.patch(`/admin/pikachu/levels/${level}`, payload) as Promise<{
      message: string
      data: LevelConfig
    }>
  },
}
