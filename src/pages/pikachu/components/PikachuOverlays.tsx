import type { ReactNode } from 'react'
import { Check, Download, Music2, Play, Settings, Trophy, Volume2, VolumeX } from 'lucide-react'

import type { PikachuLeaderboardEntry } from '@/services/pikachu.service'

import type { DifficultyConfig, DifficultyId, GameSettings, SettingsTab } from '../types'

type PlayerNameModalProps = {
  playerNameDraft: string
  onChange: (value: string) => void
  onSave: () => void
}

type StartOverlayProps = {
  playerName: string
  highScore: number
  highestLevel: number
  difficulty: DifficultyConfig
  playButtonLabel: string
  leaderboard: PikachuLeaderboardEntry[]
  isLeaderboardLoading: boolean
  leaderboardError: string | null
  isDifficultyModalOpen: boolean
  onDifficultyOpen: () => void
  onStart: () => void
}

type SettingsModalProps = {
  activeTab: SettingsTab
  gameSettings: GameSettings
  isInstalled: boolean
  onTabChange: (tab: SettingsTab) => void
  onApplyAudioSettings: (
    updates: Partial<Pick<GameSettings, 'musicEnabled' | 'soundEnabled' | 'musicVolume' | 'soundVolume'>>,
  ) => void
  onInstallApp: () => void
  onClose: () => void
}

type ActionModalProps = {
  icon: ReactNode
  title: string
  description?: ReactNode
  actions: ReactNode
  children?: ReactNode
  overlayClassName?: string
}

type DifficultySelectProps = {
  difficulty: DifficultyConfig
  isOpen: boolean
  onOpen: () => void
}

type DifficultyModalProps = {
  value: DifficultyId
  difficulties: DifficultyConfig[]
  onChange: (nextDifficultyId: DifficultyId) => void
  onClose: () => void
}

function ModalBackdrop({ children }: { children: ReactNode }) {
  return <div className="pikachu-modal-backdrop absolute inset-0 z-30 flex items-center justify-center rounded-lg p-4">{children}</div>
}

function DifficultySelect({ difficulty, isOpen, onOpen }: DifficultySelectProps) {
  return (
    <button
      type="button"
      id="pikachu-difficulty-select"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-[#ffdd2f]/35 bg-[#2a0e05]/88 px-3 py-2 text-left text-sm font-semibold text-[#fff1a6] shadow-sm outline-none transition hover:bg-[#3a1609] focus-visible:border-[#ffdd2f]"
      onClick={onOpen}
    >
      <span className="min-w-0">
        <span className="block truncate text-[#fff1a6]">{difficulty.label}</span>
      </span>
      <span className="shrink-0 rounded-md border border-[#ffdd2f]/35 px-2 py-1 text-xs font-black text-[#ffdd2f]">Đổi</span>
    </button>
  )
}

export function DifficultyModal({ value, difficulties, onChange, onClose }: DifficultyModalProps) {
  return (
    <ModalBackdrop>
      <div className="pikachu-glow-modal w-full max-w-md rounded-lg border border-[#ffdd2f]/40 bg-[#351609] p-5 shadow-xl">
        <div className="text-center">
          <div className="text-xl font-bold text-[#ffdd2f]">Chọn mức chơi</div>
        </div>
        <div className="mt-4 grid gap-2 justify-center">
          {difficulties.map((difficultyOption) => {
            const isSelected = difficultyOption.id === value

            return (
              <button
                key={difficultyOption.id}
                type="button"
                className={`flex w-50 items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
                  isSelected
                    ? 'border-[#ffdd2f]/65 bg-[#f97316] text-white'
                    : 'border-[#ffdd2f]/25 bg-[#2a0e05]/88 text-[#fff1a6] hover:bg-[#3a1609]'
                }`}
                onClick={() => {
                  if (isSelected) {
                    onClose()
                    return
                  }

                  onChange(difficultyOption.id)
                }}
              >
                <span className="min-w-0 flex items-center gap-2">
                  <span className="block truncate">{difficultyOption.label}</span>
                  <span className={`mt-0.5 block truncate text-xs ${isSelected ? 'text-white/80' : 'text-[#ffc84a]/75'}`}>
                    {difficultyOption.timeLimit}s
                  </span>
                </span>
                {isSelected ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
              </button>
            )
          })}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="col-span-2 inline-flex h-10 items-center justify-center rounded-md border border-[#ffdd2f]/35 bg-[#2a0e05]/88 px-4 text-sm font-semibold text-[#fff1a6] shadow-sm transition hover:bg-[#3a1609]"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  )
}

export function ActionModal({ icon, title, description, actions, children, overlayClassName }: ActionModalProps) {
  return (
    <div
      className={`pikachu-modal-backdrop absolute inset-0 flex items-center justify-center rounded-lg p-4 ${
        overlayClassName || 'z-30'
      }`}
    >
      <div className="pikachu-glow-modal w-full max-w-sm rounded-lg border border-[#ffdd2f]/40 bg-[#351609] p-5 text-center shadow-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-[#4a1b0c] text-[#ffdd2f]">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-[#ffdd2f]">{title}</h2>
        {description ? <div className="mt-2 text-sm font-medium text-[#ffd24a]/85">{description}</div> : null}
        {children}
        <div className="mt-4">{actions}</div>
      </div>
    </div>
  )
}

export function PlayerNameModal({ playerNameDraft, onChange, onSave }: PlayerNameModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#160703] p-4 backdrop-blur-sm">
      <div className="pikachu-glow-modal w-full max-w-md rounded-lg border border-[#ffdd2f]/40 bg-[#351609] p-5 shadow-xl">
        <div className="text-center">
          <div className="text-xl font-bold text-[#ffdd2f]">Thông tin người chơi</div>
        </div>
        <div className="mt-4">
          <label className="text-xs font-black uppercase text-[#ffc84a]/70" htmlFor="pikachu-player-name">
            Nick Name
          </label>
          <input
            id="pikachu-player-name"
            type="text"
            value={playerNameDraft}
            maxLength={40}
            autoFocus
            className="mt-2 h-11 w-full rounded-md border border-[#995018]/80 bg-[#2a0e05]/80 px-3 text-sm font-semibold text-[#fff1a6] outline-none transition focus:border-[#ffdd2f]"
            placeholder="Ví dụ: Harry Porter"
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSave()
              }
            }}
          />
        </div>
        <button
          type="button"
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c]"
          onClick={onSave}
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          Lưu tên người chơi
        </button>
      </div>
    </div>
  )
}

export function StartOverlay({
  playerName,
  highScore,
  highestLevel,
  difficulty,
  playButtonLabel,
  leaderboard,
  isLeaderboardLoading,
  leaderboardError,
  isDifficultyModalOpen,
  onDifficultyOpen,
  onStart,
}: StartOverlayProps) {
  return (
    <ModalBackdrop>
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-y-auto rounded-lg border border-[#ffdd2f] p-5 text-center shadow-xl">
        <h2 className="text-center text-3xl font-black uppercase text-[#ffdd2f] drop-shadow-[0_3px_0_rgba(87,29,8,0.85)]">
          PI KA PI KA
        </h2>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-md border border-[#ffdd2f]/35 bg-[#160703] p-4 text-left shadow-[0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur-[2px]">
              <div className="flex items-center gap-3">
                <div className="min-w-0">
                  <div className="text-sm">Pi ka Pi ka, Xin Chào</div>
                  <div className="truncate text-xl font-black text-[#fff1a6]">{playerName || 'No Name'}</div>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm font-bold text-[#fff1a6]">
                <div className="flex items-center justify-between gap-3 rounded-md border border-[#995018]/70 bg-[#2a0e05]/76 px-3 py-2">
                  <span>Điểm cao nhất</span>
                  <span className="text-[#ffdd2f]">{highScore.toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md border border-[#995018]/70 bg-[#2a0e05]/76 px-3 py-2">
                  <span>Màn chơi cao nhất</span>
                  <span className="text-[#ffdd2f]">Màn {highestLevel}</span>
                </div>
              </div>
              <div className="mt-4">
                <label
                  id="pikachu-difficulty-label"
                  htmlFor="pikachu-difficulty-select"
                  className="mb-2 block text-sm font-black uppercase tracking-wide text-[#ffc84a]"
                >
                  Mức chơi
                </label>
                <DifficultySelect
                  difficulty={difficulty}
                  isOpen={isDifficultyModalOpen}
                  onOpen={onDifficultyOpen}
                />
              </div>
              <button
                type="button"
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c]"
                onClick={onStart}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                {playButtonLabel}
              </button>
            </div>
          </div>
          <div className="rounded-md border border-[#ffdd2f]/35 bg-[#160703] p-3 text-left shadow-[0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur-[2px]">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-black text-[#ffdd2f]">
                <Trophy className="h-4 w-4" aria-hidden="true" />
                Bảng xếp hạng
              </div>
              <div className="text-xs font-black text-[#ffc84a]/75">Top 10</div>
            </div>
            <div className="h-[60vh] overflow-auto">
              <div className="mt-3 grid gap-1.5">
                {isLeaderboardLoading ? (
                  <div className="rounded-md border border-[#995018]/60 bg-[#2a0e05]/70 px-3 py-2 text-center text-xs font-bold text-[#ffd24a]/80">
                    Đang tải bảng xếp hạng
                  </div>
                ) : leaderboardError ? (
                  <div className="rounded-md border border-[#995018]/60 bg-[#2a0e05]/70 px-3 py-2 text-center text-xs font-bold text-[#ffd24a]/80">
                    {leaderboardError}
                  </div>
                ) : leaderboard.length > 0 ? (
                  leaderboard.map((entry) => {
                    const isCurrentPlayer = entry.playerName === playerName

                    return (
                      <div
                        key={`${entry.rank}-${entry.playerName}`}
                        className={`grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md border px-2 py-1.5 text-xs font-bold ${
                          isCurrentPlayer
                            ? 'border-[#ffdd2f]/65 bg-[#5a3309]/85 text-[#fff1a6]'
                            : 'border-[#995018]/55 bg-[#2a0e05]/68 text-[#ffd24a]/86'
                        }`}
                      >
                        <div className="text-center text-[#ffdd2f]">#{entry.rank}</div>
                        <div className="min-w-0">
                          <div className="truncate text-[#fff1a6]">{entry.playerName}</div>
                          <div className="text-[10px] text-[#ffc84a]/72">Màn {entry.highestLevel} · {entry.gamesPlayed} lượt</div>
                        </div>
                        <div className="text-right text-[#ffdd2f]">{entry.score.toLocaleString('vi-VN')}</div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-md border border-[#995018]/60 bg-[#2a0e05]/70 px-3 py-2 text-center text-xs font-bold text-[#ffd24a]/80">
                    Chưa có dữ liệu xếp hạng
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  )
}

export function SettingsModal({
  activeTab,
  gameSettings,
  isInstalled,
  onTabChange,
  onApplyAudioSettings,
  onInstallApp,
  onClose,
}: SettingsModalProps) {
  return (
    <ModalBackdrop>
      <div className="pikachu-glow-modal w-full max-w-sm rounded-lg border border-[#ffdd2f]/40 bg-[#351609] p-5 shadow-xl">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#4a1b0c] text-[#ffdd2f]">
            <Settings className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="text-xl font-black text-[#ffdd2f]">Cài đặt game</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-md border border-[#995018]/70 bg-[#2a0e05]/70">
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-md px-3 text-sm font-semibold transition ${
              activeTab === 'audio' ? 'bg-[#f97316] text-white shadow-sm' : 'text-[#fff1a6] hover:bg-[#3a1609]'
            }`}
            onClick={() => onTabChange('audio')}
          >
            Âm thanh
          </button>
          <button
            type="button"
            className={`inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-semibold transition ${
              activeTab === 'app' ? 'bg-[#f97316] text-white shadow-sm' : 'text-[#fff1a6] hover:bg-[#3a1609]'
            }`}
            onClick={() => onTabChange('app')}
          >
            Ứng dụng
          </button>
        </div>
        {activeTab === 'audio' ? (
          <div className="mt-4 grid gap-4">
            <div className="rounded-md border border-[#995018]/70 bg-[#2a0e05]/70 p-2">
              <div className="mb-2 flex items-center justify-between text-xs font-black text-[#ffc84a]/75">
                <span className="flex">
                  <Music2 className="h-4 w-4" aria-hidden="true" />
                  Âm lượng nhạc
                </span>
                <span>{gameSettings.musicVolume}%</span>
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gameSettings.musicVolume}
                  className="w-full accent-[#f97316]"
                  onChange={(event) => {
                    onApplyAudioSettings({ musicVolume: Number(event.target.value) })
                  }}
                />
                <button
                  type="button"
                  className={`inline-flex min-w-[50px] items-center justify-center rounded-md px-3 text-sm font-semibold transition ${
                    gameSettings.musicEnabled
                      ? 'border bg-[#f97316] text-white hover:bg-[#ea580c]'
                      : 'border border-[#ffdd2f]/35 bg-[#2a0e05]/88 text-[#fff1a6] hover:bg-[#3a1609]'
                  }`}
                  onClick={() => {
                    onApplyAudioSettings({ musicEnabled: !gameSettings.musicEnabled })
                  }}
                >
                  {gameSettings.musicEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
            <div className="rounded-md border border-[#995018]/70 bg-[#2a0e05]/70 p-2">
              <div className="mb-2 flex items-center justify-between text-xs font-black text-[#ffc84a]/75">
                <span className="flex items-center gap-1">
                  {gameSettings.soundEnabled ? (
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <VolumeX className="h-4 w-4" aria-hidden="true" />
                  )}
                  Âm lượng hiệu ứng
                </span>
                <span>{gameSettings.soundVolume}%</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gameSettings.soundVolume}
                  className="w-full accent-[#f97316]"
                  onChange={(event) => {
                    onApplyAudioSettings({ soundVolume: Number(event.target.value) })
                  }}
                />
                <button
                  type="button"
                  className={`inline-flex min-w-[50px] items-center justify-center rounded-md px-3 text-sm font-semibold transition ${
                    gameSettings.soundEnabled
                      ? 'border bg-[#f97316] text-white hover:bg-[#ea580c]'
                      : 'border border-[#ffdd2f]/35 bg-[#2a0e05]/88 text-[#fff1a6] hover:bg-[#3a1609]'
                  }`}
                  onClick={() => {
                    onApplyAudioSettings({ soundEnabled: !gameSettings.soundEnabled })
                  }}
                >
                  {gameSettings.soundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            <div className="rounded-md border border-[#995018]/70 bg-[#2a0e05]/70 p-4">
              <div className="text-sm font-black uppercase text-[#ffc84a]">Cài đặt ứng dụng</div>
              <div className="mt-2 text-sm font-semibold text-[#ffd24a]/75">
                Cài đặt game ra màn hình chính để vào nhanh hơn.
              </div>
              <button
                type="button"
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#ffdd2f]/35 bg-[#2a0e05]/88 px-4 text-sm font-semibold text-[#fff1a6] shadow-sm transition hover:bg-[#3a1609]"
                onClick={onInstallApp}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {isInstalled ? 'Đã cài đặt app' : 'Cài đặt app'}
              </button>
            </div>
          </div>
        )}
        <div className="mt-5">
          <button
            type="button"
            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-[#ffdd2f]/35 bg-[#2a0e05]/88 px-4 text-sm font-semibold text-[#fff1a6] shadow-sm transition hover:bg-[#3a1609]"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}
