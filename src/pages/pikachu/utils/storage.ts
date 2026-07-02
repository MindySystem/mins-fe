import { DEFAULT_GAME_SETTINGS, LEVELS, STORAGE_KEYS, getDifficulty, isDifficultyId } from '../constants'
import type { Board, DifficultyId, GameSettings, SavedGameState, Tile } from '../types'

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
