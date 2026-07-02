import { TILE_SYMBOLS } from '../constants'
import type {
  ArrangementId,
  Board,
  DifficultyConfig,
  MatchPair,
  PathPoint,
  Position,
  SearchNode,
  Tile,
  TileSymbol,
} from '../types'

const DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
] as const

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

export function getBoardSize(board: Board) {
  return {
    rows: board.length,
    cols: board[0]?.length || 0,
  }
}

export function getTile(board: Board, position: Position) {
  return board[position.row]?.[position.col] || null
}

export function samePosition(first: Position | PathPoint, second: Position | PathPoint) {
  return first.row === second.row && first.col === second.col
}

function isAdjacent(first: Position, second: Position) {
  return Math.abs(first.row - second.row) + Math.abs(first.col - second.col) === 1
}

export function getMatchKey(first: Position, second: Position) {
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

      const stateKey = `${nextRow}:${nextCol}:${direction}`
      const bestTurns = best.get(stateKey)

      if (bestTurns !== undefined && bestTurns <= nextTurns) {
        continue
      }

      best.set(stateKey, nextTurns)

      const nextPoint = { row: nextRow, col: nextCol }
      const nextPath = [...node.path, nextPoint]

      if (samePosition(nextPoint, target)) {
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

export function createBoard(config: DifficultyConfig, tileSymbols: TileSymbol[] = TILE_SYMBOLS): Board {
  const totalTiles = config.rows * config.cols
  const pairCount = totalTiles / 2
  const symbols = tileSymbols.slice(0, config.symbolCount)
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

export function countTiles(board: Board) {
  return board.reduce((count, row) => count + row.filter(Boolean).length, 0)
}

function getRemainingTiles(board: Board) {
  return board.flatMap((row) => row.filter(Boolean)) as Tile[]
}

export function findPlayablePairs(board: Board, limit = Infinity): MatchPair[] {
  const pairs: MatchPair[] = []
  const { rows, cols } = getBoardSize(board)

  for (let firstRow = 0; firstRow < rows; firstRow += 1) {
    for (let firstCol = 0; firstCol < cols; firstCol += 1) {
      const firstTile = board[firstRow][firstCol]
      if (!firstTile) continue

      for (let secondRow = firstRow; secondRow < rows; secondRow += 1) {
        const startCol = secondRow === firstRow ? firstCol + 1 : 0

        for (let secondCol = startCol; secondCol < cols; secondCol += 1) {
          const secondTile = board[secondRow][secondCol]

          if (!secondTile || firstTile.symbolId !== secondTile.symbolId) {
            continue
          }

          const first = { row: firstRow, col: firstCol }
          const second = { row: secondRow, col: secondCol }
          const path = findPath(board, first, second)

          if (!path) continue

          pairs.push({ first, second })

          if (pairs.length >= limit) {
            return pairs
          }
        }
      }
    }
  }

  return pairs
}

export function findAvailablePair(board: Board): MatchPair | null {
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

export function shuffleSymbolsUntilPlayable(board: Board) {
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

export function applyArrangement(board: Board, arrangement: ArrangementId): Board {
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

export function removeTiles(board: Board, first: Position, second: Position): Board {
  const nextBoard = cloneBoard(board)
  nextBoard[first.row][first.col] = null
  nextBoard[second.row][second.col] = null
  return nextBoard
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function getNoPairsStatus(canShuffle: boolean) {
  return canShuffle ? 'Khong con cap nao, hay xao tron lai' : 'Khong con cap nao va da het luot xao'
}
