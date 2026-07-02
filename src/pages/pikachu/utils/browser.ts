export function isStandaloneDisplayMode() {
  if (typeof window === 'undefined') return false

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean
  }

  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
}
