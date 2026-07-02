import { useState } from 'react'

import type { TileSymbol } from '../types'

type TileFaceProps = {
  symbol: TileSymbol
}

export function TileFace({ symbol }: TileFaceProps) {
  const [imageFailed, setImageFailed] = useState(false)

  if (symbol.imageSrc && !imageFailed) {
    return (
      <img
        className="pikachu-game-tile-face h-full w-full select-none object-cover"
        src={symbol.imageSrc}
        alt=""
        draggable={false}
        aria-hidden="true"
        onError={() => setImageFailed(true)}
      />
    )
  }

  const Icon = symbol.Icon

  return <Icon className="pikachu-game-tile-face h-full w-full select-none" strokeWidth={2.4} aria-hidden="true" />
}
