"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, MapPin, Eye } from "lucide-react"
import { vesselsApi } from "@/lib/api/vessels"
import { clientNavItems } from "@/lib/config/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { useToast } from "@/hooks/use-toast"
import type { Vessel } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

export default function ClientVesselsPage() {
  const user = useAuthStore((state) => state.user)
  const { toast } = useToast()
  const router = useRouter()
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null)

  const loadVessels = async () => {
    if (!user) return

    try {
      const data = await vesselsApi.getByOwnerId(user.id)
      setVessels(data)
    } catch (error) {
      console.error("Error loading vessels:", error)
      toast({
        title: "خطا",
        description: "بارگذاری شناورها با خطا مواجه شد",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVessels()
  }, [user])

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این شناور اطمینان دارید؟")) return

    try {
      await vesselsApi.delete(id)
      toast({
        title: "موفق",
        description: "شناور حذف شد",
      })
      loadVessels()
    } catch (error) {
      toast({
        title: "خطا",
        description: "حذف شناور با خطا مواجه شد",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout sidebarItems={clientNavItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">شناورهای من</h1>
            <p className="text-muted-foreground">مدیریت شناورهای خود</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            افزودن شناور
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">در حال بارگذاری...</div>
        ) : vessels.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Plus className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">هنوز شناوری ثبت نکرده‌اید</h3>
              <p className="mt-2 text-sm text-muted-foreground">برای شروع، اولین شناور خود را اضافه کنید</p>
              <Button onClick={() => setDialogOpen(true)} className="mt-4">
                <Plus className="ml-2 h-4 w-4" />
                افزودن شناور
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vessels.map((vessel) => (
              <Card key={vessel.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{vessel.name}</CardTitle>
                      <CardDescription>{vessel.type}</CardDescription>
                    </div>
                    <div
                      className={`rounded-full px-2 py-1 text-xs ${
                        vessel.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : vessel.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : vessel.status === "approved"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {vessel.status === "active"
                        ? "فعال"
                        : vessel.status === "pending"
                          ? "در انتظار"
                          : vessel.status === "approved"
                            ? "تأیید شده"
                            : "رد شده"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">سرعت:</span>
                    <span className="font-medium">{vessel.speed} گره</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">سمت:</span>
                    <span className="font-medium">{vessel.heading}°</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {vessel.position.lat.toFixed(4)}, {vessel.position.lng.toFixed(4)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    آخرین بروزرسانی: {new Date(vessel.lastUpdate).toLocaleString("fa-IR")}
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Button size="sm" className="w-full" onClick={() => router.push(`/app/vessel/${vessel.id}`)}>
                      <Eye className="ml-2 h-4 w-4" />
                      مشاهده جزئیات
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setEditingVessel(vessel)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="ml-2 h-4 w-4" />
                        ویرایش
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleDelete(vessel.id)}
                      >
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <VesselDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingVessel(null)
        }}
        vessel={editingVessel}
        onSuccess={loadVessels}
      />
    </DashboardLayout>
  )
}

function VesselDialog({
  open,
  onOpenChange,
  vessel,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  vessel: Vessel | null
  onSuccess: () => void
}) {
  const user = useAuthStore((state) => state.user)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    type: "cargo" as Vessel["type"],
    speed: 0,
    heading: 0,
    lat: 27.1865,
    lng: 56.2808,
    imo: "",
    mmsi: "",
    callSign: "",
  })

  useEffect(() => {
    if (vessel) {
      setFormData({
        name: vessel.name,
        type: vessel.type,
        speed: vessel.speed,
        heading: vessel.heading,
        lat: vessel.position.lat,
        lng: vessel.position.lng,
        imo: vessel.imo || "",
        mmsi: vessel.mmsi || "",
        callSign: vessel.callSign || "",
      })
    } else {
      setFormData({
        name: "",
        type: "cargo",
        speed: 0,
        heading: 0,
        lat: 27.1865,
        lng: 56.2808,
        imo: "",
        mmsi: "",
        callSign: "",
      })
    }
  }, [vessel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      if (vessel) {
        await vesselsApi.update(vessel.id, {
          ...formData,
          position: { lat: formData.lat, lng: formData.lng },
        })
        toast({
          title: "موفق",
          description: "شناور بروزرسانی شد",
        })
      } else {
        await vesselsApi.create({
          ...formData,
          ownerId: user.id,
          ownerName: user.name,
          status: "pending",
          position: { lat: formData.lat, lng: formData.lng },
        })
        toast({
          title: "موفق",
          description: "شناور ایجاد شد و در انتظار تأیید است",
        })
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "خطا",
        description: "عملیات با خطا مواجه شد",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vessel ? "ویرایش شناور" : "افزودن شناور جدید"}</DialogTitle>
          <DialogDescription>اطلاعات شناور را وارد کنید</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">نام شناور *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">نوع شناور *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as Vessel["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cargo">باری</SelectItem>
                    <SelectItem value="tanker">نفتکش</SelectItem>
                    <SelectItem value="passenger">مسافری</SelectItem>
                    <SelectItem value="fishing">ماهیگیری</SelectItem>
                    <SelectItem value="military">نظامی</SelectItem>
                    <SelectItem value="other">سایر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imo">شماره IMO</Label>
                <Input
                  id="imo"
                  value={formData.imo}
                  onChange={(e) => setFormData({ ...formData, imo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mmsi">شماره MMSI</Label>
                <Input
                  id="mmsi"
                  value={formData.mmsi}
                  onChange={(e) => setFormData({ ...formData, mmsi: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callSign">علامت ندا</Label>
                <Input
                  id="callSign"
                  value={formData.callSign}
                  onChange={(e) => setFormData({ ...formData, callSign: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="speed">سرعت (گره) *</Label>
                <Input
                  id="speed"
                  type="number"
                  step="0.1"
                  value={formData.speed}
                  onChange={(e) => setFormData({ ...formData, speed: Number.parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heading">سمت (درجه) *</Label>
                <Input
                  id="heading"
                  type="number"
                  min="0"
                  max="360"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: Number.parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">عرض جغرافیایی *</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.0001"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: Number.parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">طول جغرافیایی *</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.0001"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: Number.parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button type="submit">{vessel ? "بروزرسانی" : "ایجاد"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
