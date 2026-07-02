import { useCallback, useEffect, useRef } from 'react'

import type { GameSettings, SoundEffect } from '../types'

type UsePikachuAudioParams = {
  gameSettings: GameSettings
}

const BACKGROUND_MUSIC_SRC = '/audio/pikachu/bg-loop.mp3'

const SOUND_EFFECT_SOURCES: Record<SoundEffect, string> = {
  select: '/audio/pikachu/select.mp3',
  match: '/audio/pikachu/match.mp3',
  shuffle: '/audio/pikachu/shuffle.mp3',
  action: '/audio/pikachu/action.mp3',
  failNew: '/audio/pikachu/failNew.mp3',
}

function clampVolume(volume: number) {
  return Math.max(0, Math.min(1, volume))
}

function applyInlinePlayback(audio: HTMLAudioElement) {
  ;(audio as HTMLAudioElement & { playsInline?: boolean }).playsInline = true
}

export function usePikachuAudio({ gameSettings }: UsePikachuAudioParams) {
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null)
  const preloadedEffectsRef = useRef<Partial<Record<SoundEffect, HTMLAudioElement>>>({})
  const activeEffectsRef = useRef(new Set<HTMLAudioElement>())

  const ensureBackgroundAudio = useCallback(() => {
    if (typeof window === 'undefined') return null

    if (backgroundAudioRef.current) return backgroundAudioRef.current

    const audio = new Audio(BACKGROUND_MUSIC_SRC)
    audio.loop = true
    audio.preload = 'auto'
    applyInlinePlayback(audio)
    backgroundAudioRef.current = audio

    return audio
  }, [])

  const ensureEffectAudio = useCallback((effect: SoundEffect) => {
    if (typeof window === 'undefined') return null

    const cachedAudio = preloadedEffectsRef.current[effect]
    if (cachedAudio) return cachedAudio

    const audio = new Audio(SOUND_EFFECT_SOURCES[effect])
    audio.preload = 'auto'
    applyInlinePlayback(audio)
    preloadedEffectsRef.current[effect] = audio

    return audio
  }, [])

  const pauseBackgroundMusic = useCallback(() => {
    const audio = ensureBackgroundAudio()
    if (!audio) return

    audio.pause()
    audio.currentTime = 0
    audio.muted = false
  }, [ensureBackgroundAudio])

  const playBackgroundMusic = useCallback(async () => {
    const audio = ensureBackgroundAudio()
    if (!audio) return

    const volume = clampVolume(gameSettings.musicVolume / 100)
    audio.volume = volume

    if (!gameSettings.musicEnabled) {
      pauseBackgroundMusic()
      return
    }

    audio.muted = false

    try {
      await audio.play()
      return
    } catch {
      audio.muted = true

      try {
        await audio.play()
        audio.volume = volume
        audio.muted = false
      } catch {
        audio.muted = false
      }
    }
  }, [ensureBackgroundAudio, gameSettings.musicEnabled, gameSettings.musicVolume, pauseBackgroundMusic])

  const resumeAudioContext = useCallback(async () => {
    await playBackgroundMusic()

    ;(Object.keys(SOUND_EFFECT_SOURCES) as SoundEffect[]).forEach((effect) => {
      ensureEffectAudio(effect)
    })

    return null
  }, [ensureEffectAudio, playBackgroundMusic])

  const playSoundEffect = useCallback(
    (effect: SoundEffect) => {
      if (!gameSettings.soundEnabled || typeof window === 'undefined') return

      ensureEffectAudio(effect)

      const audio = new Audio(SOUND_EFFECT_SOURCES[effect])
      audio.preload = 'auto'
      audio.volume = clampVolume(gameSettings.soundVolume / 100)
      applyInlinePlayback(audio)

      const cleanup = () => {
        audio.pause()
        audio.src = ''
        activeEffectsRef.current.delete(audio)
      }

      audio.addEventListener('ended', cleanup, { once: true })
      audio.addEventListener('error', cleanup, { once: true })
      activeEffectsRef.current.add(audio)

      void audio.play().catch(() => {
        cleanup()
      })
    },
    [ensureEffectAudio, gameSettings.soundEnabled, gameSettings.soundVolume],
  )

  useEffect(() => {
    const audio = ensureBackgroundAudio()
    if (!audio) return

    audio.volume = clampVolume(gameSettings.musicVolume / 100)
  }, [ensureBackgroundAudio, gameSettings.musicVolume])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    void playBackgroundMusic()

    if (!gameSettings.musicEnabled) {
      return undefined
    }

    const unlockBackgroundMusic = () => {
      void playBackgroundMusic()
    }

    window.addEventListener('pointerdown', unlockBackgroundMusic, { once: true })
    window.addEventListener('touchstart', unlockBackgroundMusic, { once: true })
    window.addEventListener('keydown', unlockBackgroundMusic, { once: true })
    window.addEventListener('click', unlockBackgroundMusic, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlockBackgroundMusic)
      window.removeEventListener('touchstart', unlockBackgroundMusic)
      window.removeEventListener('keydown', unlockBackgroundMusic)
      window.removeEventListener('click', unlockBackgroundMusic)
    }
  }, [gameSettings.musicEnabled, gameSettings.musicVolume, playBackgroundMusic])

  useEffect(() => {
    return () => {
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause()
        backgroundAudioRef.current.src = ''
        backgroundAudioRef.current = null
      }

      activeEffectsRef.current.forEach((audio) => {
        audio.pause()
        audio.src = ''
      })
      activeEffectsRef.current.clear()

      Object.values(preloadedEffectsRef.current).forEach((audio) => {
        audio?.pause()
        if (audio) {
          audio.src = ''
        }
      })
      preloadedEffectsRef.current = {}
    }
  }, [])

  return {
    playSoundEffect,
    pauseBackgroundMusic,
    resumeAudioContext,
  }
}
