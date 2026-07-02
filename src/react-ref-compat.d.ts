import 'react'

declare module 'react' {
  interface RefObject<T> {
    current: T
  }
}

export {}
