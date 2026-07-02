import type { LucideIcon } from 'lucide-react'
import {
  Apple,
  Banana,
  Candy,
  Cherry,
  Crown,
  Fish,
  Flower2,
  Gem,
  Grape,
  Heart,
  IceCreamBowl,
  Leaf,
  Moon,
  Shell,
  Star,
  Sun,
  Zap,
} from 'lucide-react'

import type { DifficultyConfig, DifficultyId, GameSettings, LevelConfig, TileSymbol } from './types'

export const STORAGE_KEYS = {
  highScore: 'mins-pikachu-connect-high-score',
  highestLevel: 'mins-pikachu-connect-highest-level',
  playerName: 'mins-pikachu-player-name',
  savedGame: 'mins-pikachu-connect-saved-game',
  gameSettings: 'mins-pikachu-game-settings',
} as const

export const DEFAULT_DIFFICULTY_ID: DifficultyId = 'classic'
const PIKACHU_IMAGE_COUNT = 36
const PIKACHU_IMAGE_REPEAT = 4
const BOARD_ROWS = 9
const BOARD_COLS = (PIKACHU_IMAGE_COUNT * PIKACHU_IMAGE_REPEAT) / BOARD_ROWS
const PIKACHU_IMAGE_PATH = '/images/pikachu'

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  difficultyId: DEFAULT_DIFFICULTY_ID,
  musicEnabled: true,
  soundEnabled: true,
  musicVolume: 40,
  soundVolume: 65,
}

const FALLBACK_TILE_ICONS: LucideIcon[] = [
  Apple,
  Banana,
  Cherry,
  Grape,
  Gem,
  Star,
  Heart,
  Sun,
  Moon,
  Leaf,
  Candy,
  Zap,
  Flower2,
  Shell,
  Crown,
  Fish,
  IceCreamBowl,
]

const TILE_PALETTE = [
  { color: '#b91c1c', bg: '#fff1f2', ring: 'rgba(244, 63, 94, 0.45)', glow: 'rgba(244, 63, 94, 0.22)' },
  { color: '#b7791f', bg: '#fef9c3', ring: 'rgba(234, 179, 8, 0.48)', glow: 'rgba(234, 179, 8, 0.24)' },
  { color: '#7e22ce', bg: '#f3e8ff', ring: 'rgba(147, 51, 234, 0.4)', glow: 'rgba(147, 51, 234, 0.2)' },
  { color: '#0f766e', bg: '#ccfbf1', ring: 'rgba(20, 184, 166, 0.45)', glow: 'rgba(20, 184, 166, 0.22)' },
  { color: '#c2410c', bg: '#ffedd5', ring: 'rgba(249, 115, 22, 0.46)', glow: 'rgba(249, 115, 22, 0.24)' },
  { color: '#db2777', bg: '#fce7f3', ring: 'rgba(219, 39, 119, 0.42)', glow: 'rgba(219, 39, 119, 0.2)' },
  { color: '#4338ca', bg: '#e0e7ff', ring: 'rgba(99, 102, 241, 0.42)', glow: 'rgba(99, 102, 241, 0.22)' },
  { color: '#15803d', bg: '#dcfce7', ring: 'rgba(34, 197, 94, 0.45)', glow: 'rgba(34, 197, 94, 0.22)' },
  { color: '#0369a1', bg: '#e0f2fe', ring: 'rgba(14, 165, 233, 0.45)', glow: 'rgba(14, 165, 233, 0.22)' },
  { color: '#92400e', bg: '#fef3c7', ring: 'rgba(217, 119, 6, 0.45)', glow: 'rgba(217, 119, 6, 0.22)' },
]

export const TILE_SYMBOLS: TileSymbol[] = Array.from({ length: PIKACHU_IMAGE_COUNT }, (_, index) => {
  const pieceNumber = index + 1
  const palette = TILE_PALETTE[index % TILE_PALETTE.length]

  return {
    id: `piece-${pieceNumber}`,
    label: `Piece ${pieceNumber}`,
    Icon: FALLBACK_TILE_ICONS[index % FALLBACK_TILE_ICONS.length],
    imageSrc: `${PIKACHU_IMAGE_PATH}/pieces${pieceNumber}.png`,
    ...palette,
  }
})

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'easy',
    label: 'Dễ',
    rows: BOARD_ROWS,
    cols: BOARD_COLS,
    timeLimit: 420,
    hints: 4,
    shuffles: 20,
    symbolCount: PIKACHU_IMAGE_COUNT,
  },
  {
    id: 'classic',
    label: 'Cổ điển',
    rows: BOARD_ROWS,
    cols: BOARD_COLS,
    timeLimit: 720,
    hints: 3,
    shuffles: 20,
    symbolCount: PIKACHU_IMAGE_COUNT,
  },
  {
    id: 'hard',
    label: 'Khó',
    rows: BOARD_ROWS,
    cols: BOARD_COLS,
    timeLimit: 300,
    hints: 3,
    shuffles: 20,
    symbolCount: PIKACHU_IMAGE_COUNT,
  },
]

export const LEVELS: LevelConfig[] = [
  { level: 1, title: 'Dung yen', shortTitle: 'Dung yen', arrangement: 'none' },
  { level: 2, title: 'Don xuong duoi', shortTitle: 'Don xuong', arrangement: 'down' },
  { level: 3, title: 'Don len tren', shortTitle: 'Don len', arrangement: 'up' },
  { level: 4, title: 'Don sang trai', shortTitle: 'Don trai', arrangement: 'left' },
  { level: 5, title: 'Don sang phai', shortTitle: 'Don phai', arrangement: 'right' },
  { level: 6, title: 'Don vao giua doc', shortTitle: 'Vao giua doc', arrangement: 'center-vertical' },
  { level: 7, title: 'Don ra hai ben doc', shortTitle: 'Ra bien doc', arrangement: 'edges-vertical' },
  { level: 8, title: 'Don vao giua ngang', shortTitle: 'Vao giua ngang', arrangement: 'center-horizontal' },
  { level: 9, title: 'Don ra hai ben ngang', shortTitle: 'Ra bien ngang', arrangement: 'edges-horizontal' },
]

export const symbolById = TILE_SYMBOLS.reduce<Record<string, TileSymbol>>((symbols, symbol) => {
  symbols[symbol.id] = symbol
  return symbols
}, {})

export function getDifficulty(id: DifficultyId) {
  return DIFFICULTIES.find((difficulty) => difficulty.id === id) || DIFFICULTIES[1]
}

export function getLevelConfig(level: number) {
  return LEVELS.find((config) => config.level === level) || LEVELS[0]
}

export function isDifficultyId(value: unknown): value is DifficultyId {
  return DIFFICULTIES.some((difficulty) => difficulty.id === value)
}
