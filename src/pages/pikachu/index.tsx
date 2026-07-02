import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  House,
  Lightbulb,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Settings,
  Shuffle,
  Trophy,
} from 'lucide-react'

import { pikachuService, type PikachuLeaderboardEntry } from '@/services/pikachu.service'

import { DIFFICULTIES, LEVELS, getDifficulty, getLevelConfig } from './constants'
import './pikachu.css'
import { ArcadeButton } from './components/ArcadeButton'
import { PikachuBoard } from './components/PikachuBoard'
import { ActionModal, DifficultyModal, PlayerNameModal, SettingsModal, StartOverlay } from './components/PikachuOverlays'
import { SideStat } from './components/SideStat'
import { usePikachuAudio } from './hooks/usePikachuAudio'
import type {
  BeforeInstallPromptEvent,
  ConfirmAction,
  DifficultyId,
  GameResult,
  GameSettings,
  MatchPair,
  Position,
  SavedGameState,
  SettingsTab,
} from './types'
import { isStandaloneDisplayMode } from './utils/browser'
import {
  applyArrangement,
  countTiles,
  createBoard,
  findPlayablePairs,
  formatTime,
  getMatchKey,
  getNoPairsStatus,
  getTile,
  removeTiles,
  samePosition,
  shuffleSymbolsUntilPlayable,
} from './utils/board'
import {
  clampPercentage,
  clearSavedGame,
  readGameSettings,
  readHighScore,
  readHighestLevel,
  readPlayerName,
  readSavedGame,
  writeGameSettings,
  writeHighScore,
  writeHighestLevel,
  writePlayerName,
  writeSavedGame,
} from './utils/storage'

export default function PikachuPage() {
  const [gameSettings, setGameSettings] = useState<GameSettings>(readGameSettings)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showDifficultyModal, setShowDifficultyModal] = useState(false)
  const [pendingDifficultyId, setPendingDifficultyId] = useState<DifficultyId | null>(null)
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('audio')
  const defaultDifficulty = getDifficulty(gameSettings.difficultyId)
  const [savedGame, setSavedGame] = useState<SavedGameState | null>(readSavedGame)
  const initialDifficulty = savedGame ? getDifficulty(savedGame.difficultyId) : defaultDifficulty
  const [difficultyId, setDifficultyId] = useState<DifficultyId>(savedGame?.difficultyId || gameSettings.difficultyId)
  const [currentLevel, setCurrentLevel] = useState(savedGame?.currentLevel || 1)
  const [board, setBoard] = useState(() => savedGame?.board || createBoard(initialDifficulty))
  const [selected, setSelected] = useState<Position | null>(null)
  const [inactivePositions, setInactivePositions] = useState<Position[]>([])
  const [hint, setHint] = useState<MatchPair | null>(null)
  const [playerName, setPlayerName] = useState(readPlayerName)
  const [playerNameDraft, setPlayerNameDraft] = useState(readPlayerName)
  const [showPlayerNameDialog, setShowPlayerNameDialog] = useState(() => !readPlayerName())
  const [showNoPairsModal, setShowNoPairsModal] = useState(false)
  const [completedLevel, setCompletedLevel] = useState<number | null>(null)
  const [score, setScore] = useState(savedGame?.score || 0)
  const [highScore, setHighScore] = useState(readHighScore)
  const [highestLevel, setHighestLevel] = useState(readHighestLevel)
  const [combo, setCombo] = useState(savedGame?.combo || 0)
  const [mistakes, setMistakes] = useState(savedGame?.mistakes || 0)
  const [hintsLeft, setHintsLeft] = useState(savedGame?.hintsLeft ?? initialDifficulty.hints)
  const [shufflesLeft, setShufflesLeft] = useState(savedGame?.shufflesLeft ?? initialDifficulty.shuffles)
  const [timeLeft, setTimeLeft] = useState(savedGame?.timeLeft ?? initialDifficulty.timeLimit)
  const [hasStarted, setHasStarted] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<GameResult>('playing')
  const [status, setStatus] = useState(savedGame ? 'Nhấn Tiếp tục để chơi' : 'Bắt đầu chơi')
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [leaderboard, setLeaderboard] = useState<PikachuLeaderboardEntry[]>([])
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false)
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null)
  const [openSidebar, setOpenSidebar] = useState(true)
  const hasSavedGameOverRef = useRef(false)
  const currentGameSnapshotRef = useRef<SavedGameState | null>(null)
  const wrongSelectionTimerRef = useRef<number | null>(null)

  const difficulty = useMemo(() => getDifficulty(difficultyId), [difficultyId])
  const pendingDifficulty = useMemo(
    () => (pendingDifficultyId ? getDifficulty(pendingDifficultyId) : null),
    [pendingDifficultyId],
  )
  const currentLevelConfig = useMemo(() => getLevelConfig(currentLevel), [currentLevel])
  const remainingTiles = useMemo(() => countTiles(board), [board])
  const timeProgress = Math.max(0, Math.min(100, (timeLeft / difficulty.timeLimit) * 100))
  const playablePairs = useMemo(() => findPlayablePairs(board), [board])
  const playablePairCount = playablePairs.length
  const isActionModalOpen = showSettingsModal || showDifficultyModal || pendingDifficulty !== null || confirmAction !== null
  const playablePairLookup = useMemo(() => {
    const lookup = new Map<string, MatchPair>()

    playablePairs.forEach((pair) => {
      lookup.set(getMatchKey(pair.first, pair.second), pair)
    })

    return lookup
  }, [playablePairs])
  const needsShuffle = remainingTiles > 0 && playablePairCount === 0
  const canInteract = hasStarted && result === 'playing' && isRunning && !isActionModalOpen
  const isLevelCompleteWaiting = completedLevel !== null
  const isPaused = hasStarted && result === 'playing' && !isRunning && !isLevelCompleteWaiting
  const showStartOverlay = result === 'playing' && !hasStarted
  const showPauseOverlay = isPaused
  const shouldHideBoard = showStartOverlay || showPauseOverlay || isLevelCompleteWaiting
  const showPlayerIdentityDialog = showPlayerNameDialog || !playerName
  const playButtonLabel = !hasStarted ? (savedGame ? 'Tiếp tục' : 'Bắt đầu') : isRunning ? 'Tạm Dừng' : 'Tiếp tục'

  const { playSoundEffect, pauseBackgroundMusic, resumeAudioContext } = usePikachuAudio({
    gameSettings,
  })

  const loadLeaderboard = useCallback(() => {
    setIsLeaderboardLoading(true)
    setLeaderboardError(null)

    void pikachuService
      .getLeaderboard()
      .then((response) => {
        setLeaderboard(response.data.slice(0, 10))
      })
      .catch(() => {
        setLeaderboardError('Không tải được bảng xếp hạng')
      })
      .finally(() => {
        setIsLeaderboardLoading(false)
      })
  }, [])

  const resetGame = useCallback(
    (nextDifficultyId = difficultyId, autoStart = hasStarted) => {
      const nextDifficulty = getDifficulty(nextDifficultyId)

      clearSavedGame()
      currentGameSnapshotRef.current = null
      if (wrongSelectionTimerRef.current !== null) {
        window.clearTimeout(wrongSelectionTimerRef.current)
        wrongSelectionTimerRef.current = null
      }
      setSavedGame(null)
      setDifficultyId(nextDifficulty.id)
      setCurrentLevel(1)
      setBoard(createBoard(nextDifficulty))
      setSelected(null)
      setInactivePositions([])
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
      setShowNoPairsModal(false)
      setCompletedLevel(null)
      hasSavedGameOverRef.current = false
      setStatus(autoStart ? `Màn 1: ${getLevelConfig(1).title}` : 'Nhấn Bắt đầu để chơi')
    },
    [difficultyId, hasStarted],
  )

  const clearWrongSelectionState = useCallback(() => {
    if (wrongSelectionTimerRef.current !== null) {
      window.clearTimeout(wrongSelectionTimerRef.current)
      wrongSelectionTimerRef.current = null
    }

    setInactivePositions([])
  }, [])

  const markWrongSelection = useCallback(
    (positions: Position[]) => {
      if (wrongSelectionTimerRef.current !== null) {
        window.clearTimeout(wrongSelectionTimerRef.current)
      }

      setInactivePositions(positions)
      wrongSelectionTimerRef.current = window.setTimeout(() => {
        setInactivePositions([])
        wrongSelectionTimerRef.current = null
      }, 450)
    },
    [],
  )

  const buildCurrentSavedGame = useCallback((): SavedGameState | null => {
    if (!hasStarted || result !== 'playing') return null

    return {
      result: 'playing',
      difficultyId,
      currentLevel,
      board,
      score,
      combo,
      mistakes,
      hintsLeft,
      shufflesLeft,
      timeLeft,
      playerName,
      savedAt: Date.now(),
    }
  }, [
    board,
    combo,
    currentLevel,
    difficultyId,
    hasStarted,
    hintsLeft,
    mistakes,
    playerName,
    result,
    score,
    shufflesLeft,
    timeLeft,
  ])

  const handleSavePlayerName = useCallback(() => {
    const nextPlayerName = playerNameDraft.trim()

    if (!nextPlayerName) {
      setStatus('Vui lòng nhập tên người chơi')
      return
    }

    playSoundEffect('action')
    writePlayerName(nextPlayerName)
    setPlayerName(nextPlayerName)
    setPlayerNameDraft(nextPlayerName)
    setShowPlayerNameDialog(false)
    setStatus(hasStarted ? 'Đã cập nhật tên người chơi' : savedGame ? 'Nhấn Tiếp tục để chơi' : 'Nhấn Bắt đầu để chơi')
  }, [hasStarted, playSoundEffect, playerNameDraft, savedGame])

  const handleToggleGameRunning = useCallback(() => {
    if (result !== 'playing') return

    if (!playerName) {
      setShowPlayerNameDialog(true)
      setStatus('Vui lòng nhập tên người chơi')
      return
    }

    if (!hasStarted) {
      void resumeAudioContext()
      playSoundEffect('action')
      setHasStarted(true)
      setIsRunning(true)
      setStatus(`Màn ${currentLevel}: ${currentLevelConfig.title}`)
      return
    }

    if (isRunning) {
      playSoundEffect('action')
      setIsRunning(false)
      setStatus('Tạm Dừng')
      return
    }

    void resumeAudioContext()
    playSoundEffect('action')
    setIsRunning(true)
    setStatus('Tiếp tục chơi')
  }, [currentLevel, currentLevelConfig.title, hasStarted, isRunning, playSoundEffect, playerName, result, resumeAudioContext])

  const handleBackHome = useCallback(() => {
    const nextSavedGame = buildCurrentSavedGame()

    playSoundEffect('action')

    if (nextSavedGame) {
      writeSavedGame(nextSavedGame)
      setSavedGame(nextSavedGame)
    }

    setHasStarted(false)
    setIsRunning(false)
    setSelected(null)
    clearWrongSelectionState()
    setHint(null)
    setShowNoPairsModal(false)
    setCompletedLevel(null)
    setStatus(nextSavedGame || savedGame ? 'Nhấn Tiếp tục để chơi' : 'Nhấn Bắt đầu để chơi')
  }, [buildCurrentSavedGame, clearWrongSelectionState, playSoundEffect, savedGame])

  const handleLeavePage = useCallback(() => {
    const nextSavedGame = buildCurrentSavedGame()

    if (nextSavedGame) {
      writeSavedGame(nextSavedGame)
      setSavedGame(nextSavedGame)
    }

    pauseBackgroundMusic()

    if (hasStarted && result === 'playing') {
      setIsRunning(false)
      setStatus('Tạm Dừng')
    }
  }, [buildCurrentSavedGame, hasStarted, pauseBackgroundMusic, result])

  const handleContinueNextLevel = useCallback(() => {
    if (completedLevel === null) return

    playSoundEffect('action')
    setCompletedLevel(null)
    clearWrongSelectionState()
    setIsRunning(true)
    setStatus(`Màn ${currentLevel}: ${currentLevelConfig.title}`)
  }, [clearWrongSelectionState, completedLevel, currentLevel, currentLevelConfig.title, playSoundEffect])

  const handleDifficultyChange = useCallback(
    (nextDifficultyId: DifficultyId) => {
      if (nextDifficultyId === difficultyId) return

      const nextSettings: GameSettings = {
        ...gameSettings,
        difficultyId: nextDifficultyId,
      }

      setGameSettings(nextSettings)
      writeGameSettings(nextSettings)
      playSoundEffect('action')
      setShowDifficultyModal(false)
      clearWrongSelectionState()
      resetGame(nextDifficultyId, false)
    },
    [clearWrongSelectionState, difficultyId, gameSettings, playSoundEffect, resetGame],
  )

  const handleApplyAudioSettings = useCallback(
    (updates: Partial<Pick<GameSettings, 'musicEnabled' | 'soundEnabled' | 'musicVolume' | 'soundVolume'>>) => {
      const nextSettings: GameSettings = {
        ...gameSettings,
        ...updates,
        musicVolume:
          updates.musicVolume === undefined
            ? gameSettings.musicVolume
            : clampPercentage(updates.musicVolume, gameSettings.musicVolume),
        soundVolume:
          updates.soundVolume === undefined
            ? gameSettings.soundVolume
            : clampPercentage(updates.soundVolume, gameSettings.soundVolume),
      }

      const shouldResumeAudio =
        (!gameSettings.musicEnabled && nextSettings.musicEnabled) ||
        (!gameSettings.soundEnabled && nextSettings.soundEnabled)
      const shouldPlayAction =
        updates.musicEnabled !== undefined || updates.soundEnabled !== undefined

      setGameSettings(nextSettings)
      writeGameSettings(nextSettings)

      if (shouldPlayAction) {
        playSoundEffect('action')
      }

      if (shouldResumeAudio) {
        void resumeAudioContext()
      }
    },
    [gameSettings, playSoundEffect, resumeAudioContext],
  )

  const handleOpenSettings = useCallback(() => {
    playSoundEffect('action')
    setActiveSettingsTab('audio')
    setShowSettingsModal(true)
  }, [playSoundEffect])

  const handleCloseSettings = useCallback(() => {
    playSoundEffect('action')
    setShowSettingsModal(false)
  }, [playSoundEffect])

  const handleSettingsTabChange = useCallback(
    (nextTab: SettingsTab) => {
      if (nextTab === activeSettingsTab) return

      playSoundEffect('action')
      setActiveSettingsTab(nextTab)
    },
    [activeSettingsTab, playSoundEffect],
  )

  const finishSuccessfulMatch = useCallback(
    (match: MatchPair) => {
      playSoundEffect('match')
      setSelected(null)
      clearWrongSelectionState()
      setHint(null)
      setCombo((currentCombo) => {
        const nextCombo = currentCombo + 1
        const turnBonus = Math.ceil(timeLeft / 30)
        setScore((currentScore) => currentScore + 100 + nextCombo * 15 + turnBonus)
        return nextCombo
      })

      setBoard((currentBoard) => {
        const arrangedBoard = applyArrangement(
          removeTiles(currentBoard, match.first, match.second),
          currentLevelConfig.arrangement,
        )
        const remaining = countTiles(arrangedBoard)

        if (remaining === 0) {
          if (currentLevel < LEVELS.length) {
            const nextLevel = currentLevel + 1

            setCurrentLevel(nextLevel)
            setSelected(null)
            setHint(null)
            setTimeLeft(difficulty.timeLimit)
            setHintsLeft(difficulty.hints)
            setShufflesLeft((current) => current + 1)
            setIsRunning(false)
            setShowNoPairsModal(false)
            setCompletedLevel(currentLevel)
            setStatus(`Hoàn thành màn ${currentLevel}. Chọn tiếp tục để chơi màn ${nextLevel}`)

            return createBoard(difficulty)
          }

          setResult('won')
          setIsRunning(false)
          setStatus('Bạn Thật Xuất Sắc')
          return arrangedBoard
        }

        const nextPlayablePairCount = findPlayablePairs(arrangedBoard).length
        if (nextPlayablePairCount === 0) {
          setStatus(getNoPairsStatus(shufflesLeft > 0))
        }

        return arrangedBoard
      })
    },
    [clearWrongSelectionState, currentLevel, currentLevelConfig.arrangement, difficulty, playSoundEffect, shufflesLeft, timeLeft],
  )

  const handleTileClick = useCallback(
    (position: Position) => {
      if (!canInteract) return

      const tile = getTile(board, position)
      if (!tile) return

      setHint(null)

      if (!selected) {
        playSoundEffect('select')
        setSelected(position)
        return
      }

      if (samePosition(selected, position)) {
        setSelected(null)
        return
      }

      const selectedTile = getTile(board, selected)

      if (!selectedTile) {
        playSoundEffect('select')
        setSelected(position)
        return
      }

      if (selectedTile.symbolId !== tile.symbolId) {
        playSoundEffect('failNew')
        setMistakes((current) => current + 1)
        setSelected(null)
        markWrongSelection([selected, position])
        return
      }

      const cachedMatch = playablePairLookup.get(getMatchKey(selected, position))

      if (!cachedMatch) {
        playSoundEffect('failNew')
        setMistakes((current) => current + 1)
        setSelected(null)
        markWrongSelection([selected, position])
        return
      }

      finishSuccessfulMatch(cachedMatch)
    },
    [board, canInteract, finishSuccessfulMatch, markWrongSelection, playablePairLookup, playSoundEffect, selected],
  )

  const handleHint = useCallback(() => {
    if (!canInteract || hintsLeft <= 0) return

    const match = playablePairs[0]

    if (!match) {
      setStatus(getNoPairsStatus(shufflesLeft > 0))
      return
    }

    playSoundEffect('action')
    setHintsLeft((current) => Math.max(0, current - 1))
    setSelected(match.first)
    setHint(match)
  }, [canInteract, hintsLeft, playablePairs, playSoundEffect, shufflesLeft])

  const performShuffle = useCallback(() => {
    if (shufflesLeft <= 0 || remainingTiles <= 0) return

    const shuffled = shuffleSymbolsUntilPlayable(board)
    const nextShufflesLeft = Math.max(0, shufflesLeft - 1)
    const nextPlayablePairCount = shuffled.match ? findPlayablePairs(shuffled.board).length : 0

    setBoard(shuffled.board)
    setSelected(null)
    clearWrongSelectionState()
    setHint(null)
    setShowNoPairsModal(false)
    setShufflesLeft((current) => Math.max(0, current - 1))
    setCombo(0)
    playSoundEffect('shuffle')

    if (nextPlayablePairCount === 0) {
      setStatus(getNoPairsStatus(nextShufflesLeft > 0))
    } else {
      setStatus(`Màn ${currentLevel}: ${currentLevelConfig.title}`)
    }
  }, [board, clearWrongSelectionState, currentLevel, currentLevelConfig.title, playSoundEffect, remainingTiles, shufflesLeft])

  const handleShuffle = useCallback(() => {
    if (!canInteract || shufflesLeft <= 0 || remainingTiles <= 0) return

    if (playablePairCount > 0) {
      playSoundEffect('action')
      setConfirmAction({ type: 'shuffle' })
      return
    }

    performShuffle()
  }, [canInteract, performShuffle, playablePairCount, playSoundEffect, remainingTiles, shufflesLeft])

  const handleReload = useCallback(() => {
    if (typeof window === 'undefined') return

    window.location.reload()
  }, [])

  const handleRequestRestart = useCallback(
    (autoStart = hasStarted) => {
      playSoundEffect('action')
      setConfirmAction({ type: 'restart', autoStart })
    },
    [hasStarted, playSoundEffect],
  )

  const handleRequestReload = useCallback(() => {
    playSoundEffect('action')
    setConfirmAction({ type: 'reload' })
  }, [playSoundEffect])

  const handleCloseConfirm = useCallback(() => {
    playSoundEffect('action')
    setConfirmAction(null)
  }, [playSoundEffect])

  const handleConfirmAction = useCallback(() => {
    if (!confirmAction) return

    playSoundEffect('action')

    if (confirmAction.type === 'restart') {
      const { autoStart } = confirmAction

      setConfirmAction(null)
      resetGame(difficultyId, autoStart)
      return
    }

    if (confirmAction.type === 'shuffle') {
      setConfirmAction(null)
      performShuffle()
      return
    }

    setConfirmAction(null)
    handleReload()
  }, [confirmAction, difficultyId, handleReload, performShuffle, playSoundEffect, resetGame])

  const handleInstallApp = useCallback(async () => {
    playSoundEffect('action')

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
    }
  }, [installPrompt, isInstalled, playSoundEffect])

  const handleToggleSidebar = useCallback(() => {
    playSoundEffect('action')
    setOpenSidebar((current) => !current)
  }, [playSoundEffect])

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
    loadLeaderboard()
  }, [loadLeaderboard])

  useEffect(() => {
    currentGameSnapshotRef.current = buildCurrentSavedGame()
  }, [buildCurrentSavedGame])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined

    const handleLeave = () => {
      handleLeavePage()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleLeave()
      }
    }

    window.addEventListener('pagehide', handleLeave)
    window.addEventListener('beforeunload', handleLeave)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('pagehide', handleLeave)
      window.removeEventListener('beforeunload', handleLeave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [handleLeavePage])

  useEffect(() => {
    if (result === 'playing') return

    clearSavedGame()
    currentGameSnapshotRef.current = null
    setSavedGame(null)
  }, [result])

  useEffect(() => {
    return () => {
      if (wrongSelectionTimerRef.current !== null) {
        window.clearTimeout(wrongSelectionTimerRef.current)
        wrongSelectionTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (result === 'playing' || !hasStarted || !playerName || hasSavedGameOverRef.current) return

    hasSavedGameOverRef.current = true

    void pikachuService
      .saveGame({
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
      .then(() => loadLeaderboard())
      .catch(() => undefined)
  }, [
    combo,
    currentLevel,
    difficultyId,
    hasStarted,
    highestLevel,
    hintsLeft,
    loadLeaderboard,
    mistakes,
    playerName,
    remainingTiles,
    result,
    score,
    shufflesLeft,
    timeLeft,
  ])

  useEffect(() => {
    if (!isRunning || isActionModalOpen || result !== 'playing') return undefined

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isActionModalOpen, isRunning, result])

  useEffect(() => {
    if (timeLeft > 0 || result !== 'playing') return

    setResult('lost')
    setIsRunning(false)
    setStatus('Het gio')
  }, [result, timeLeft])

  useEffect(() => {
    if (result !== 'playing' || !hasStarted || !needsShuffle) {
      setShowNoPairsModal(false)
      return
    }

    setStatus(getNoPairsStatus(shufflesLeft > 0))
    setShowNoPairsModal(shufflesLeft > 0)
  }, [hasStarted, needsShuffle, result, shufflesLeft])

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
    <section className="pikachu-game-root min-h-dvh overflow-auto bg-[#170703] text-[#ffd51f] tracking-normal">
      <div className="pikachu-rotate-lock" role="status" aria-live="polite">
        <div>
          <div className="text-xl font-black">Xoay ngang điện thoại</div>
          <div className="mt-2 text-sm font-semibold text-[#ffd24a]/80">
            Vui lòng xoay ngang để có thể chơi game thoải mái hơn
          </div>
          <div className="mt-2 text-sm font-semibold text-[#ffd24a]/80">hoặc tải xuống nhé!!</div>
        </div>
        <ArcadeButton
          icon={Download}
          label={isInstalled ? 'Đã cài đặt' : 'Cài đặt App'}
          onClick={() => {
            void handleInstallApp()
          }}
          disabled={isInstalled}
        />
      </div>

      {showPlayerIdentityDialog ? (
        <PlayerNameModal
          playerNameDraft={playerNameDraft}
          onChange={setPlayerNameDraft}
          onSave={handleSavePlayerName}
        />
      ) : null}

      <div className="mx-auto flex min-h-dvh flex-col bg-[radial-gradient(circle_at_50%_0%,rgba(138,65,20,0.82),rgba(64,24,10,0.95)_48%,#180703_100%)]">
        <div className="relative flex h-screen flex-col overflow-hidden border border-[#713613] bg-[#351609] shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(138,65,20,0.82),rgba(64,24,10,0.95)_48%,#180703_100%)]" />
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(90deg,rgba(255,221,92,0.08)_1px,transparent_1px),linear-gradient(rgba(255,221,92,0.05)_1px,transparent_1px)] [background-size:24px_24px]" />

          <main className="relative flex flex-1 flex-row items-stretch overflow-hidden">
            <button
              type="button"
              aria-label={openSidebar ? 'Ẩn menu' : 'Hiện menu'}
              className={`absolute top-4 z-20 inline-flex h-10 w-8 items-center justify-center rounded-md border border-l-0 border-[#995018]/80 bg-[#421607]/90 text-[#ffc400] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-[left,background-color] duration-300 hover:bg-[#562008] ${
                openSidebar ? 'left-[160px] lg:left-[340px] xl:left-[380px]' : 'left-10'
              } ${isInstalled ? ' ml-12' : ''}`}
              onClick={handleToggleSidebar}
            >
              {openSidebar ? (
                <ChevronLeft className="h-4 w-4 lg:h-[1.125rem] lg:w-[1.125rem]" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-4 w-4 lg:h-[1.125rem] lg:w-[1.125rem]" aria-hidden="true" />
              )}
            </button>

            <aside
              className={`relative z-10 shrink-0 overflow-hidden rounded-r-md border-r border-[#995018]/70 bg-[#240c05]/80 transition-[width,min-width,padding,opacity,border-color] duration-300 ease-out ${
                openSidebar
                  ? 'w-[160px] p-2 opacity-100 lg:w-[340px] lg:min-w-[340px] lg:p-3 xl:w-[380px] xl:min-w-[380px] xl:p-4'
                  : 'w-0 min-w-0 border-transparent p-0 opacity-0'
              } ${isInstalled ? ' ml-12' : ''}`}
            >
              <div className={`flex h-full flex-col transition-opacity duration-200 ${openSidebar ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                <div className="mb-4 flex items-center justify-between gap-2 text-xl font-bold lg:text-2xl xl:text-[1.75rem]">
                  <span className="flex-1 text-center">Pi Ka Pi Ka</span>
                </div>
                <div className="flex flex-wrap justify-start gap-1 text-sm font-bold">
                  <ArcadeButton icon={Settings} onClick={handleOpenSettings} />
                  <ArcadeButton
                    icon={House}
                    onClick={handleBackHome}
                    disabled={!hasStarted || result !== 'playing' || isLevelCompleteWaiting}
                  />
                  <ArcadeButton
                    icon={Lightbulb}
                    onClick={handleHint}
                    disabled={!canInteract || hintsLeft <= 0}
                    badge={hintsLeft}
                  />
                  <ArcadeButton
                    icon={Shuffle}
                    onClick={handleShuffle}
                    disabled={!canInteract || shufflesLeft <= 0}
                    badge={shufflesLeft}
                  />
                </div>
                <ArcadeButton
                  icon={hasStarted && isRunning ? Pause : Play}
                  onClick={handleToggleGameRunning}
                  disabled={result !== 'playing' || isLevelCompleteWaiting}
                  label={playButtonLabel}
                />
                <ArcadeButton icon={RotateCcw} onClick={() => handleRequestRestart()} label="Chơi lại" />

                <div className="mt-3 rounded-md border border-[#995018]/70 bg-[#2a0e05]/70 p-1">
                  <div className="text-[10px] font-black uppercase text-[#ffc84a]/70">Trạng Thái</div>
                  <div className="inline-flex items-center justify-center gap-1 rounded-md py-1 text-xs font-black text-[#ffdd2f]">
                    Time: {formatTime(timeLeft)}
                    <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </div>
                  <div className="text-xs font-bold text-[#fff1a6]">{status}</div>
                  {isRunning ? (
                    <div className="flex items-center justify-between text-[10px] font-black text-[#ffc84a]/75">
                      <span>Cặp có thể ăn</span>
                      <span className="text-[#ffdd2f]">{playablePairCount}</span>
                    </div>
                  ) : null}
                </div>

                <div className="mb-4 mt-3 rounded-md border border-[#995018]/70 bg-[#2a0e05]/70 p-1">
                  <div className="text-[10px] font-black uppercase text-[#ffc84a]/70">Thông tin</div>
                  <div className="grid grid-cols-1 text-[11px]">
                    <SideStat label="Tên" value={playerName || 'No Name'} />
                    <SideStat label="Còn lại" value={String(remainingTiles)} />
                    <SideStat label="Luot Doi" value={String(shufflesLeft)} />
                  </div>
                </div>

                <ArcadeButton icon={RefreshCw} onClick={handleRequestReload} label="Reload Game" />
              </div>
            </aside>

            <section className="pikachu-board-stage relative min-w-0 flex-1 bg-[#2b0d05]/60 transition-all duration-200">
              {!showStartOverlay ? (
                <div className="absolute flex gap-2 items-center right-14 top-3 z-10 rounded-md border border-[#ffdd2f]/35 bg-[#2a0e05]/80 px-2 text-right shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-[2px]">
                  <div className="text-[10px] font-black uppercase text-[#ffc84a]/75">Điểm</div>
                  <div className="text-base font-black leading-none text-[#ffdd2f] lg:text-lg xl:text-xl">
                    {score.toLocaleString('vi-VN')}
                  </div>
                </div>
              ) : null}

              {!shouldHideBoard ? (
                <div className="p-2 text-center text-2xl font-bold text-white lg:p-3 lg:text-[1.5rem] xl:p-4 xl:text-[1.75rem]">
                  Màn {String(currentLevel)}
                </div>
              ) : null}

              <PikachuBoard
                board={board}
                difficulty={difficulty}
                selected={selected}
                inactivePositions={inactivePositions}
                hint={hint}
                canInteract={canInteract}
                shouldHideBoard={shouldHideBoard}
                timeProgress={timeProgress}
                onTileClick={handleTileClick}
              />

              {showStartOverlay ? (
                <StartOverlay
                  playerName={playerName}
                  highScore={highScore}
                  highestLevel={highestLevel}
                  difficulty={difficulty}
                  playButtonLabel={playButtonLabel}
                  leaderboard={leaderboard}
                  isLeaderboardLoading={isLeaderboardLoading}
                  leaderboardError={leaderboardError}
                  isDifficultyModalOpen={showDifficultyModal}
                  onDifficultyOpen={() => setShowDifficultyModal(true)}
                  onStart={handleToggleGameRunning}
                />
              ) : isLevelCompleteWaiting ? (
                <ActionModal
                  icon={<Trophy className="h-6 w-6" aria-hidden="true" />}
                  title={`Hoàn thành màn ${completedLevel}`}
                  description={`Sẵn sàng chơi màn ${currentLevel}: ${currentLevelConfig.title}`}
                  actions={
                    <button
                      type="button"
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c]"
                      onClick={handleContinueNextLevel}
                    >
                      <Play className="h-4 w-4" aria-hidden="true" />
                      Tiếp tục
                    </button>
                  }
                />
              ) : showPauseOverlay ? (
                <ActionModal
                  icon={<Pause className="h-6 w-6" aria-hidden="true" />}
                  title="Tạm dừng"
                  actions={
                    <div className="grid gap-2">
                      <button
                        type="button"
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c]"
                        onClick={handleToggleGameRunning}
                      >
                        <Play className="h-4 w-4" aria-hidden="true" />
                        Tiếp tục
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#ffdd2f]/35 bg-[#2a0e05]/88 px-4 text-sm font-semibold text-[#fff1a6] shadow-sm transition hover:bg-[#3a1609]"
                        onClick={() => handleRequestRestart()}
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Chơi lại
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#ffdd2f]/35 bg-[#2a0e05]/88 px-4 text-sm font-semibold text-[#fff1a6] shadow-sm transition hover:bg-[#3a1609]"
                        onClick={handleBackHome}
                      >
                        <House className="h-4 w-4" aria-hidden="true" />
                        Trang Chủ
                      </button>
                    </div>
                  }
                />
              ) : result !== 'playing' ? (
                <ActionModal
                  icon={
                    result === 'won' ? (
                      <Trophy className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <RefreshCw className="h-6 w-6" aria-hidden="true" />
                    )
                  }
                  title={result === 'won' ? 'Hoàn thành' : 'Game Over'}
                  description={`Điểm: ${score.toLocaleString('vi-VN')} | Kỷ lục: ${highScore.toLocaleString('vi-VN')}`}
                  actions={
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c]"
                      onClick={() => handleRequestRestart(true)}
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      Choi lai
                    </button>
                  }
                >
                  <p className="mt-1 text-sm font-medium text-[#ffd24a]/85">Màn cao nhất: {highestLevel}</p>
                </ActionModal>
              ) : showNoPairsModal ? (
                <ActionModal
                  icon={<Shuffle className="h-6 w-6" aria-hidden="true" />}
                  title="Hết cặp có thể ăn"
                  description="Bố cục hiện tại không còn cặp hợp lệ. Hãy xáo lại để chơi tiếp."
                  actions={
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c]"
                      onClick={handleShuffle}
                    >
                      <Shuffle className="h-4 w-4" aria-hidden="true" />
                      Xáo lại
                    </button>
                  }
                />
              ) : null}

              {showDifficultyModal ? (
                <DifficultyModal
                  value={difficultyId}
                  difficulties={DIFFICULTIES}
                  onChange={(nextDifficultyId) => {
                    setShowDifficultyModal(false)
                    setPendingDifficultyId(nextDifficultyId)
                  }}
                  onClose={() => setShowDifficultyModal(false)}
                />
              ) : null}

              {pendingDifficulty ? (
                <ActionModal
                  overlayClassName="z-40"
                  icon={<Settings className="h-6 w-6" aria-hidden="true" />}
                  title="Đổi mức chơi?"
                  description={`Nếu đổi sang ${pendingDifficulty.label}, màn hiện tại sẽ bị mất và game sẽ bắt đầu lại.`}
                  actions={
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-md border border-[#ffdd2f]/35 bg-[#2a0e05]/88 px-4 text-sm font-semibold text-[#fff1a6] shadow-sm transition hover:bg-[#3a1609]"
                        onClick={() => setPendingDifficultyId(null)}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-md bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c]"
                        onClick={() => {
                          const nextDifficultyId = pendingDifficulty.id

                          setPendingDifficultyId(null)
                          handleDifficultyChange(nextDifficultyId)
                        }}
                      >
                        Xác nhận
                      </button>
                    </div>
                  }
                />
              ) : null}

              {showSettingsModal ? (
                <SettingsModal
                  activeTab={activeSettingsTab}
                  gameSettings={gameSettings}
                  isInstalled={isInstalled}
                  onTabChange={handleSettingsTabChange}
                  onApplyAudioSettings={handleApplyAudioSettings}
                  onInstallApp={() => {
                    void handleInstallApp()
                  }}
                  onClose={handleCloseSettings}
                />
              ) : null}

              {confirmAction ? (
                <ActionModal
                  overlayClassName="z-40"
                  icon={
                    confirmAction.type === 'restart' ? (
                      <RotateCcw className="h-6 w-6" aria-hidden="true" />
                    ) : confirmAction.type === 'shuffle' ? (
                      <Shuffle className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <RefreshCw className="h-6 w-6" aria-hidden="true" />
                    )
                  }
                  title={
                    confirmAction.type === 'restart'
                      ? 'Chơi lại?'
                      : confirmAction.type === 'shuffle'
                        ? 'Xáo lại?'
                        : 'Reload game?'
                  }
                  description={
                    confirmAction.type === 'restart'
                      ? 'Bạn có chắc muốn chơi lại? Ván hiện tại sẽ bắt đầu lại từ đầu.'
                      : confirmAction.type === 'shuffle'
                        ? 'Vẫn còn cặp có thể ăn được. Bạn có chắc muốn dùng một lượt xáo?'
                        : 'Bạn có chắc muốn reload game? Trang sẽ được tải lại ngay.'
                  }
                  actions={
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-md border border-[#ffdd2f]/35 bg-[#2a0e05]/88 px-4 text-sm font-semibold text-[#fff1a6] shadow-sm transition hover:bg-[#3a1609]"
                        onClick={handleCloseConfirm}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c]"
                        onClick={handleConfirmAction}
                      >
                        {confirmAction.type === 'restart' ? (
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        ) : confirmAction.type === 'shuffle' ? (
                          <Shuffle className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        )}
                        Xác nhận
                      </button>
                    </div>
                  }
                />
              ) : null}
            </section>
          </main>
        </div>
      </div>
    </section>
  )
}
