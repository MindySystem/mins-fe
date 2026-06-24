import { useEffect, useMemo, useState } from 'react'
import { Edit2, Search, KeyRound, Users2, Scissors, MapPin, Navigation, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebounce } from '@/hooks/useDebounce'
import type { User } from '@/store/useAppStore'
import { useAppStore } from '@/store/useAppStore'
import {
  userService,
  type UserAdminFormData,
} from '@/features/sessions/services/user.service'
import {
  courtLocationService,
  type BadmintonCourtLocation,
  type BadmintonCourtLocationForm,
} from '@/features/sessions/services/court-location.service'
import { ShuttlecocksManager } from '@/pages/shuttlecocks'
import { GENDER_LABELS, SKILL_LEVEL_OPTIONS, genderLabel, skillLevelLabel } from '@/utils/userMeta'

const roleOptions: User['role'][] = ['admin', 'user', 'shop_manager', 'staff']
type AdminTab = 'users' | 'courts' | 'shuttlecocks'
type UserDialogMode = 'create' | 'edit'

const emptyUserForm: UserAdminFormData = {
  name: '',
  email: '',
  phone: '',
  role: 'user',
  gender: 'male',
  skillLevel: 'beginner',
  password: '',
}

export default function SessionsAdminPage() {
  const isAdmin = useAppStore((s) => s.user?.role === 'admin')
  const [tab, setTab] = useState<AdminTab>('users')

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Bạn không có quyền truy cập trang này.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản trị sessions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý người dùng, danh sách sân và cấu hình loại cầu lông trong một màn hình.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as AdminTab)} className="gap-4">
        <TabsList variant="default" className="grid h-auto w-full grid-cols-3 bg-white p-1 sm:inline-flex sm:w-auto">
          <TabsTrigger value="users" className="gap-2">
            <Users2 className="h-4 w-4" /> Người dùng
          </TabsTrigger>
          <TabsTrigger value="courts" className="gap-2">
            <MapPin className="h-4 w-4" /> Sân
          </TabsTrigger>
          <TabsTrigger value="shuttlecocks" className="gap-2">
            <Scissors className="h-4 w-4" /> Loại cầu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagementPanel />
        </TabsContent>

        <TabsContent value="courts">
          <CourtManagementPanel />
        </TabsContent>

        <TabsContent value="shuttlecocks">
          <ShuttlecocksManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CourtManagementPanel() {
  const [query, setQuery] = useState('')
  const [courts, setCourts] = useState<BadmintonCourtLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [editing, setEditing] = useState<BadmintonCourtLocation | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<BadmintonCourtLocationForm>({
    name: '',
    address: '',
    mapUrl: '',
    note: '',
    isActive: true,
  })
  const debounced = useDebounce(query, 300)

  async function load() {
    setLoading(true)
    try {
      const data = await courtLocationService.list({ q: debounced.trim() || undefined })
      setCourts(data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được danh sách sân')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  function openCreate() {
    setEditing(null)
    setForm({ name: '', address: '', mapUrl: '', note: '', isActive: true })
    setOpen(true)
  }

  function openEdit(court: BadmintonCourtLocation) {
    setEditing(court)
    setForm({
      name: court.name,
      address: court.address,
      mapUrl: court.mapUrl || '',
      note: court.note || '',
      isActive: court.isActive,
    })
    setOpen(true)
  }

  async function saveCourt() {
    if (!form.name.trim() || !form.address.trim()) {
      toast.error('Vui lòng nhập tên sân và địa chỉ')
      return
    }
    setBusyId(editing?.id ?? 0)
    try {
      if (editing) {
        const updated = await courtLocationService.update(editing.id, form)
        setCourts((arr) => arr.map((c) => (c.id === updated.id ? updated : c)))
        toast.success('Đã cập nhật sân')
      } else {
        const created = await courtLocationService.create(form)
        setCourts((arr) => [created, ...arr])
        toast.success('Đã thêm sân')
      }
      setOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể lưu sân')
    } finally {
      setBusyId(null)
    }
  }

  async function removeCourt(court: BadmintonCourtLocation) {
    if (!confirm(`Xóa sân "${court.name}"?`)) return
    setBusyId(court.id)
    try {
      await courtLocationService.remove(court.id)
      setCourts((arr) => arr.filter((c) => c.id !== court.id))
      toast.success('Đã xóa sân')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa sân thất bại')
    } finally {
      setBusyId(null)
    }
  }

  function directionsUrl(court: BadmintonCourtLocation) {
    return court.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(court.address)}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên sân, địa chỉ..."
            className="h-9 pl-9"
          />
        </div>
        <Button onClick={openCreate} className="h-9 gap-2 bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="h-4 w-4" /> Thêm sân
        </Button>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
      ) : courts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Chưa có sân nào.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {courts.map((court) => (
            <div key={court.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-slate-900">{court.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      court.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {court.isActive ? 'Đang dùng' : 'Tạm ẩn'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{court.address}</p>
                  {court.note && <p className="mt-1 text-xs text-slate-400">{court.note}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 border-slate-200 p-0"
                    onClick={() => openEdit(court)}
                    disabled={busyId === court.id}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 border-rose-200 p-0 text-rose-600 hover:bg-rose-50"
                    onClick={() => removeCourt(court)}
                    disabled={busyId === court.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <a
                href={directionsUrl(court)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Navigation className="h-3.5 w-3.5" /> Chỉ đường
              </a>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa thông tin sân' : 'Thêm sân'}</DialogTitle>
            <DialogDescription>Địa chỉ sẽ dùng để mở chỉ đường trên Google Maps khi chưa nhập link riêng.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="court-name">Tên sân</Label>
              <Input
                id="court-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="VD: Sân cầu lông ABC"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="court-address">Địa chỉ</Label>
              <Input
                id="court-address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Số nhà, đường, quận/huyện..."
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="court-map">Link bản đồ</Label>
              <Input
                id="court-map"
                value={form.mapUrl || ''}
                onChange={(e) => setForm((f) => ({ ...f, mapUrl: e.target.value }))}
                placeholder="https://maps.google.com/..."
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="court-note">Ghi chú</Label>
              <Input
                id="court-note"
                value={form.note || ''}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Số sân, bãi xe, tầng..."
              />
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              Đang sử dụng
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Đóng</Button>
            <Button onClick={saveCourt} disabled={busyId !== null}>Lưu sân</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UserManagementPanel() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<'all' | User['role']>('all')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [selected, setSelected] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [userDialogMode, setUserDialogMode] = useState<UserDialogMode>('create')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForm, setUserForm] = useState<UserAdminFormData>(emptyUserForm)
  const debounced = useDebounce(query, 300)

  async function load() {
    setLoading(true)
    try {
      const data = await userService.list({
        q: debounced.trim() || undefined,
        role: role === 'all' ? undefined : role,
      })
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, role])

  const groupedCount = useMemo(
    () => roleOptions.reduce((acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r).length }), {} as Record<User['role'], number>),
    [users],
  )

  async function updateRole(user: User, nextRole: User['role']) {
    if (user.isSeedAdmin) return
    setBusyId(user.id)
    try {
      const updated = await userService.updateRole(user.id, nextRole)
      setUsers((arr) => arr.map((u) => (u.id === updated.id ? updated : u)))
      toast.success('Đã cập nhật vai trò')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cập nhật vai trò thất bại')
    } finally {
      setBusyId(null)
    }
  }

  async function resetPassword() {
    if (!selected) return
    if (selected.isSeedAdmin) {
      toast.error('Tài khoản quyền cao nhất không thể reset mật khẩu tại đây')
      return
    }
    if (newPassword.trim().length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }
    setBusyId(selected.id)
    try {
      await userService.resetPassword(selected.id, newPassword.trim())
      toast.success('Đã đặt lại mật khẩu')
      setSelected(null)
      setNewPassword('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Đặt lại mật khẩu thất bại')
    } finally {
      setBusyId(null)
    }
  }

  function openCreateUser() {
    setEditingUser(null)
    setUserDialogMode('create')
    setUserForm(emptyUserForm)
    setUserDialogOpen(true)
  }

  function openEditUser(user: User) {
    if (user.isSeedAdmin) return
    setEditingUser(user)
    setUserDialogMode('edit')
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      gender: user.gender || 'male',
      skillLevel: user.skillLevel || 'beginner',
      password: '',
    })
    setUserDialogOpen(true)
  }

  async function saveUser() {
    if (!userForm.name.trim() || !userForm.email.trim()) {
      toast.error('Vui lòng nhập tên và email')
      return
    }
    if (userDialogMode === 'create' && (!userForm.password || userForm.password.length < 6)) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setBusyId(editingUser?.id ?? 0)
    try {
      const payload = {
        ...userForm,
        phone: userForm.phone || undefined,
        password: userForm.password || undefined,
      }
      if (userDialogMode === 'create') {
        const created = await userService.create(payload)
        setUsers((arr) => [created, ...arr])
        toast.success('Đã tạo người dùng')
      } else if (editingUser) {
        const updated = await userService.update(editingUser.id, payload)
        setUsers((arr) => arr.map((u) => (u.id === updated.id ? updated : u)))
        toast.success('Đã cập nhật người dùng')
      }
      setUserDialogOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể lưu người dùng')
    } finally {
      setBusyId(null)
    }
  }

  async function deleteUser(user: User) {
    if (user.isSeedAdmin) return
    if (!confirm(`Xóa người dùng "${user.name}"?`)) return

    setBusyId(user.id)
    try {
      await userService.remove(user.id)
      setUsers((arr) => arr.filter((u) => u.id !== user.id))
      toast.success('Đã xóa người dùng')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể xóa người dùng')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStat label="Tổng user" value={users.length} />
        <AdminStat label="Admin" value={groupedCount.admin || 0} />
        <AdminStat label="Staff" value={(groupedCount.staff || 0) + (groupedCount.shop_manager || 0)} />
        <AdminStat label="User" value={groupedCount.user || 0} />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên, email, SĐT..." className="h-9 pl-9" />
        </div>
        <div className="flex gap-2">
          {(['all', ...roleOptions] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                role === r ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r === 'all' ? 'Tất cả' : r}
            </button>
          ))}
        </div>
        <Button onClick={openCreateUser} className="h-9 gap-2 bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="h-4 w-4" /> Thêm user
        </Button>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white md:hidden">
            <div className="divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}{u.phone ? ` · ${u.phone}` : ''}</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {u.isSeedAdmin && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              Quyền cao nhất
                            </span>
                          )}
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {genderLabel(u.gender)}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {skillLevelLabel(u.skillLevel)}
                          </span>
                        </div>
                      </div>
                    {u.isSeedAdmin ? (
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
                        {u.role}
                      </span>
                    ) : (
                      <select value={u.role} onChange={(e) => updateRole(u, e.target.value as User['role'])} disabled={busyId === u.id} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs">
                        {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {!u.isSeedAdmin && (
                      <>
                        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => { setSelected(u); setNewPassword('') }}>
                          <KeyRound className="h-3.5 w-3.5" /> Reset mật khẩu
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => openEditUser(u)}>
                          <Edit2 className="h-3.5 w-3.5" /> Sửa
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 border-rose-200 text-rose-600 hover:bg-rose-50" disabled={busyId === u.id} onClick={() => deleteUser(u)}>
                          <Trash2 className="h-3.5 w-3.5" /> Xóa
                        </Button>
                      </>
                    )}
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600">{u.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="px-4 py-3">Giới tính / Trình độ</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Liên hệ</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500">ID #{u.id}</div>
                      {u.isSeedAdmin && (
                        <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          Quyền cao nhất
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {genderLabel(u.gender)}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          {skillLevelLabel(u.skillLevel)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.isSeedAdmin ? (
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
                          {u.role}
                        </span>
                      ) : (
                        <select value={u.role} onChange={(e) => updateRole(u, e.target.value as User['role'])} disabled={busyId === u.id} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm">
                          {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}{u.phone ? ` · ${u.phone}` : ''}</td>
                    <td className="px-4 py-3 text-right">
                      {!u.isSeedAdmin && (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setSelected(u); setNewPassword('') }}>
                            <Edit2 className="h-3.5 w-3.5" /> Reset mật khẩu
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEditUser(u)}>
                            <Edit2 className="h-3.5 w-3.5" /> Sửa
                          </Button>
                          <Button size="sm" variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50" disabled={busyId === u.id} onClick={() => deleteUser(u)}>
                            <Trash2 className="h-3.5 w-3.5" /> Xóa
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>{selected?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nhập mật khẩu mới" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
            <Button onClick={resetPassword} disabled={busyId === selected?.id}>Lưu mật khẩu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{userDialogMode === 'create' ? 'Thêm người dùng' : 'Sửa người dùng'}</DialogTitle>
            <DialogDescription>
              {userDialogMode === 'create' ? 'Tạo tài khoản đăng nhập mới.' : editingUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="user-name">Họ tên</Label>
              <Input id="user-name" value={userForm.name} onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" type="email" value={userForm.email} onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="user-phone">SĐT</Label>
              <Input id="user-phone" value={userForm.phone || ''} onChange={(e) => setUserForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="user-password">Mật khẩu {userDialogMode === 'edit' && <span className="text-xs text-slate-400">(để trống nếu không đổi)</span>}</Label>
              <Input id="user-password" type="password" value={userForm.password || ''} onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="user-role">Vai trò</Label>
              <select id="user-role" value={userForm.role} onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value as User['role'] }))} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="user-gender">Giới tính</Label>
              <select id="user-gender" value={userForm.gender} onChange={(e) => setUserForm((f) => ({ ...f, gender: e.target.value as NonNullable<User['gender']> }))} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                {Object.entries(GENDER_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="user-skill">Trình độ</Label>
              <select id="user-skill" value={userForm.skillLevel} onChange={(e) => setUserForm((f) => ({ ...f, skillLevel: e.target.value as UserAdminFormData['skillLevel'] }))} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                {SKILL_LEVEL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>Đóng</Button>
            <Button onClick={saveUser} disabled={busyId !== null}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AdminStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
    </div>
  )
}
