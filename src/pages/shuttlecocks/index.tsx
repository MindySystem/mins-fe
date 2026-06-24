import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Clock, Check, TrendingUp, Info } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { shuttlecockService, type Shuttlecock, type ShuttlecockPriceHistory } from '@/services/shuttlecock.service'

export default function ShuttlecocksPage() {
  const [shuttlecocks, setShuttlecocks] = useState<Shuttlecock[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Dialog states
  const [isOpenAdd, setIsOpenAdd] = useState(false)
  const [isOpenEdit, setIsOpenEdit] = useState(false)
  const [isOpenHistory, setIsOpenHistory] = useState(false)
  const [selectedShuttlecock, setSelectedShuttlecock] = useState<Shuttlecock | null>(null)
  const [priceHistory, setPriceHistory] = useState<ShuttlecockPriceHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)

  const fetchShuttlecocks = async () => {
    try {
      setLoading(true)
      const res = await shuttlecockService.getAll()
      setShuttlecocks(res.data)
    } catch (e) {
      toast.error('Không thể tải danh sách cầu lông')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShuttlecocks()
  }, [])

  const handleOpenAdd = () => {
    setName('')
    setBrand('')
    setDescription('')
    setPrice(0)
    setIsOpenAdd(true)
  }

  const handleOpenEdit = (sc: Shuttlecock) => {
    setSelectedShuttlecock(sc)
    setName(sc.name)
    setBrand(sc.brand || '')
    setDescription(sc.description || '')
    setPrice(sc.currentPricePerTube)
    setIsOpenEdit(true)
  }

  const handleOpenHistory = async (sc: Shuttlecock) => {
    setSelectedShuttlecock(sc)
    setIsOpenHistory(true)
    setLoadingHistory(true)
    try {
      const res = await shuttlecockService.getPriceHistory(sc.id)
      setPriceHistory(res.data)
    } catch (e) {
      toast.error('Không thể tải lịch sử giá')
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Vui lòng nhập tên loại cầu')
    if (price <= 0) return toast.error('Giá phải lớn hơn 0')

    setSubmitting(true)
    try {
      const res = await shuttlecockService.create({
        name,
        brand: brand || undefined,
        description: description || undefined,
        currentPricePerTube: price,
      })
      toast.success(res.message || 'Đã thêm thành công')
      setIsOpenAdd(false)
      fetchShuttlecocks()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Thêm thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShuttlecock) return
    if (!name.trim()) return toast.error('Vui lòng nhập tên loại cầu')
    if (price <= 0) return toast.error('Giá phải lớn hơn 0')

    setSubmitting(true)
    try {
      const res = await shuttlecockService.update(selectedShuttlecock.id, {
        name,
        brand: brand || undefined,
        description: description || undefined,
        currentPricePerTube: price,
      })
      toast.success(res.message || 'Cập nhật thành công')
      setIsOpenEdit(false)
      fetchShuttlecocks()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cập nhật thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa loại cầu này?')) return

    try {
      const res = await shuttlecockService.delete(id)
      toast.success(res.message || 'Đã xóa thành công')
      fetchShuttlecocks()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại')
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Quản lý loại cầu lông & Lịch sử giá
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý danh sách cầu lông, giá ống cầu hiện tại và lịch sử thay đổi giá theo thời gian.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shrink-0 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Thêm loại cầu
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-6 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
              </CardHeader>
              <CardContent className="h-20 bg-slate-50/50" />
            </Card>
          ))}
        </div>
      ) : shuttlecocks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-50 text-slate-400">
            <Info className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-950">Chưa có loại cầu nào</h3>
          <p className="mt-2 text-xs text-slate-500">
            Nhấn nút "Thêm loại cầu" ở trên để bắt đầu cấu hình các loại cầu lông sử dụng cho sân.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {shuttlecocks.map((sc) => (
            <Card key={sc.id} className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {sc.brand && (
                      <Badge variant="outline" className="mb-1 text-[10px] uppercase font-bold text-slate-500 border-slate-300">
                        {sc.brand}
                      </Badge>
                    )}
                    <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {sc.name}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Giá hiện tại / ống</div>
                  <div className="flex items-baseline gap-1 font-bold text-slate-950">
                    <span className="text-xl">
                      {sc.currentPricePerTube.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">VNĐ</span>
                  </div>
                </div>

                {sc.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {sc.description}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 h-9"
                    onClick={() => handleOpenHistory(sc)}
                  >
                    <Clock className="h-3.5 w-3.5" /> Lịch sử
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-9 text-slate-600"
                    onClick={() => handleOpenEdit(sc)}
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-9 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100"
                    onClick={() => handleDelete(sc.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isOpenAdd} onOpenChange={setIsOpenAdd}>
        <DialogContent className="max-w-md bg-white border border-slate-200">
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-bold text-xl">Thêm loại cầu lông</DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                Nhập thông tin chi tiết của loại cầu lông mới để áp dụng tính toán chi phí.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="add-name" className="text-slate-700">Tên loại cầu <span className="text-red-500">*</span></Label>
                <Input
                  id="add-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Vina Star Xanh, Hải Yến..."
                  required
                  className="border-slate-200 focus-visible:ring-slate-900 text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="add-brand" className="text-slate-700">Thương hiệu</Label>
                  <Input
                    id="add-brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ví dụ: Yonex, Victor..."
                    className="border-slate-200 focus-visible:ring-slate-900 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="add-price" className="text-slate-700">Giá ống cầu (VNĐ) <span className="text-red-500">*</span></Label>
                  <Input
                    id="add-price"
                    type="number"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="250000"
                    required
                    min={1}
                    className="border-slate-200 focus-visible:ring-slate-900 text-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-desc" className="text-slate-700">Mô tả thêm</Label>
                <Input
                  id="add-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi chú thêm về loại cầu (nếu có)..."
                  className="border-slate-200 focus-visible:ring-slate-900 text-slate-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpenAdd(false)} className="text-slate-700">
                Hủy
              </Button>
              <Button type="submit" disabled={submitting} className="bg-slate-900 hover:bg-slate-800 text-white">
                {submitting ? 'Đang tạo...' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isOpenEdit} onOpenChange={setIsOpenEdit}>
        <DialogContent className="max-w-md bg-white border border-slate-200">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-bold text-xl">Sửa loại cầu lông</DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                Nếu bạn cập nhật giá ống cầu mới, hệ thống sẽ tự động lưu lại lịch sử thay đổi giá.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="edit-name" className="text-slate-700">Tên loại cầu <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Vina Star Xanh, Hải Yến..."
                  required
                  className="border-slate-200 focus-visible:ring-slate-900 text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edit-brand" className="text-slate-700">Thương hiệu</Label>
                  <Input
                    id="edit-brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ví dụ: Yonex, Victor..."
                    className="border-slate-200 focus-visible:ring-slate-900 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-price" className="text-slate-700">Giá ống cầu (VNĐ) <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="250000"
                    required
                    min={1}
                    className="border-slate-200 focus-visible:ring-slate-900 text-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-desc" className="text-slate-700">Mô tả thêm</Label>
                <Input
                  id="edit-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-slate-200 focus-visible:ring-slate-900 text-slate-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpenEdit(false)} className="text-slate-700">
                Hủy
              </Button>
              <Button type="submit" disabled={submitting} className="bg-slate-900 hover:bg-slate-800 text-white">
                {submitting ? 'Đang lưu...' : 'Lưu lại'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isOpenHistory} onOpenChange={setIsOpenHistory}>
        <DialogContent className="max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Lịch sử giá: {selectedShuttlecock?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Xem lịch sử thay đổi đơn giá ống cầu lông qua các mốc thời gian.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[300px] overflow-y-auto pr-1">
            {loadingHistory ? (
              <div className="py-8 text-center text-sm text-slate-500">Đang tải dữ liệu...</div>
            ) : priceHistory.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">Chưa có thông tin lịch sử giá</div>
            ) : (
              <div className="relative border-l border-slate-200 ml-4 space-y-5">
                {priceHistory.map((item, index) => (
                  <div key={item.id} className="relative pl-6">
                    <div className={`absolute -left-1.5 top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full border bg-white ${
                      index === 0 ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-300'
                    }`}>
                      {index === 0 && <Check className="h-2 w-2 text-emerald-600 font-bold" />}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1 font-bold text-slate-950 text-base">
                        <span>{item.pricePerTube.toLocaleString('vi-VN')}</span>
                        <span className="text-xs font-medium text-slate-500">VNĐ</span>
                        {index === 0 && (
                          <Badge className="ml-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-[9px] uppercase tracking-wider py-0.5">
                            Hiện tại
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Áp dụng từ: {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsOpenHistory(false)} className="bg-slate-900 hover:bg-slate-800 text-white w-full">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
