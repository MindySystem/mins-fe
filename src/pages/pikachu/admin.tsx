import { useCallback, useEffect, useMemo, useState } from 'react'
import { Image, Plus, RefreshCw, Save, Settings2, Trash2 } from 'lucide-react'

import {
  pikachuService,
  type PikachuAdminConfigResponse,
  type PikachuAdminDifficulty,
  type PikachuAdminLevel,
  type PikachuDifficultyPayload,
  type PikachuLevelPayload,
  type PikachuModeAssetPayload,
  type PikachuModePayload,
} from '@/services/pikachu.service'
import type { PikachuMode, PikachuModeAsset } from './types'

type ModeFormState = PikachuModePayload & {
  id?: string
}

type DeleteTarget =
  | { type: 'mode'; mode: PikachuMode }
  | { type: 'asset'; mode: PikachuMode; asset: PikachuModeAsset }

const arrangementOptions = [
  'none',
  'down',
  'up',
  'left',
  'right',
  'center-vertical',
  'edges-vertical',
  'center-horizontal',
  'edges-horizontal',
] as const

const emptyModeForm: ModeFormState = {
  code: '',
  name: '',
  description: '',
  tileSource: 'image',
  isDefault: false,
  isEnabled: true,
  sortOrder: 0,
}

const emptyAssetForm: PikachuModeAssetPayload = {
  symbolId: '',
  label: '',
  imageSrc: '',
  iconName: '',
  color: '',
  bg: '',
  ring: '',
  glow: '',
  sortOrder: 0,
}

function toModeForm(mode: PikachuMode): ModeFormState {
  return {
    id: mode.id,
    code: mode.code,
    name: mode.name,
    description: mode.description || '',
    tileSource: mode.tileSource,
    isDefault: mode.isDefault,
    isEnabled: mode.isEnabled,
    sortOrder: mode.sortOrder ?? 0,
    version: mode.version,
  }
}

function toAssetForm(asset: PikachuModeAsset): PikachuModeAssetPayload {
  return {
    symbolId: asset.symbolId,
    label: asset.label,
    imageSrc: asset.imageSrc || '',
    iconName: asset.iconName || '',
    color: asset.color || '',
    bg: asset.bg || '',
    ring: asset.ring || '',
    glow: asset.glow || '',
    sortOrder: asset.sortOrder,
  }
}

function modePayload(form: ModeFormState): PikachuModePayload {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    description: form.description?.trim() || null,
    tileSource: form.tileSource,
    isDefault: Boolean(form.isDefault),
    isEnabled: Boolean(form.isEnabled),
    sortOrder: Number(form.sortOrder || 0),
    version: form.version?.trim() || undefined,
  }
}

function assetPayload(form: PikachuModeAssetPayload): PikachuModeAssetPayload {
  return {
    symbolId: form.symbolId.trim(),
    label: form.label.trim(),
    imageSrc: form.imageSrc?.trim() || null,
    iconName: form.iconName?.trim() || null,
    color: form.color?.trim() || null,
    bg: form.bg?.trim() || null,
    ring: form.ring?.trim() || null,
    glow: form.glow?.trim() || null,
    sortOrder: Number(form.sortOrder || 0),
  }
}

export default function PikachuAdminPage() {
  const [config, setConfig] = useState<PikachuAdminConfigResponse | null>(null)
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null)
  const [modeForm, setModeForm] = useState<ModeFormState>(emptyModeForm)
  const [assetForm, setAssetForm] = useState<PikachuModeAssetPayload>(emptyAssetForm)
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null)
  const [difficultyDrafts, setDifficultyDrafts] = useState<Record<string, PikachuDifficultyPayload>>({})
  const [levelDrafts, setLevelDrafts] = useState<Record<number, PikachuLevelPayload>>({})
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const selectedMode = useMemo(
    () => config?.modes.find((mode) => mode.id === selectedModeId) || null,
    [config?.modes, selectedModeId],
  )

  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await pikachuService.getAdminConfig()

      setConfig(response)
      setDifficultyDrafts(
        response.difficulties.reduce<Record<string, PikachuDifficultyPayload>>((drafts, difficulty) => {
          drafts[difficulty.id] = {
            label: difficulty.label,
            rows: difficulty.rows,
            cols: difficulty.cols,
            timeLimit: difficulty.timeLimit,
            hints: difficulty.hints,
            shuffles: difficulty.shuffles,
            symbolCount: difficulty.symbolCount,
            isEnabled: difficulty.isEnabled,
            sortOrder: difficulty.sortOrder,
          }

          return drafts
        }, {}),
      )
      setLevelDrafts(
        response.levels.reduce<Record<number, PikachuLevelPayload>>((drafts, level) => {
          drafts[level.level] = {
            title: level.title,
            shortTitle: level.shortTitle,
            arrangement: level.arrangement,
            isEnabled: level.isEnabled,
            sortOrder: level.sortOrder,
          }

          return drafts
        }, {}),
      )
      setSelectedModeId((current) =>
        current && response.modes.some((mode) => mode.id === current) ? current : response.modes[0]?.id || null,
      )
    } catch {
      setMessage('Không tải được cấu hình Pikachu')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadConfig()
  }, [loadConfig])

  useEffect(() => {
    setModeForm(selectedMode ? toModeForm(selectedMode) : emptyModeForm)
    setAssetForm(emptyAssetForm)
    setEditingAssetId(null)
  }, [selectedMode])

  async function saveMode() {
    const payload = modePayload(modeForm)

    if (!payload.code || !payload.name) {
      setMessage('Vui lòng nhập code và tên mode')
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      if (modeForm.id) {
        await pikachuService.updateMode(modeForm.id, payload)
        setMessage('Đã cập nhật mode')
      } else {
        await pikachuService.createMode(payload)
        setMessage('Đã tạo mode')
      }

      await loadConfig()
    } catch {
      setMessage('Không lưu được mode')
    } finally {
      setIsSaving(false)
    }
  }

  async function saveAsset() {
    if (!selectedMode) return

    const payload = assetPayload(assetForm)

    if (!payload.symbolId || !payload.label) {
      setMessage('Vui lòng nhập symbolId và label asset')
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      if (editingAssetId) {
        await pikachuService.updateAsset(selectedMode.id, editingAssetId, payload)
        setMessage('Đã cập nhật asset')
      } else {
        await pikachuService.createAsset(selectedMode.id, payload)
        setMessage('Đã thêm asset')
      }

      await loadConfig()
    } catch {
      setMessage('Không lưu được asset')
    } finally {
      setIsSaving(false)
    }
  }

  async function saveDifficulty(difficulty: PikachuAdminDifficulty) {
    setIsSaving(true)
    setMessage(null)

    try {
      await pikachuService.updateDifficulty(difficulty.id, difficultyDrafts[difficulty.id] || {})
      setMessage(`Đã cập nhật mức ${difficulty.label}`)
      await loadConfig()
    } catch {
      setMessage('Không cập nhật được mức độ')
    } finally {
      setIsSaving(false)
    }
  }

  async function saveLevel(level: PikachuAdminLevel) {
    setIsSaving(true)
    setMessage(null)

    try {
      await pikachuService.updateLevel(level.level, levelDrafts[level.level] || {})
      setMessage(`Đã cập nhật màn ${level.level}`)
      await loadConfig()
    } catch {
      setMessage('Không cập nhật được màn chơi')
    } finally {
      setIsSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    setIsSaving(true)
    setMessage(null)

    try {
      if (deleteTarget.type === 'mode') {
        await pikachuService.deleteMode(deleteTarget.mode.id)
        setMessage('Đã xóa mode')
      } else {
        await pikachuService.deleteAsset(deleteTarget.mode.id, deleteTarget.asset.id)
        setMessage('Đã xóa asset')
      }

      setDeleteTarget(null)
      await loadConfig()
    } catch {
      setMessage('Không xóa được dữ liệu')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-dvh bg-zinc-950 px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-amber-300">Game / Pikachu</p>
            <h1 className="text-2xl font-bold tracking-normal text-white">Quản lý cấu hình Pikachu</h1>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-4 text-sm font-semibold text-zinc-100 hover:bg-zinc-900"
            onClick={() => void loadConfig()}
            disabled={isLoading || isSaving}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Tải lại
          </button>
        </header>

        {message ? (
          <div className="rounded-md border border-amber-400/35 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100">
            {message}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-md border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-300">Đang tải cấu hình...</div>
        ) : config ? (
          <>
            <section className="grid gap-3 sm:grid-cols-4">
              <AdminStat label="Mode" value={config.stats.modes} />
              <AdminStat label="Mode bật" value={config.stats.enabledModes} />
              <AdminStat label="Điểm đã lưu" value={config.stats.scores} />
              <AdminStat label="Offline sync" value={config.stats.offlineSyncedScores} />
            </section>

            <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold uppercase text-zinc-300">Modes</h2>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 text-zinc-100 hover:bg-zinc-800"
                    onClick={() => {
                      setSelectedModeId(null)
                      setModeForm(emptyModeForm)
                      setAssetForm(emptyAssetForm)
                      setEditingAssetId(null)
                    }}
                    aria-label="Thêm mode"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="space-y-2">
                  {config.modes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                        mode.id === selectedModeId
                          ? 'border-amber-300 bg-amber-300/10 text-amber-100'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-600'
                      }`}
                      onClick={() => setSelectedModeId(mode.id)}
                    >
                      <span className="block font-semibold">{mode.name}</span>
                      <span className="block text-xs text-zinc-400">{mode.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
                  <SectionTitle icon={Settings2} title={modeForm.id ? 'Sửa mode' : 'Thêm mode'} />
                  <div className="mt-4 grid gap-3">
                    <TextInput label="Code" value={modeForm.code} onChange={(code) => setModeForm((current) => ({ ...current, code }))} />
                    <TextInput label="Tên mode" value={modeForm.name} onChange={(name) => setModeForm((current) => ({ ...current, name }))} />
                    <TextArea
                      label="Mô tả"
                      value={modeForm.description || ''}
                      onChange={(description) => setModeForm((current) => ({ ...current, description }))}
                    />
                    <label className="grid gap-1 text-sm font-semibold text-zinc-300">
                      Nguồn tile
                      <select
                        className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        value={modeForm.tileSource}
                        onChange={(event) =>
                          setModeForm((current) => ({ ...current, tileSource: event.target.value as 'icon' | 'image' }))
                        }
                      >
                        <option value="image">Image</option>
                        <option value="icon">Icon</option>
                      </select>
                    </label>
                    <NumberInput
                      label="Thứ tự"
                      value={modeForm.sortOrder || 0}
                      onChange={(sortOrder) => setModeForm((current) => ({ ...current, sortOrder }))}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <ToggleInput
                        label="Bật mode"
                        checked={Boolean(modeForm.isEnabled)}
                        onChange={(isEnabled) => setModeForm((current) => ({ ...current, isEnabled }))}
                      />
                      <ToggleInput
                        label="Mặc định"
                        checked={Boolean(modeForm.isDefault)}
                        onChange={(isDefault) => setModeForm((current) => ({ ...current, isDefault }))}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-amber-400 px-4 text-sm font-bold text-zinc-950 hover:bg-amber-300 disabled:opacity-60"
                        onClick={() => void saveMode()}
                        disabled={isSaving}
                      >
                        <Save className="h-4 w-4" aria-hidden="true" />
                        Lưu mode
                      </button>
                      {selectedMode ? (
                        <button
                          type="button"
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-rose-500/70 px-4 text-sm font-bold text-rose-200 hover:bg-rose-500/10 disabled:opacity-60"
                          onClick={() => setDeleteTarget({ type: 'mode', mode: selectedMode })}
                          disabled={isSaving || selectedMode.isDefault}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Xóa mode
                        </button>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
                  <SectionTitle icon={Image} title="Assets của mode" />
                  {selectedMode ? (
                    <>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <TextInput
                          label="Symbol ID"
                          value={assetForm.symbolId}
                          onChange={(symbolId) => setAssetForm((current) => ({ ...current, symbolId }))}
                        />
                        <TextInput
                          label="Label"
                          value={assetForm.label}
                          onChange={(label) => setAssetForm((current) => ({ ...current, label }))}
                        />
                        <TextInput
                          label="Image src"
                          value={assetForm.imageSrc || ''}
                          onChange={(imageSrc) => setAssetForm((current) => ({ ...current, imageSrc }))}
                        />
                        <TextInput
                          label="Icon name"
                          value={assetForm.iconName || ''}
                          onChange={(iconName) => setAssetForm((current) => ({ ...current, iconName }))}
                        />
                        <NumberInput
                          label="Thứ tự"
                          value={assetForm.sortOrder || 0}
                          onChange={(sortOrder) => setAssetForm((current) => ({ ...current, sortOrder }))}
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-amber-400 px-4 text-sm font-bold text-zinc-950 hover:bg-amber-300 disabled:opacity-60"
                          onClick={() => void saveAsset()}
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4" aria-hidden="true" />
                          {editingAssetId ? 'Lưu asset' : 'Thêm asset'}
                        </button>
                        {editingAssetId ? (
                          <button
                            type="button"
                            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200 hover:bg-zinc-800"
                            onClick={() => {
                              setAssetForm(emptyAssetForm)
                              setEditingAssetId(null)
                            }}
                          >
                            Hủy sửa
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-4 max-h-[440px] overflow-auto rounded-md border border-zinc-800">
                        {selectedMode.assets.map((asset) => (
                          <div
                            key={asset.id}
                            className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-b border-zinc-800 px-3 py-2 last:border-b-0"
                          >
                            <button
                              type="button"
                              className="min-w-0 text-left"
                              onClick={() => {
                                setAssetForm(toAssetForm(asset))
                                setEditingAssetId(asset.id)
                              }}
                            >
                              <span className="block truncate text-sm font-semibold text-zinc-100">{asset.label}</span>
                              <span className="block truncate text-xs text-zinc-500">
                                {asset.symbolId} {asset.imageSrc ? `- ${asset.imageSrc}` : ''}
                              </span>
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-500/60 text-rose-200 hover:bg-rose-500/10"
                              onClick={() => setDeleteTarget({ type: 'asset', mode: selectedMode, asset })}
                              aria-label="Xóa asset"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="mt-4 text-sm text-zinc-400">Chọn một mode để quản lý asset.</p>
                  )}
                </section>
              </div>
            </section>

            <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
              <SectionTitle icon={Settings2} title="Mức độ chơi" />
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {config.difficulties.map((difficulty) => {
                  const draft = difficultyDrafts[difficulty.id] || {}

                  return (
                    <div key={difficulty.id} className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
                      <TextInput
                        label="Tên"
                        value={String(draft.label ?? '')}
                        onChange={(label) =>
                          setDifficultyDrafts((current) => ({
                            ...current,
                            [difficulty.id]: { ...draft, label },
                          }))
                        }
                      />
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {(['rows', 'cols', 'timeLimit', 'hints', 'shuffles', 'symbolCount', 'sortOrder'] as const).map((key) => (
                          <NumberInput
                            key={key}
                            label={key}
                            value={Number(draft[key] ?? 0)}
                            onChange={(value) =>
                              setDifficultyDrafts((current) => ({
                                ...current,
                                [difficulty.id]: { ...draft, [key]: value },
                              }))
                            }
                          />
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <ToggleInput
                          label="Enabled"
                          checked={Boolean(draft.isEnabled)}
                          onChange={(isEnabled) =>
                            setDifficultyDrafts((current) => ({
                              ...current,
                              [difficulty.id]: { ...draft, isEnabled },
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-zinc-100 px-3 text-sm font-bold text-zinc-950 hover:bg-white disabled:opacity-60"
                          onClick={() => void saveDifficulty(difficulty)}
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4" aria-hidden="true" />
                          Lưu
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
              <SectionTitle icon={Settings2} title="Màn chơi" />
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {config.levels.map((level) => {
                  const draft = levelDrafts[level.level] || {}

                  return (
                    <div key={level.level} className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
                      <div className="mb-2 text-sm font-bold text-amber-200">Màn {level.level}</div>
                      <TextInput
                        label="Title"
                        value={String(draft.title ?? '')}
                        onChange={(title) =>
                          setLevelDrafts((current) => ({
                            ...current,
                            [level.level]: { ...draft, title },
                          }))
                        }
                      />
                      <div className="mt-2">
                        <TextInput
                          label="Short title"
                          value={String(draft.shortTitle ?? '')}
                          onChange={(shortTitle) =>
                            setLevelDrafts((current) => ({
                              ...current,
                              [level.level]: { ...draft, shortTitle },
                            }))
                          }
                        />
                      </div>
                      <label className="mt-2 grid gap-1 text-sm font-semibold text-zinc-300">
                        Arrangement
                        <select
                          className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                          value={String(draft.arrangement || 'none')}
                          onChange={(event) =>
                            setLevelDrafts((current) => ({
                              ...current,
                              [level.level]: { ...draft, arrangement: event.target.value as PikachuLevelPayload['arrangement'] },
                            }))
                          }
                        >
                          {arrangementOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <ToggleInput
                          label="Enabled"
                          checked={Boolean(draft.isEnabled)}
                          onChange={(isEnabled) =>
                            setLevelDrafts((current) => ({
                              ...current,
                              [level.level]: { ...draft, isEnabled },
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-zinc-100 px-3 text-sm font-bold text-zinc-950 hover:bg-white disabled:opacity-60"
                          onClick={() => void saveLevel(level)}
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4" aria-hidden="true" />
                          Lưu
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        ) : null}
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-md border border-zinc-700 bg-zinc-950 p-5 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Xác nhận xóa</h2>
            <p className="mt-2 text-sm text-zinc-300">
              {deleteTarget.type === 'mode'
                ? `Xóa mode ${deleteTarget.mode.name}?`
                : `Xóa asset ${deleteTarget.asset.label} khỏi mode ${deleteTarget.mode.name}?`}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="h-10 rounded-md border border-zinc-700 text-sm font-bold text-zinc-100 hover:bg-zinc-900"
                onClick={() => setDeleteTarget(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="h-10 rounded-md bg-rose-500 text-sm font-bold text-white hover:bg-rose-400 disabled:opacity-60"
                onClick={() => void confirmDelete()}
                disabled={isSaving}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

function AdminStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
      <div className="text-xs font-bold uppercase text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-black text-white">{value.toLocaleString('vi-VN')}</div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Settings2; title: string }) {
  return (
    <div className="flex items-center gap-2 text-base font-bold text-white">
      <Icon className="h-5 w-5 text-amber-300" aria-hidden="true" />
      {title}
    </div>
  )
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-zinc-300">
      {label}
      <input
        className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-zinc-300">
      {label}
      <textarea
        className="min-h-20 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-300"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-zinc-300">
      {label}
      <input
        type="number"
        className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function ToggleInput({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-zinc-600 bg-zinc-950 text-amber-300"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}
