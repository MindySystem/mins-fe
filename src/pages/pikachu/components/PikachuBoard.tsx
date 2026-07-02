import { TILE_SYMBOLS, symbolById } from '../constants'
import type { Board, DifficultyConfig, MatchPair, Position } from '../types'
import { samePosition } from '../utils/board'
import { TileFace } from './TileFace'

type PikachuBoardProps = {
  board: Board
  difficulty: DifficultyConfig
  selected: Position | null
  inactivePositions: Position[]
  hint: MatchPair | null
  canInteract: boolean
  shouldHideBoard: boolean
  timeProgress: number
  onTileClick: (position: Position) => void
}

export function PikachuBoard({
  board,
  difficulty,
  selected,
  inactivePositions,
  hint,
  canInteract,
  shouldHideBoard,
  timeProgress,
  onTileClick,
}: PikachuBoardProps) {
  return (
    <div className="mx-auto flex justify-center transition-all duration-200">
      <div
        className={`pikachu-board-grid relative grid rounded-sm p-[2px] pr-10 transition-opacity duration-200 ${
          shouldHideBoard ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        style={{
          left: `${100 / (difficulty.cols + 1)}%`,
          width: `${(difficulty.cols / (difficulty.cols + 3)) * 100}%`,
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
            const isInactive = inactivePositions.some((lockedPosition) => samePosition(lockedPosition, position))
            const isHinted = hint && (samePosition(hint.first, position) || samePosition(hint.second, position))

            return (
              <button
                key={tile.id}
                type="button"
                className={`relative flex aspect-square h-full w-full select-none touch-manipulation items-center justify-center overflow-hidden rounded-[2px] border p-0 text-current transition duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffea00] focus-visible:ring-offset-1 focus-visible:ring-offset-[#401409] ${
                  canInteract && !isInactive ? 'hover:brightness-110 active:scale-95' : 'cursor-default'
                } ${isSelected ? 'z-10 border-3 border-[#ff0000] ring-3 ring-[#ffea00] ring-inset opacity-90' : ''} ${
                  isHinted ? 'animate-pulse' : ''
                } ${isInactive ? 'opacity-60' : ''}`}
                disabled={!canInteract || isInactive}
                aria-label={`${symbol.label} ${rowIndex + 1}-${colIndex + 1}${isInactive ? ' da khoa' : ''}`}
                onPointerUp={(event) => {
                  if (event.button !== 0) return
                  if (isInactive) return
                  event.preventDefault()
                  onTileClick(position)
                }}
                onKeyDown={(event) => {
                  if (isInactive) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onTileClick(position)
                  }
                }}
              >
                <TileFace symbol={symbol} />
              </button>
            )
          }),
        )}

        <aside
          className={`absolute right-2 h-full transition-opacity duration-200 ${
            shouldHideBoard ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <div className="flex h-full items-center gap-2">
            <div className="relative h-full w-4 flex-1 overflow-hidden rounded-full border border-[#8b2a0b] bg-[#2a0c04] shadow-[inset_0_2px_8px_rgba(0,0,0,0.65)]">
              <div
                className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-[#dc1f00] via-[#f97316] to-[#9CFF00] transition-[height] duration-500"
                style={{ height: `${timeProgress}%` }}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
