import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Apple,
  Banana,
  Candy,
  Cherry,
  Clock3,
  Crown,
  Download,
  Fish,
  Flower2,
  Gem,
  Grape,
  Heart,
  IceCreamBowl,
  Leaf,
  Lightbulb,
  Moon,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Shell,
  Shuffle,
  Star,
  Sun,
  Trophy,
  Zap,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { pikachuService } from '@/services/pikachu.service'

type TileSymbol = {
  id: string
  label: string
  Icon: LucideIcon
  imageSrc?: string
  color: string
  bg: string
  ring: string
  glow: string
}

type Tile = {
  id: string
  symbolId: string
}

type Board = Array<Array<Tile | null>>

type Position = {
  row: number
  col: number
}

type PathPoint = {
  row: number
  col: number
}

type MatchPair = {
  first: Position
  second: Position
}

type SearchNode = {
  row: number
  col: number
  direction: number | null
  turns: number
  path: PathPoint[]
}

type DifficultyConfig = {
  id: 'easy' | 'classic' | 'hard'
  label: string
  rows: number
  cols: number
  timeLimit: number
  hints: number
  shuffles: number
  symbolCount: number
}

type DifficultyId = DifficultyConfig['id']
type ArrangementId =
  | 'none'
  | 'down'
  | 'up'
  | 'left'
  | 'right'
  | 'center-vertical'
  | 'edges-vertical'
  | 'center-horizontal'
  | 'edges-horizontal'
type GameResult = 'playing' | 'won' | 'lost'
type LevelConfig = {
  level: number
  title: string
  shortTitle: string
  arrangement: ArrangementId
}
type GameOverSyncState = 'idle' | 'saving' | 'saved' | 'error'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

const HIGH_SCORE_KEY = 'mins-pikachu-connect-high-score'
const HIGHEST_LEVEL_KEY = 'mins-pikachu-connect-highest-level'
const PLAYER_NAME_KEY = 'mins-pikachu-player-name'
const DEFAULT_DIFFICULTY_ID: DifficultyId = 'classic'
const PIKACHU_IMAGE_COUNT = 36
const PIKACHU_IMAGE_REPEAT = 4
const BOARD_ROWS = 9
const BOARD_COLS = (PIKACHU_IMAGE_COUNT * PIKACHU_IMAGE_REPEAT) / BOARD_ROWS
const PIKACHU_IMAGE_PATH = '/images/pikachu'

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

const TILE_SYMBOLS: TileSymbol[] = Array.from({ length: PIKACHU_IMAGE_COUNT }, (_, index) => {
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

const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'easy',
    label: 'De',
    rows: BOARD_ROWS,
    cols: BOARD_COLS,
    timeLimit: 420,
    hints: 4,
    shuffles: 20,
    symbolCount: PIKACHU_IMAGE_COUNT,
  },
  {
    id: 'classic',
    label: 'Co dien',
    rows: BOARD_ROWS,
    cols: BOARD_COLS,
    timeLimit: 360,
    hints: 3,
    shuffles: 20,
    symbolCount: PIKACHU_IMAGE_COUNT,
  },
  {
    id: 'hard',
    label: 'Kho',
    rows: BOARD_ROWS,
    cols: BOARD_COLS,
    timeLimit: 300,
    hints: 3,
    shuffles: 20,
    symbolCount: PIKACHU_IMAGE_COUNT,
  },
]

const LEVELS: LevelConfig[] = [
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

const DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
] as const

const symbolById = TILE_SYMBOLS.reduce<Record<string, TileSymbol>>((symbols, symbol) => {
  symbols[symbol.id] = symbol
  return symbols
}, {})

function getDifficulty(id: DifficultyId) {
  return DIFFICULTIES.find((difficulty) => difficulty.id === id) || DIFFICULTIES[1]
}

function getLevelConfig(level: number) {
  return LEVELS.find((config) => config.level === level) || LEVELS[0]
}

function shuffleList<T>(source: T[]) {
  const list = [...source]

  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const item = list[index]
    list[index] = list[swapIndex]
    list[swapIndex] = item
  }

  return list
}

function makeEmptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, (): Tile | null => null))
}

function createBoard(config: DifficultyConfig): Board {
  const totalTiles = config.rows * config.cols
  const pairCount = totalTiles / 2
  const symbols = TILE_SYMBOLS.slice(0, config.symbolCount)
  const tiles: Tile[] = []

  for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
    const symbol = symbols[pairIndex % symbols.length]

    tiles.push(
      { id: `${symbol.id}-${pairIndex}-a`, symbolId: symbol.id },
      { id: `${symbol.id}-${pairIndex}-b`, symbolId: symbol.id },
    )
  }

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const board = tilesToBoard(shuffleList(tiles), config.rows, config.cols)

    if (findAvailablePair(board)) {
      return board
    }
  }

  return tilesToBoard(shuffleList(tiles), config.rows, config.cols)
}

function tilesToBoard(tiles: Tile[], rows: number, cols: number): Board {
  const board = makeEmptyBoard(rows, cols)

  tiles.forEach((tile, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols
    board[row][col] = tile
  })

  return board
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

function getBoardSize(board: Board) {
  return {
    rows: board.length,
    cols: board[0]?.length || 0,
  }
}

function getTile(board: Board, position: Position) {
  return board[position.row]?.[position.col] || null
}

function samePosition(first: Position | PathPoint, second: Position | PathPoint) {
  return first.row === second.row && first.col === second.col
}

function isAdjacent(first: Position, second: Position) {
  return Math.abs(first.row - second.row) + Math.abs(first.col - second.col) === 1
}

function getMatchKey(first: Position, second: Position) {
  const firstKey = `${first.row}:${first.col}`
  const secondKey = `${second.row}:${second.col}`

  return firstKey < secondKey ? `${firstKey}|${secondKey}` : `${secondKey}|${firstKey}`
}

function isInsideExtended(row: number, col: number, rows: number, cols: number) {
  return row >= 0 && col >= 0 && row <= rows + 1 && col <= cols + 1
}

function canStep(board: Board, row: number, col: number, start: PathPoint, target: PathPoint) {
  if (samePosition({ row, col }, start) || samePosition({ row, col }, target)) {
    return true
  }

  const { rows, cols } = getBoardSize(board)
  const boardRow = row - 1
  const boardCol = col - 1

  if (boardRow < 0 || boardCol < 0 || boardRow >= rows || boardCol >= cols) {
    return true
  }

  return board[boardRow][boardCol] === null
}

function simplifyPath(path: PathPoint[]) {
  return path.reduce<PathPoint[]>((points, point) => {
    if (points.length < 2) {
      return [...points, point]
    }

    const previous = points[points.length - 1]
    const beforePrevious = points[points.length - 2]
    const sameRow = beforePrevious.row === previous.row && previous.row === point.row
    const sameCol = beforePrevious.col === previous.col && previous.col === point.col

    if (sameRow || sameCol) {
      return [...points.slice(0, -1), point]
    }

    return [...points, point]
  }, [])
}

function findPath(board: Board, first: Position, second: Position): PathPoint[] | null {
  if (samePosition(first, second)) return null

  const firstTile = getTile(board, first)
  const secondTile = getTile(board, second)

  if (!firstTile || !secondTile || firstTile.symbolId !== secondTile.symbolId) {
    return null
  }

  const { rows, cols } = getBoardSize(board)
  const start = { row: first.row + 1, col: first.col + 1 }
  const target = { row: second.row + 1, col: second.col + 1 }

  if (isAdjacent(first, second)) {
    return [start, target]
  }

  const queue: SearchNode[] = [{ ...start, direction: null, turns: 0, path: [start] }]
  const best = new Map<string, number>()
  let queueIndex = 0

  while (queueIndex < queue.length) {
    const node = queue[queueIndex]
    queueIndex += 1

    for (let direction = 0; direction < DIRECTIONS.length; direction += 1) {
      const delta = DIRECTIONS[direction]
      const nextRow = node.row + delta.row
      const nextCol = node.col + delta.col
      const nextTurns = node.direction === null || node.direction === direction ? node.turns : node.turns + 1

      if (nextTurns > 2 || !isInsideExtended(nextRow, nextCol, rows, cols)) {
        continue
      }

      if (!canStep(board, nextRow, nextCol, start, target)) {
        continue
      }

      const key = `${nextRow}:${nextCol}:${direction}`
      const previousTurns = best.get(key)

      if (previousTurns !== undefined && previousTurns <= nextTurns) {
        continue
      }

      const nextPath = [...node.path, { row: nextRow, col: nextCol }]
      best.set(key, nextTurns)

      if (samePosition({ row: nextRow, col: nextCol }, target)) {
        return simplifyPath(nextPath)
      }

      queue.push({
        row: nextRow,
        col: nextCol,
        direction,
        turns: nextTurns,
        path: nextPath,
      })
    }
  }

  return null
}

function countTiles(board: Board) {
  return board.reduce((total, row) => total + row.filter(Boolean).length, 0)
}

function getRemainingTiles(board: Board) {
  const tiles: Tile[] = []

  board.forEach((row) => {
    row.forEach((tile) => {
      if (tile) tiles.push(tile)
    })
  })

  return tiles
}

function findPlayablePairs(board: Board, limit = Infinity): MatchPair[] {
  const buckets = new Map<string, Position[]>()
  const matches: MatchPair[] = []

  board.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (!tile) return

      const bucket = buckets.get(tile.symbolId) || []
      bucket.push({ row: rowIndex, col: colIndex })
      buckets.set(tile.symbolId, bucket)
    })
  })

  for (const positions of buckets.values()) {
    for (let firstIndex = 0; firstIndex < positions.length - 1; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < positions.length; secondIndex += 1) {
        const first = positions[firstIndex]
        const second = positions[secondIndex]
        const path = findPath(board, first, second)

        if (path) {
          matches.push({ first, second })

          if (matches.length >= limit) {
            return matches
          }
        }
      }
    }
  }

  return matches
}

function findAvailablePair(board: Board): MatchPair | null {
  return findPlayablePairs(board, 1)[0] || null
}

function shuffleTileSymbols(board: Board): Board {
  const symbolIds = shuffleList(getRemainingTiles(board).map((tile) => tile.symbolId))
  let symbolIndex = 0

  return board.map((row) =>
    row.map((tile) => {
      if (!tile) return null

      const symbolId = symbolIds[symbolIndex]
      symbolIndex += 1

      return { ...tile, symbolId }
    }),
  )
}

function shuffleSymbolsUntilPlayable(board: Board) {
  let nextBoard = board
  let nextMatch: MatchPair | null = null

  for (let attempt = 0; attempt < 120; attempt += 1) {
    nextBoard = shuffleTileSymbols(board)
    nextMatch = findAvailablePair(nextBoard)

    if (nextMatch || countTiles(nextBoard) === 0) {
      return { board: nextBoard, match: nextMatch }
    }
  }

  return { board: nextBoard, match: nextMatch }
}

function applyArrangement(board: Board, arrangement: ArrangementId): Board {
  if (arrangement === 'none') return cloneBoard(board)

  const { rows, cols } = getBoardSize(board)

  if (
    arrangement === 'left' ||
    arrangement === 'right' ||
    arrangement === 'center-vertical' ||
    arrangement === 'edges-vertical'
  ) {
    return board.map((row) => {
      const tiles = row.filter(Boolean) as Tile[]
      const nextRow = Array.from({ length: cols }, (): Tile | null => null)

      if (arrangement === 'left') {
        tiles.forEach((tile, index) => {
          nextRow[index] = tile
        })

        return nextRow
      }

      if (arrangement === 'right') {
        tiles.forEach((tile, index) => {
          nextRow[cols - tiles.length + index] = tile
        })

        return nextRow
      }

      if (arrangement === 'center-vertical') {
        const startCol = Math.floor((cols - tiles.length) / 2)

        tiles.forEach((tile, index) => {
          nextRow[startCol + index] = tile
        })

        return nextRow
      }

      const leftCount = Math.ceil(tiles.length / 2)
      const rightTiles = tiles.slice(leftCount)

      tiles.slice(0, leftCount).forEach((tile, index) => {
        nextRow[index] = tile
      })

      rightTiles.forEach((tile, index) => {
        nextRow[cols - rightTiles.length + index] = tile
      })

      return nextRow
    })
  }

  const nextBoard = makeEmptyBoard(rows, cols)

  for (let col = 0; col < cols; col += 1) {
    const tiles: Tile[] = []

    for (let row = 0; row < rows; row += 1) {
      const tile = board[row][col]
      if (tile) tiles.push(tile)
    }

    if (arrangement === 'up') {
      tiles.forEach((tile, index) => {
        nextBoard[index][col] = tile
      })

      continue
    }

    if (arrangement === 'down') {
      tiles.forEach((tile, index) => {
        nextBoard[rows - tiles.length + index][col] = tile
      })

      continue
    }

    if (arrangement === 'center-horizontal') {
      const startRow = Math.floor((rows - tiles.length) / 2)

      tiles.forEach((tile, index) => {
        nextBoard[startRow + index][col] = tile
      })

      continue
    }

    const topCount = Math.ceil(tiles.length / 2)
    const bottomTiles = tiles.slice(topCount)

    tiles.slice(0, topCount).forEach((tile, index) => {
      nextBoard[index][col] = tile
    })

    bottomTiles.forEach((tile, index) => {
      nextBoard[rows - bottomTiles.length + index][col] = tile
    })
  }

  return nextBoard
}

function removeTiles(board: Board, first: Position, second: Position): Board {
  const nextBoard = cloneBoard(board)
  nextBoard[first.row][first.col] = null
  nextBoard[second.row][second.col] = null
  return nextBoard
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function getNoPairsStatus(canShuffle: boolean) {
  return canShuffle ? 'Khong con cap nao, hay xao tron lai' : 'Khong con cap nao va da het luot xao'
}

function isStandaloneDisplayMode() {
  if (typeof window === 'undefined') return false

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean
  }

  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
}

function readHighScore() {
  if (typeof window === 'undefined') return 0

  const savedScore = window.localStorage.getItem(HIGH_SCORE_KEY)
  const parsedScore = savedScore ? Number(savedScore) : 0

  return Number.isFinite(parsedScore) ? parsedScore : 0
}

function writeHighScore(score: number) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(HIGH_SCORE_KEY, String(score))
}

function readHighestLevel() {
  if (typeof window === 'undefined') return 1

  const savedLevel = window.localStorage.getItem(HIGHEST_LEVEL_KEY)
  const parsedLevel = savedLevel ? Number(savedLevel) : 1

  if (!Number.isFinite(parsedLevel)) return 1

  return Math.max(1, Math.min(LEVELS.length, Math.trunc(parsedLevel)))
}

function writeHighestLevel(level: number) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(HIGHEST_LEVEL_KEY, String(level))
}

function readPlayerName() {
  if (typeof window === 'undefined') return ''

  return (window.localStorage.getItem(PLAYER_NAME_KEY) || '').trim()
}

function writePlayerName(playerName: string) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(PLAYER_NAME_KEY, playerName.trim())
}

export default function PikachuPage() {
  const defaultDifficulty = getDifficulty(DEFAULT_DIFFICULTY_ID)
  const [difficultyId, setDifficultyId] = useState<DifficultyId>(DEFAULT_DIFFICULTY_ID)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [board, setBoard] = useState(() => createBoard(defaultDifficulty))
  const [selected, setSelected] = useState<Position | null>(null)
  const [hint, setHint] = useState<MatchPair | null>(null)
  const [playerName, setPlayerName] = useState(readPlayerName)
  const [playerNameDraft, setPlayerNameDraft] = useState(readPlayerName)
  const [showPlayerNameDialog, setShowPlayerNameDialog] = useState(() => !readPlayerName())
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(readHighScore)
  const [highestLevel, setHighestLevel] = useState(readHighestLevel)
  const [combo, setCombo] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [hintsLeft, setHintsLeft] = useState(defaultDifficulty.hints)
  const [shufflesLeft, setShufflesLeft] = useState(defaultDifficulty.shuffles)
  const [timeLeft, setTimeLeft] = useState(defaultDifficulty.timeLimit)
  const [hasStarted, setHasStarted] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<GameResult>('playing')
  const [status, setStatus] = useState('Nhan Bat dau de choi')
  const [gameOverSyncState, setGameOverSyncState] = useState<GameOverSyncState>('idle')
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const hasSavedGameOverRef = useRef(false)
  const difficulty = useMemo(() => getDifficulty(difficultyId), [difficultyId])
  const currentLevelConfig = useMemo(() => getLevelConfig(currentLevel), [currentLevel])
  const remainingTiles = useMemo(() => countTiles(board), [board])
  const timeProgress = Math.max(0, Math.min(100, (timeLeft / difficulty.timeLimit) * 100))
  const playablePairs = useMemo(() => findPlayablePairs(board), [board])
  const playablePairCount = playablePairs.length
  const playablePairLookup = useMemo(() => {
    const lookup = new Map<string, MatchPair>()

    playablePairs.forEach((pair) => {
      lookup.set(getMatchKey(pair.first, pair.second), pair)
    })

    return lookup
  }, [playablePairs])
  const needsShuffle = remainingTiles > 0 && playablePairCount === 0
  const canInteract = hasStarted && result === 'playing' && isRunning
  const isPaused = hasStarted && result === 'playing' && !isRunning
  const showStartOverlay = result === 'playing' && !hasStarted
  const showPauseOverlay = isPaused
  const shouldHideBoard = showStartOverlay || showPauseOverlay
  const showPlayerIdentityDialog = showPlayerNameDialog || !playerName

  const resetGame = useCallback((nextDifficultyId = difficultyId, autoStart = hasStarted) => {
    const nextDifficulty = getDifficulty(nextDifficultyId)

    setDifficultyId(nextDifficulty.id)
    setCurrentLevel(1)
    setBoard(createBoard(nextDifficulty))
    setSelected(null)
    setHint(null)
    setScore(0)
    setCombo(0)
    setMistakes(0)
    setHintsLeft(nextDifficulty.hints)
    setShufflesLeft(nextDifficulty.shuffles)
    setTimeLeft(nextDifficulty.timeLimit)
    setHasStarted(autoStart)
    setIsRunning(autoStart)
    setResult('playing')
    setGameOverSyncState('idle')
    hasSavedGameOverRef.current = false
    setStatus(autoStart ? `Màn 1: ${getLevelConfig(1).title}` : 'Nhấn Bắt đầu để chơi')
  }, [difficultyId, hasStarted])

  const handleSavePlayerName = useCallback(() => {
    const nextPlayerName = playerNameDraft.trim()

    if (!nextPlayerName) {
      setStatus('Vui lòng nhập tên người chơi')
      return
    }

    writePlayerName(nextPlayerName)
    setPlayerName(nextPlayerName)
    setPlayerNameDraft(nextPlayerName)
    setShowPlayerNameDialog(false)
    setStatus(hasStarted ? 'Đã cập nhật tên người chơi' : 'Nhấn Bắt đầu để chơi')
  }, [hasStarted, playerNameDraft])

  const handleToggleGameRunning = useCallback(() => {
    if (result !== 'playing') return

    if (!playerName) {
      setShowPlayerNameDialog(true)
      setStatus('Vui lòng nhập tên người chơi')
      return
    }

    if (!hasStarted) {
      setHasStarted(true)
      setIsRunning(true)
      setStatus(`Màn ${currentLevel}: ${currentLevelConfig.title}`)
      return
    }

    if (isRunning) {
      setIsRunning(false)
      setStatus('Tạm Dừng')
      return
    }

    setIsRunning(true)
    setStatus('Tiếp tục chơi')
  }, [currentLevel, currentLevelConfig.title, hasStarted, isRunning, playerName, result])

  const penalize = useCallback((message: string) => {
    setStatus(message)
  }, [])

  const finishSuccessfulMatch = useCallback(
    (first: Position, second: Position) => {
      setSelected(null)
      setHint(null)
      setCombo((currentCombo) => {
        const nextCombo = currentCombo + 1
        const turnBonus = Math.ceil(timeLeft / 30)
        setScore((currentScore) => currentScore + 100 + nextCombo * 15 + turnBonus)
        return nextCombo
      })
      setShufflesLeft((current) => current + 1)

      setBoard((currentBoard) => {
        const arrangedBoard = applyArrangement(removeTiles(currentBoard, first, second), currentLevelConfig.arrangement)
        const remaining = countTiles(arrangedBoard)

        if (remaining === 0) {
          if (currentLevel < LEVELS.length) {
            const nextLevel = currentLevel + 1
            const nextLevelConfig = getLevelConfig(nextLevel)

            setCurrentLevel(nextLevel)
            setSelected(null)
            setHint(null)
            setTimeLeft(difficulty.timeLimit)
            setHintsLeft(difficulty.hints)
            setShufflesLeft(difficulty.shuffles)
            setStatus(`Man ${nextLevel}: ${nextLevelConfig.title}`)

            return createBoard(difficulty)
          }

          setResult('won')
          setIsRunning(false)
          setStatus('Bạn Thật Xuất Sắc')
          return arrangedBoard
        }

        const nextPlayablePairCount = findPlayablePairs(arrangedBoard).length
        setStatus(
          nextPlayablePairCount > 0
            ? `Còn ${nextPlayablePairCount}`
            : getNoPairsStatus(shufflesLeft + 1 > 0),
        )

        return arrangedBoard
      })
    },
    [currentLevel, currentLevelConfig.arrangement, difficulty, shufflesLeft, timeLeft],
  )

  const handleTileClick = useCallback(
    (position: Position) => {
      if (!canInteract) return

      const tile = getTile(board, position)
      if (!tile) return

      setHint(null)

      if (!selected) {
        setSelected(position)
        setStatus(symbolById[tile.symbolId]?.label || 'Đã chọn')
        return
      }

      if (samePosition(selected, position)) {
        setSelected(null)
        setStatus('Bỏ chọn')
        return
      }

      const selectedTile = getTile(board, selected)

      if (!selectedTile) {
        setSelected(position)
        return
      }

      if (selectedTile.symbolId !== tile.symbolId) {
        setSelected(position)
        penalize('Khác Hình')
        return
      }

      const cachedMatch = playablePairLookup.get(getMatchKey(selected, position))

      if (!cachedMatch) {
        setSelected(position)
        penalize(needsShuffle ? 'Cần đổi vị trí' : 'Đã bị chặn')
        return
      }

      finishSuccessfulMatch(selected, position)
    },
    [board, canInteract, finishSuccessfulMatch, needsShuffle, penalize, playablePairLookup, selected],
  )

  const handleHint = useCallback(() => {
    if (!canInteract || hintsLeft <= 0) return

    const match = playablePairs[0]

    if (!match) {
      setStatus(getNoPairsStatus(shufflesLeft > 0))
      return
    }

    setHintsLeft((current) => Math.max(0, current - 1))
    setSelected(match.first)
    setHint(match)
    setStatus('Goi y')
  }, [canInteract, hintsLeft, playablePairs, shufflesLeft])

  const handleShuffle = useCallback(() => {
    if (!canInteract || shufflesLeft <= 0 || remainingTiles <= 0) return

    const shuffled = shuffleSymbolsUntilPlayable(board)
    const nextShufflesLeft = Math.max(0, shufflesLeft - 1)
    const nextPlayablePairCount = shuffled.match ? findPlayablePairs(shuffled.board).length : 0

    setBoard(shuffled.board)
    setSelected(null)
    setHint(null)
    setShufflesLeft((current) => Math.max(0, current - 1))
    setCombo(0)
    setStatus(
      nextPlayablePairCount > 0
        ? `Đã xáo: còn ${nextPlayablePairCount} cấp`
        : getNoPairsStatus(nextShufflesLeft > 0),
    )
  }, [board, canInteract, remainingTiles, shufflesLeft])

  const handleReload = useCallback(() => {
    if (typeof window === 'undefined') return

    window.location.reload()
  }, [])

  const handleInstallApp = useCallback(async () => {
    if (isInstalled) {
      setStatus('Game dang chay o che do app')
      return
    }

    if (!installPrompt) {
      setStatus('Mo menu trinh duyet va chon Add to Home Screen')
      return
    }

    await installPrompt.prompt()

    const choice = await installPrompt.userChoice.catch(() => null)
    setInstallPrompt(null)

    if (choice?.outcome === 'accepted') {
      setStatus('Dang cai dat game')
      return
    }

    setStatus('Ban da dong hop thoai cai dat')
  }, [installPrompt, isInstalled])

  useEffect(() => {
    if (score <= highScore) return

    setHighScore(score)
    writeHighScore(score)
  }, [highScore, score])

  useEffect(() => {
    if (currentLevel <= highestLevel) return

    setHighestLevel(currentLevel)
    writeHighestLevel(currentLevel)
  }, [currentLevel, highestLevel])

  useEffect(() => {
    if (playerName) {
      setPlayerNameDraft(playerName)
    }
  }, [playerName])

  useEffect(() => {
    if (result === 'playing' || !hasStarted || !playerName || hasSavedGameOverRef.current) return

    hasSavedGameOverRef.current = true
    setGameOverSyncState('saving')

    void pikachuService.saveGame({
      player_name: playerName,
      score,
      level_reached: currentLevel,
      highest_level: Math.max(highestLevel, currentLevel),
      result,
      time_left: timeLeft,
      difficulty_id: difficultyId,
      is_standalone: isStandaloneDisplayMode(),
      stats: {
        combo,
        mistakes,
        hints_left: hintsLeft,
        shuffles_left: shufflesLeft,
        remaining_tiles: remainingTiles,
      },
    })
      .then(() => {
        setGameOverSyncState('saved')
      })
      .catch(() => {
        setGameOverSyncState('error')
      })
  }, [
    combo,
    currentLevel,
    difficultyId,
    hasStarted,
    highestLevel,
    hintsLeft,
    mistakes,
    playerName,
    remainingTiles,
    result,
    score,
    shufflesLeft,
    timeLeft,
  ])

  useEffect(() => {
    if (!isRunning || result !== 'playing') return undefined

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isRunning, result])

  useEffect(() => {
    if (timeLeft > 0 || result !== 'playing') return

    setResult('lost')
    setIsRunning(false)
    setStatus('Het gio')
  }, [result, timeLeft])

  useEffect(() => {
    if (result !== 'playing' || !needsShuffle) return

    setStatus(getNoPairsStatus(shufflesLeft > 0))
  }, [needsShuffle, result, shufflesLeft])

  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    const syncFullscreen = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('fullscreenchange', syncFullscreen)

    return () => document.removeEventListener('fullscreenchange', syncFullscreen)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const displayMode = window.matchMedia('(display-mode: standalone)')
    const syncInstalledState = () => {
      setIsInstalled(isStandaloneDisplayMode())
    }
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => {
      setInstallPrompt(null)
      setIsInstalled(true)
      setStatus('Da cai dat game ra man hinh chinh')
      if (!readPlayerName()) {
        setShowPlayerNameDialog(true)
      }
    }

    syncInstalledState()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    displayMode.addEventListener?.('change', syncInstalledState)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      displayMode.removeEventListener?.('change', syncInstalledState)
    }
  }, [])

  return (
    <section
      className={cn(
        'pikachu-game-root min-h-dvh bg-[#170703] text-[#ffd51f] tracking-normal',
        isFullscreen ? 'fixed inset-0 z-50 overflow-hidden' : 'overflow-auto',
      )}
    >
      <style>
        {`
          .pikachu-rotate-lock {
            display: none;
          }

          @media (max-width: 920px) {
            .pikachu-game-tile-face {
              height: 88%;
              width: 88%;
              object-fit: contain;
            }
          }

          @media (max-width: 920px) and (orientation: portrait) {
            .pikachu-game-root {
              overflow: hidden;
            }

            .pikachu-game-root .pikachu-game-frame {
              filter: blur(2px);
              opacity: 0.18;
              pointer-events: none;
            }

            .pikachu-rotate-lock {
              position: fixed;
              inset: 0;
              z-index: 80;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 0.75rem;
              padding: 1.5rem;
              background: radial-gradient(circle at 50% 0%, rgba(107, 45, 14, 0.96), rgba(23, 7, 3, 0.98) 58%);
              color: #ffdd2f;
              text-align: center;
            }

            .pikachu-rotate-lock-icon {
              display: inline-flex;
              height: 3.5rem;
              width: 3.5rem;
              align-items: center;
              justify-content: center;
              border-radius: 0.75rem;
              border: 1px solid rgba(255, 196, 0, 0.42);
              background: rgba(66, 22, 7, 0.82);
              box-shadow: 0 0 24px rgba(255, 213, 31, 0.18);
            }
          }

          @media (max-width: 920px) and (orientation: landscape) {
            .pikachu-game-root {
              overflow: hidden;
            }

            .pikachu-game-root > div {
              padding: 0;
            }

            .pikachu-game-frame {
              min-height: 100dvh;
              border-radius: 0;
              border-width: 0;
            }

            .pikachu-game-main {
              display: flex;
              flex-direction: row;
              align-items: stretch;
              gap: 0.5rem;
            }

            .pikachu-game-time-column,
            .pikachu-game-time-mobile {
              display: none;
            }

            .pikachu-game-panel-clock {
              display: flex;
            }
          }

          @media (max-width: 920px) and (orientation: landscape) and (max-height: 390px) {
            .pikachu-game-main {
              gap: 0.35rem;
            }
          }
        `}
      </style>
      <div className="pikachu-rotate-lock" role="status" aria-live="polite">
        <div>
          <div className="text-xl font-black">Xoay ngang điện thoại</div>
          <div className="mt-2 text-sm font-semibold text-[#ffd24a]/80">
            Vui lòng xoay ngang để có thể chơi game thoải máy hơn
          </div>
          <div className="mt-2 text-sm font-semibold text-[#ffd24a]/80">
            hoặc tải xuống nhé!!
          </div>
        </div>
        <ArcadeButton
          icon={Download}
          label={isInstalled ? "Đã cài đặt" : "Cài đặt App"}
          onClick={() => {
            void handleInstallApp()
          }}
          disabled={isInstalled}
        />
      </div>
      {showPlayerIdentityDialog ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#160703]/78 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-[#ffdd2f]/40 bg-[#351609] p-5 shadow-xl">
            <div className="text-center">
              <div className="text-xl font-bold text-[#ffdd2f]">Tên người chơi</div>
              <div className="mt-2 text-sm font-medium text-[#ffd24a]/85">
                Nhập tên để lưu kết quả mỗi khi game over.
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs font-black uppercase text-[#ffc84a]/70" htmlFor="pikachu-player-name">
                Người chơi
              </label>
              <input
                id="pikachu-player-name"
                type="text"
                value={playerNameDraft}
                maxLength={40}
                autoFocus
                className="mt-2 h-11 w-full rounded-md border border-[#995018]/80 bg-[#2a0e05]/80 px-3 text-sm font-semibold text-[#fff1a6] outline-none transition focus:border-[#ffdd2f]"
                placeholder="Ví dụ: Minh Tri"
                onChange={(event) => setPlayerNameDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSavePlayerName()
                  }
                }}
              />
            </div>
            <button
              type="button"
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c]"
              onClick={handleSavePlayerName}
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Lưu tên người chơi
            </button>
          </div>
        </div>
      ) : null}
      <div className="mx-auto flex min-h-dvh flex-col bg-[radial-gradient(circle_at_50%_0%,rgba(138,65,20,0.82),rgba(64,24,10,0.95)_48%,#180703_100%)]">
        <div className="pikachu-game-frame relative flex flex-col overflow-hidden border border-[#713613] bg-[#351609] shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(138,65,20,0.82),rgba(64,24,10,0.95)_48%,#180703_100%)]" />
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(90deg,rgba(255,221,92,0.08)_1px,transparent_1px),linear-gradient(rgba(255,221,92,0.05)_1px,transparent_1px)] [background-size:24px_24px]" />

          <main className="relative pikachu-game-main flex flex-1 flex-row items-stretch gap-2">
            <aside className="flex basis-2/12 flex-col rounded-md border p-2 border-[#995018]/70 bg-[#240c05]/80">
              <div className="p-2 text-center font-bold text-xl">Màn {String(currentLevel)}</div>
              <div className="pikachu-game-panel-clock hidden items-center justify-center gap-1 rounded-md border border-[#995018]/70 bg-[#2a0e05]/70 px-2 py-1 text-xs font-black text-[#ffdd2f]">
                <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {formatTime(timeLeft)}
              </div>
              <div className="flex flex-wrap justify-start gap-2 text-sm font-bold py-2">
                <ArcadeButton
                  icon={Download}
                  label={isInstalled ? 'Da cai' : 'Cai app'}
                  onClick={() => {
                    void handleInstallApp()
                  }}
                  disabled={isInstalled}
                />
                <ArcadeButton
                  icon={Lightbulb}
                  label={`Goi y (${hintsLeft})`}
                  onClick={handleHint}
                  disabled={!canInteract || hintsLeft <= 0}
                />
                <ArcadeButton
                  icon={Shuffle}
                  label={`Xao (${shufflesLeft})`}
                  onClick={handleShuffle}
                  disabled={!canInteract || shufflesLeft <= 0}
                />
              </div>
              <div className="pb-2">
                <ArcadeButton
                  icon={hasStarted && isRunning ? Pause : Play}
                  onClick={handleToggleGameRunning}
                  disabled={result !== 'playing'}
                  label={!hasStarted ? 'Bat dau' : isRunning ? 'Tam dung' : 'Tiep tuc'}
                />
              </div>
              <div className="pb-2">
                <ArcadeButton icon={RotateCcw} onClick={() => resetGame()} label="Chơi lại" />
              </div>

              <div className="mt-3 rounded-md border border-[#995018]/70 bg-[#2a0e05]/70 px-2 py-2">
                <div className="text-[10px] font-black uppercase text-[#ffc84a]/70">Trang thai</div>
                <div className="mt-1 text-xs font-bold leading-tight text-[#fff1a6]">{status}</div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-black text-[#ffc84a]/75">
                  <span>Cap cao nhat</span>
                  <span className="text-[#ffdd2f]">{playablePairCount}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 text-[11px] pt-5 pb-2">
                <SideStat label="Tên" value={playerName || 'Chua dat'} />
                <SideStat label="Còn lại" value={String(remainingTiles)} />
                <SideStat label="Combo" value={String(combo)} />
                <SideStat label="Sai" value={String(mistakes)} />
                <SideStat label="Luot Doi" value={String(shufflesLeft)} />
                <SideStat label="Diem" value={score.toLocaleString('vi-VN')} />
                <SideStat label="Diem max" value={highScore.toLocaleString('vi-VN')} />
                <SideStat label="Man max" value={String(highestLevel)} />
              </div>
              <ArcadeButton icon={RefreshCw} onClick={handleReload} label="Reload Game" />
            </aside>

            <section className="min-w-0 basis-11/12 bg-[#2b0d05]/60 pt-6">
              <div
                className="relative mx-auto"
                style={
                  {
                    aspectRatio: `${difficulty.cols + 2}/${difficulty.rows}`,
                  } as CSSProperties
                }
              >
                <div
                  className={cn(
                    'absolute grid rounded-sm border border-[#48d483] bg-[#15804c] p-[2px] shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-opacity duration-200',
                    shouldHideBoard ? 'pointer-events-none opacity-0' : 'opacity-100',
                  )}
                  style={{
                    left: `${100 / (difficulty.cols + 2)}%`,
                    width: `${(difficulty.cols / (difficulty.cols + 2)) * 100}%`,
                    gridTemplateColumns: `repeat(${difficulty.cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${difficulty.rows}, minmax(0, 1fr))`,
                  }}
                >
                  {board.map((row, rowIndex) =>
                    row.map((tile, colIndex) => {
                      const position = { row: rowIndex, col: colIndex }

                      if (!tile) {
                        return (
                          <div
                            key={`empty-${rowIndex}-${colIndex}`}
                            className="aspect-square rounded-[2px] border border-transparent"
                            aria-hidden="true"
                          />
                        )
                      }

                      const symbol = symbolById[tile.symbolId] || TILE_SYMBOLS[0]
                      const isSelected = selected ? samePosition(selected, position) : false
                      const isHinted =
                        hint && (samePosition(hint.first, position) || samePosition(hint.second, position))

                      return (
                        <button
                          key={tile.id}
                          type="button"
                          className={cn(
                            'relative flex aspect-square h-full w-full touch-manipulation items-center justify-center overflow-hidden rounded-[2px] border p-0 text-current transition duration-100',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffea00] focus-visible:ring-offset-1 focus-visible:ring-offset-[#401409]',
                            canInteract ? 'hover:brightness-110 active:scale-95' : 'cursor-default',
                            isSelected ? 'z-10 border-[#ffea00] ring-2 ring-[#ffffff] ring-inset opacity-50' : 'border-[#1ca463]',
                            isHinted ? 'animate-pulse' : '',
                          )}
                          disabled={!canInteract}
                          aria-label={`${symbol.label} ${rowIndex + 1}-${colIndex + 1}`}
                          onClick={() => handleTileClick(position)}
                        >
                          <TileFace symbol={symbol} />
                        </button>
                      )
                    }),
                  )}
                </div>
                {showStartOverlay ? (
                  <div className="absolute inset-0 z-30 flex items-center justify-center rounded-lg bg-[#160703]/82 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-lg border border-[#ffdd2f]/40 bg-[#351609] p-5 text-center shadow-xl">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-[#174b37] text-[#ffdd2f]">
                        <Play className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h2 className="text-xl font-bold text-[#ffdd2f]">Bắt đầu</h2>
                      <div className="mt-4 grid gap-2 rounded-md border border-[#995018]/70 bg-[#2a0e05]/70 px-3 py-3 text-left text-sm font-bold text-[#fff1a6]">
                        <div className="flex items-center justify-between gap-3">
                          <span>Điểm cao nhất</span>
                          <span className="text-[#ffdd2f]">{highScore.toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>Màn chơi cao nhất</span>
                          <span className="text-[#ffdd2f]">Màn {highestLevel}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c]"
                        onClick={handleToggleGameRunning}
                      >
                        <Play className="h-4 w-4" aria-hidden="true" />
                        Bắt đầu
                      </button>
                    </div>
                  </div>
                ) : showPauseOverlay ? (
                  <div className="absolute inset-0 z-30 flex items-center justify-center rounded-lg bg-[#160703]/82 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-lg border border-[#ffdd2f]/40 bg-[#351609] p-5 text-center shadow-xl">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-[#4a1b0c] text-[#ffdd2f]">
                        <Pause className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h2 className="text-xl font-bold text-[#ffdd2f]">Tạm dừng</h2>
                      <p className="mt-2 text-sm font-medium text-[#ffd24a]/85">
                        Board đang được ẩn. Bấm tiếp tục để chơi tiếp.
                      </p>
                      <button
                        type="button"
                        className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c]"
                        onClick={handleToggleGameRunning}
                      >
                        <Play className="h-4 w-4" aria-hidden="true" />
                        Tiếp tục
                      </button>
                    </div>
                  </div>
                ) : result !== 'playing' ? (
                  <div className="absolute inset-0 z-30 flex items-center justify-center rounded-lg bg-[#160703]/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-lg border border-[#ffdd2f]/40 bg-[#351609] p-5 text-center shadow-xl">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-[#174b37] text-[#ffdd2f]">
                        {result === 'won' ? (
                          <Trophy className="h-6 w-6" aria-hidden="true" />
                        ) : (
                          <RefreshCw className="h-6 w-6" aria-hidden="true" />
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-[#ffdd2f]">
                        {result === 'won' ? 'Hoàn thành' : 'Game Over'}
                      </h2>
                      <p className="mt-2 text-sm font-medium text-[#ffd24a]/85">
                        Người chơi: {playerName || 'Chua dat ten'}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#ffd24a]/85">
                        Điểm: {score.toLocaleString('vi-VN')} | Kỷ lục: {highScore.toLocaleString('vi-VN')}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#ffd24a]/85">
                        Màn cao nhất: {highestLevel}
                      </p>
                      <p className="mt-1 text-xs font-bold text-[#ffc84a]/80">
                        {gameOverSyncState === 'saving'
                          ? 'Dang luu ket qua...'
                          : gameOverSyncState === 'saved'
                            ? 'Da luu ket qua vao he thong'
                            : gameOverSyncState === 'error'
                              ? 'Khong luu duoc ket qua, vui long thu lai o van sau'
                              : ''}
                      </p>
                      <button
                        type="button"
                        className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c]"
                        onClick={() => resetGame(difficultyId, true)}
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Choi lai
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
              <aside
                className={cn(
                  'absolute right-2 top-4 transition-opacity duration-200',
                  shouldHideBoard ? 'pointer-events-none opacity-0' : 'opacity-100',
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="relative h-100 w-4 flex-1 overflow-hidden rounded-full border border-[#8b2a0b] bg-[#2a0c04] shadow-[inset_0_2px_8px_rgba(0,0,0,0.65)]">
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-[#dc1f00] via-[#f97316] to-[#9CFF00] transition-[height] duration-500"
                      style={{ height: `${timeProgress}%` }}
                    />
                  </div>
                </div>
              </aside>
            </section>
          </main>
        </div>
      </div>
    </section>
  )
}

function SideStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 justify-between text-center px-2">
      <div className="text-sm font-semibold leading-tight text-[#ffdd2f]">{label}</div>
      <div className="mt-1 font-black leading-none text-[#ffdd2f]">{value}</div>
    </div>
  )
}

function ArcadeButton({
  icon: Icon,
  onClick,
  label,
  disabled,
}: {
  label?: string,
  icon: LucideIcon
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      className="p-2 inline-flex items-center gap-2 rounded-md border border-[#995018]/80 bg-[#421607]/75 text-xs font-black text-[#ffc400] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:bg-[#562008] disabled:cursor-not-allowed disabled:opacity-45"
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {label}
    </button>
  )
}

function TileFace({ symbol }: { symbol: TileSymbol }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (symbol.imageSrc && !imageFailed) {
    return (
      <img
        className="h-full w-full object-cover"
        src={symbol.imageSrc}
        alt=""
        draggable={false}
        aria-hidden="true"
        onError={() => setImageFailed(true)}
      />
    )
  }

  const Icon = symbol.Icon

  return <Icon className="h-full w-full" strokeWidth={2.4} aria-hidden="true" />
}
