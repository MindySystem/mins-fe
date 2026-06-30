import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppRouter } from './routes'

import './index.css'

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      console.error('Pikachu PWA registration failed', error)
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
