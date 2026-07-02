import type { LucideIcon } from 'lucide-react'

export type TileSymbol = {
  id: string
  label: string
  Icon: LucideIcon
  imageSrc?: string
  color: string
  bg: string
  ring: string
  glow: string
}

export type Tile = {
  id: string
  symbolId: string
}

export type Board = Array<Array<Tile | null>>

export type Position = {
  row: number
  col: number
}

export type PathPoint = {
  row: number
  col: number
}

export type MatchPair = {
  first: Position
  second: Position
}

export type SearchNode = {
  row: number
  col: number
  direction: number | null
  turns: number
  path: PathPoint[]
}

export type DifficultyConfig = {
  id: 'easy' | 'classic' | 'hard'
  label: string
  rows: number
  cols: number
  timeLimit: number
  hints: number
  shuffles: number
  symbolCount: number
}

export type DifficultyId = DifficultyConfig['id']

export type ArrangementId =
  | 'none'
  | 'down'
  | 'up'
  | 'left'
  | 'right'
  | 'center-vertical'
  | 'edges-vertical'
  | 'center-horizontal'
  | 'edges-horizontal'

export type GameResult = 'playing' | 'won' | 'lost'

export type LevelConfig = {
  level: number
  title: string
  shortTitle: string
  arrangement: ArrangementId
}

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export type SavedGameState = {
  result: 'playing'
  difficultyId: DifficultyId
  currentLevel: number
  board: Board
  score: number
  combo: number
  mistakes: number
  hintsLeft: number
  shufflesLeft: number
  timeLeft: number
  playerName: string
  savedAt: number
}

export type GameSettings = {
  difficultyId: DifficultyId
  musicEnabled: boolean
  soundEnabled: boolean
  musicVolume: number
  soundVolume: number
}

export type ConfirmAction = { type: 'restart'; autoStart: boolean } | { type: 'reload' } | { type: 'shuffle' }

export type SettingsTab = 'audio' | 'app'

export type SoundEffect = 'select' | 'match' | 'shuffle' | 'action' | 'failNew'
