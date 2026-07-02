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

import type { DifficultyConfig, DifficultyId, GameSettings, LevelConfig, PikachuMode, PikachuModeAsset, TileSymbol } from './types'

export const STORAGE_KEYS = {
  highScore: 'mins-pikachu-connect-high-score',
  highestLevel: 'mins-pikachu-connect-highest-level',
  playerName: 'mins-pikachu-player-name',
  savedGame: 'mins-pikachu-connect-saved-game',
  gameSettings: 'mins-pikachu-game-settings',
  bootstrapCache: 'mins-pikachu-bootstrap-cache',
  offlineScores: 'mins-pikachu-offline-scores',
} as const

export const DEFAULT_DIFFICULTY_ID: DifficultyId = 'classic'
export const DEFAULT_MODE_CODE = 'pikachu-images'
export const PIKACHU_BOOTSTRAP_VERSION = '2026-07-02.1'
export const PIKACHU_ASSET_VERSION = 'pikachu-assets-20260702'
const PIKACHU_IMAGE_COUNT = 36
const PIKACHU_IMAGE_REPEAT = 4
const BOARD_ROWS = 9
const BOARD_COLS = (PIKACHU_IMAGE_COUNT * PIKACHU_IMAGE_REPEAT) / BOARD_ROWS
const PIKACHU_IMAGE_PATH = '/images/pikachu'

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  difficultyId: DEFAULT_DIFFICULTY_ID,
  modeCode: DEFAULT_MODE_CODE,
  musicEnabled: true,
  soundEnabled: true,
  musicVolume: 40,
  soundVolume: 65,
}

const FALLBACK_TILE_ICON_ENTRIES: Array<{ name: string; Icon: LucideIcon }> = [
  { name: 'apple', Icon: Apple },
  { name: 'banana', Icon: Banana },
  { name: 'cherry', Icon: Cherry },
  { name: 'grape', Icon: Grape },
  { name: 'gem', Icon: Gem },
  { name: 'star', Icon: Star },
  { name: 'heart', Icon: Heart },
  { name: 'sun', Icon: Sun },
  { name: 'moon', Icon: Moon },
  { name: 'leaf', Icon: Leaf },
  { name: 'candy', Icon: Candy },
  { name: 'zap', Icon: Zap },
  { name: 'flower', Icon: Flower2 },
  { name: 'shell', Icon: Shell },
  { name: 'crown', Icon: Crown },
  { name: 'fish', Icon: Fish },
  { name: 'ice-cream', Icon: IceCreamBowl },
]

const iconByName = FALLBACK_TILE_ICON_ENTRIES.reduce<Record<string, LucideIcon>>((icons, item) => {
  icons[item.name] = item.Icon
  return icons
}, {})

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

const defaultModeAssets: PikachuModeAsset[] = Array.from({ length: PIKACHU_IMAGE_COUNT }, (_, index) => {
  const pieceNumber = index + 1
  const palette = TILE_PALETTE[index % TILE_PALETTE.length]
  const icon = FALLBACK_TILE_ICON_ENTRIES[index % FALLBACK_TILE_ICON_ENTRIES.length]

  return {
    id: `default-icon-${pieceNumber}`,
    symbolId: `piece-${pieceNumber}`,
    label: `Icon ${pieceNumber}`,
    iconName: icon.name,
    sortOrder: pieceNumber,
    ...palette,
  }
})

const pikachuModeAssets: PikachuModeAsset[] = Array.from({ length: PIKACHU_IMAGE_COUNT }, (_, index) => {
  const pieceNumber = index + 1
  const palette = TILE_PALETTE[index % TILE_PALETTE.length]
  const icon = FALLBACK_TILE_ICON_ENTRIES[index % FALLBACK_TILE_ICON_ENTRIES.length]

  return {
    id: `pikachu-piece-${pieceNumber}`,
    symbolId: `piece-${pieceNumber}`,
    label: `Piece ${pieceNumber}`,
    iconName: icon.name,
    imageSrc: `${PIKACHU_IMAGE_PATH}/pieces${pieceNumber}.png`,
    sortOrder: pieceNumber,
    ...palette,
  }
})

export const DEFAULT_PIKACHU_MODES: PikachuMode[] = [
  {
    id: 'default-icons',
    code: 'default-icons',
    name: 'Default Icons',
    description: 'Bộ icon nhẹ, dùng được ngay cả khi chưa tải ảnh.',
    tileSource: 'icon',
    isDefault: false,
    isEnabled: true,
    version: PIKACHU_BOOTSTRAP_VERSION,
    assets: defaultModeAssets,
  },
  {
    id: 'pikachu-images',
    code: 'pikachu-images',
    name: 'Pikachu Images',
    description: 'Bộ ảnh Pikachu hiện có trong game.',
    tileSource: 'image',
    isDefault: true,
    isEnabled: true,
    version: PIKACHU_BOOTSTRAP_VERSION,
    assets: pikachuModeAssets,
  },
]

export function getModeByCode(modeCode: string, modes: PikachuMode[] = DEFAULT_PIKACHU_MODES) {
  return modes.find((mode) => mode.code === modeCode && mode.isEnabled) || modes.find((mode) => mode.isDefault) || modes[0]
}

export function modeAssetsToTileSymbols(mode: PikachuMode): TileSymbol[] {
  return [...mode.assets]
    .sort((first, second) => first.sortOrder - second.sortOrder)
    .map((asset, index) => {
      const palette = TILE_PALETTE[index % TILE_PALETTE.length]
      const iconEntry = FALLBACK_TILE_ICON_ENTRIES[index % FALLBACK_TILE_ICON_ENTRIES.length]
      const Icon = (asset.iconName && iconByName[asset.iconName]) || iconEntry.Icon

      return {
        id: asset.symbolId,
        label: asset.label,
        Icon,
        imageSrc: mode.tileSource === 'image' ? asset.imageSrc : undefined,
        color: asset.color || palette.color,
        bg: asset.bg || palette.bg,
        ring: asset.ring || palette.ring,
        glow: asset.glow || palette.glow,
      }
    })
}

export function getModeSymbols(modeCode: string, modes: PikachuMode[] = DEFAULT_PIKACHU_MODES) {
  return modeAssetsToTileSymbols(getModeByCode(modeCode, modes))
}

export function symbolsById(symbols: TileSymbol[]) {
  return symbols.reduce<Record<string, TileSymbol>>((lookup, symbol) => {
    lookup[symbol.id] = symbol
    return lookup
  }, {})
}

export const TILE_SYMBOLS: TileSymbol[] = getModeSymbols(DEFAULT_MODE_CODE)

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

export const symbolById = symbolsById(TILE_SYMBOLS)

export function getDifficulty(id: DifficultyId, difficulties: DifficultyConfig[] = DIFFICULTIES) {
  return difficulties.find((difficulty) => difficulty.id === id) || difficulties[1] || DIFFICULTIES[1]
}

export function getLevelConfig(level: number, levels: LevelConfig[] = LEVELS) {
  return levels.find((config) => config.level === level) || levels[0] || LEVELS[0]
}

export function isDifficultyId(value: unknown): value is DifficultyId {
  return DIFFICULTIES.some((difficulty) => difficulty.id === value)
}
