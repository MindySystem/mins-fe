declare module '@/features/shop-moto/legacy/App' {
  const App: import('react').ComponentType
  export default App
}

declare module './legacy/App' {
  const App: import('react').ComponentType
  export default App
}

declare module './legacy/app/store' {
  const store: unknown
  export const persistor: unknown
  export default store
}

declare module 'redux-persist/integration/react' {
  export const PersistGate: import('react').ComponentType<{
    children?: import('react').ReactNode
    persistor: unknown
    loading?: import('react').ReactNode
  }>
}
