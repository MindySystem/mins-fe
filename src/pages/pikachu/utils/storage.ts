import {
  DEFAULT_GAME_SETTINGS,
  DEFAULT_MODE_CODE,
  DEFAULT_PIKACHU_MODES,
  LEVELS,
  STORAGE_KEYS,
  getDifficulty,
  getModeByCode,
  isDifficultyId,
} from '../constants'
import type {
  Board,
  DifficultyConfig,
  DifficultyId,
  GameSettings,
  LevelConfig,
  OfflinePikachuScore,
  PikachuBootstrapCache,
  PikachuMode,
  SavedGameState,
  Tile,
} from '../types'

function toInteger(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : fallback
}

export function clampPercentage(value: unknown, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(parsed)) return fallback

  return Math.max(0, Math.min(100, Math.round(parsed)))
}

function isSavedBoard(value: unknown): value is Board {
  return (
    Array.isArray(value) &&
    value.every((row) =>
      Array.isArray(row) &&
      row.every(
        (tile) =>
          tile === null ||
          (typeof tile === 'object' &&
            tile !== null &&
            typeof (tile as Tile).id === 'string' &&
            typeof (tile as Tile).symbolId === 'string'),
      ),
    )
  )
}

export function readHighScore() {
  if (typeof window === 'undefined') return 0

  const savedScore = window.localStorage.getItem(STORAGE_KEYS.highScore)
  const parsedScore = savedScore ? Number(savedScore) : 0

  return Number.isFinite(parsedScore) ? parsedScore : 0
}

export function writeHighScore(score: number) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEYS.highScore, String(score))
}

export function readHighestLevel() {
  if (typeof window === 'undefined') return 1

  const savedLevel = window.localStorage.getItem(STORAGE_KEYS.highestLevel)
  const parsedLevel = savedLevel ? Number(savedLevel) : 1

  if (!Number.isFinite(parsedLevel)) return 1

  return Math.max(1, Math.min(LEVELS.length, Math.trunc(parsedLevel)))
}

export function writeHighestLevel(level: number) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEYS.highestLevel, String(level))
}

export function readPlayerName() {
  if (typeof window === 'undefined') return ''

  return (window.localStorage.getItem(STORAGE_KEYS.playerName) || '').trim()
}

export function writePlayerName(playerName: string) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEYS.playerName, playerName.trim())
}

export function readGameSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_GAME_SETTINGS

  const rawSettings = window.localStorage.getItem(STORAGE_KEYS.gameSettings)
  if (!rawSettings) return DEFAULT_GAME_SETTINGS

  try {
    const parsed = JSON.parse(rawSettings) as Partial<GameSettings>

    return {
      difficultyId: isDifficultyId(parsed.difficultyId) ? parsed.difficultyId : DEFAULT_GAME_SETTINGS.difficultyId,
      modeCode: typeof parsed.modeCode === 'string' ? getModeByCode(parsed.modeCode).code : DEFAULT_GAME_SETTINGS.modeCode,
      musicEnabled:
        typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : DEFAULT_GAME_SETTINGS.musicEnabled,
      soundEnabled:
        typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : DEFAULT_GAME_SETTINGS.soundEnabled,
      musicVolume: clampPercentage(parsed.musicVolume, DEFAULT_GAME_SETTINGS.musicVolume),
      soundVolume: clampPercentage(parsed.soundVolume, DEFAULT_GAME_SETTINGS.soundVolume),
    }
  } catch {
    return DEFAULT_GAME_SETTINGS
  }
}

export function writeGameSettings(settings: GameSettings) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEYS.gameSettings, JSON.stringify(settings))
}

export function readSavedGame(): SavedGameState | null {
  if (typeof window === 'undefined') return null

  const savedGame = window.localStorage.getItem(STORAGE_KEYS.savedGame)
  if (!savedGame) return null

  try {
    const parsed = JSON.parse(savedGame) as unknown

    if (typeof parsed !== 'object' || parsed === null) {
      window.localStorage.removeItem(STORAGE_KEYS.savedGame)
      return null
    }

    const draft = parsed as Partial<SavedGameState>

    if (draft.result !== 'playing' || !isDifficultyId(draft.difficultyId) || !isSavedBoard(draft.board)) {
      window.localStorage.removeItem(STORAGE_KEYS.savedGame)
      return null
    }

    const difficulty = getDifficulty(draft.difficultyId)
    const hasExpectedBoardSize =
      draft.board.length === difficulty.rows && draft.board.every((row) => row.length === difficulty.cols)

    if (!hasExpectedBoardSize) {
      window.localStorage.removeItem(STORAGE_KEYS.savedGame)
      return null
    }

    return {
      result: 'playing',
      difficultyId: draft.difficultyId as DifficultyId,
      modeCode: typeof draft.modeCode === 'string' ? getModeByCode(draft.modeCode, DEFAULT_PIKACHU_MODES).code : DEFAULT_MODE_CODE,
      currentLevel: Math.max(1, Math.min(LEVELS.length, toInteger(draft.currentLevel, 1))),
      board: draft.board,
      score: Math.max(0, toInteger(draft.score, 0)),
      combo: Math.max(0, toInteger(draft.combo, 0)),
      mistakes: Math.max(0, toInteger(draft.mistakes, 0)),
      hintsLeft: Math.max(0, toInteger(draft.hintsLeft, difficulty.hints)),
      shufflesLeft: Math.max(0, toInteger(draft.shufflesLeft, difficulty.shuffles)),
      timeLeft: Math.max(0, Math.min(difficulty.timeLimit, toInteger(draft.timeLeft, difficulty.timeLimit))),
      playerName: typeof draft.playerName === 'string' ? draft.playerName : '',
      savedAt: Math.max(0, toInteger(draft.savedAt, Date.now())),
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEYS.savedGame)
    return null
  }
}

export function writeSavedGame(savedGame: SavedGameState) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEYS.savedGame, JSON.stringify(savedGame))
}

export function clearSavedGame() {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(STORAGE_KEYS.savedGame)
}

function readJsonValue<T>(key: string): T | null {
  if (typeof window === 'undefined') return null

  const rawValue = window.localStorage.getItem(key)
  if (!rawValue) return null

  try {
    return JSON.parse(rawValue) as T
  } catch {
    window.localStorage.removeItem(key)
    return null
  }
}

function isPikachuMode(value: unknown): value is PikachuMode {
  if (typeof value !== 'object' || value === null) return false

  const draft = value as Partial<PikachuMode>

  return (
    typeof draft.id === 'string' &&
    typeof draft.code === 'string' &&
    typeof draft.name === 'string' &&
    (draft.tileSource === 'icon' || draft.tileSource === 'image') &&
    typeof draft.isDefault === 'boolean' &&
    typeof draft.isEnabled === 'boolean' &&
    typeof draft.version === 'string' &&
    Array.isArray(draft.assets)
  )
}

function isDifficultyConfig(value: unknown): value is DifficultyConfig {
  if (typeof value !== 'object' || value === null) return false

  const draft = value as Partial<DifficultyConfig>

  return (
    isDifficultyId(draft.id) &&
    typeof draft.label === 'string' &&
    typeof draft.rows === 'number' &&
    typeof draft.cols === 'number' &&
    typeof draft.timeLimit === 'number' &&
    typeof draft.hints === 'number' &&
    typeof draft.shuffles === 'number' &&
    typeof draft.symbolCount === 'number'
  )
}

function isLevelConfig(value: unknown): value is LevelConfig {
  if (typeof value !== 'object' || value === null) return false

  const draft = value as Partial<LevelConfig>

  return (
    typeof draft.level === 'number' &&
    typeof draft.title === 'string' &&
    typeof draft.shortTitle === 'string' &&
    typeof draft.arrangement === 'string'
  )
}

export function readPikachuBootstrapCache(): PikachuBootstrapCache | null {
  const parsed = readJsonValue<Partial<PikachuBootstrapCache>>(STORAGE_KEYS.bootstrapCache)
  if (!parsed) return null

  if (
    typeof parsed.version !== 'string' ||
    typeof parsed.assetVersion !== 'string' ||
    typeof parsed.savedAt !== 'number' ||
    !Array.isArray(parsed.modes) ||
    !Array.isArray(parsed.difficulties) ||
    !Array.isArray(parsed.levels)
  ) {
    window.localStorage.removeItem(STORAGE_KEYS.bootstrapCache)
    return null
  }

  const modes = parsed.modes.filter(isPikachuMode)
  const difficulties = parsed.difficulties.filter(isDifficultyConfig)
  const levels = parsed.levels.filter(isLevelConfig)

  if (modes.length === 0 || difficulties.length === 0 || levels.length === 0) {
    window.localStorage.removeItem(STORAGE_KEYS.bootstrapCache)
    return null
  }

  return {
    version: parsed.version,
    assetVersion: parsed.assetVersion,
    modes,
    difficulties,
    levels,
    savedAt: parsed.savedAt,
  }
}

export function writePikachuBootstrapCache(cache: PikachuBootstrapCache) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEYS.bootstrapCache, JSON.stringify(cache))
}

export function readOfflinePikachuScores<TPayload = unknown>() {
  const parsed = readJsonValue<Array<OfflinePikachuScore<TPayload>>>(STORAGE_KEYS.offlineScores)
  if (!Array.isArray(parsed)) return []

  return parsed.filter(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.clientEventId === 'string' &&
      typeof item.createdAt === 'number' &&
      typeof item.attempts === 'number' &&
      typeof item.payload === 'object' &&
      item.payload !== null,
  )
}

export function writeOfflinePikachuScores<TPayload>(scores: Array<OfflinePikachuScore<TPayload>>) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEYS.offlineScores, JSON.stringify(scores))
}

export function enqueueOfflinePikachuScore<TPayload>(score: OfflinePikachuScore<TPayload>) {
  const scores = readOfflinePikachuScores<TPayload>()
  const nextScores = scores.some((item) => item.clientEventId === score.clientEventId) ? scores : [...scores, score]

  writeOfflinePikachuScores(nextScores)
}

export function removeOfflinePikachuScore(clientEventId: string) {
  const scores = readOfflinePikachuScores()

  writeOfflinePikachuScores(scores.filter((score) => score.clientEventId !== clientEventId))
}
