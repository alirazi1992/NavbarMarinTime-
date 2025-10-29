"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Check, X } from "lucide-react"
import { vesselsApi } from "@/lib/api/vessels"
import { adminNavItems } from "@/lib/config/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Vessel } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

export default function AdminVesselsPage() {
  const { toast } = useToast()
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null)

  const loadVessels = async () => {
    try {
      const data = await vesselsApi.getAll()
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
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await vesselsApi.updateStatus(id, "approved")
      toast({
        title: "موفق",
        description: "شناور تأیید شد",
      })
      loadVessels()
    } catch (error) {
      toast({
        title: "خطا",
        description: "تأیید شناور با خطا مواجه شد",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await vesselsApi.updateStatus(id, "rejected")
      toast({
        title: "موفق",
        description: "شناور رد شد",
      })
      loadVessels()
    } catch (error) {
      toast({
        title: "خطا",
        description: "رد شناور با خطا مواجه شد",
        variant: "destructive",
      })
    }
  }

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
    <DashboardLayout sidebarItems={adminNavItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">مدیریت شناورها</h1>
            <p className="text-muted-foreground">مشاهده و مدیریت کلیه شناورها</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            افزودن شناور
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">در حال بارگذاری...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام شناور</TableHead>
                  <TableHead>نوع</TableHead>
                  <TableHead>مالک</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>سرعت</TableHead>
                  <TableHead>آخرین بروزرسانی</TableHead>
                  <TableHead className="text-left">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vessels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      شناوری ثبت نشده است
                    </TableCell>
                  </TableRow>
                ) : (
                  vessels.map((vessel) => (
                    <TableRow key={vessel.id}>
                      <TableCell className="font-medium">{vessel.name}</TableCell>
                      <TableCell>{vessel.type}</TableCell>
                      <TableCell>{vessel.ownerName}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
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
                        </span>
                      </TableCell>
                      <TableCell>{vessel.speed} گره</TableCell>
                      <TableCell>{new Date(vessel.lastUpdate).toLocaleDateString("fa-IR")}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {vessel.status === "pending" && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => handleApprove(vessel.id)}>
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleReject(vessel.id)}>
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingVessel(vessel)
                              setDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(vessel.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    type: "cargo" as Vessel["type"],
    ownerId: "2",
    ownerName: "کاربر نمونه",
    status: "pending" as Vessel["status"],
    speed: 0,
    heading: 0,
    lat: 27.1865,
    lng: 56.2808,
  })

  useEffect(() => {
    if (vessel) {
      setFormData({
        name: vessel.name,
        type: vessel.type,
        ownerId: vessel.ownerId,
        ownerName: vessel.ownerName,
        status: vessel.status,
        speed: vessel.speed,
        heading: vessel.heading,
        lat: vessel.position.lat,
        lng: vessel.position.lng,
      })
    } else {
      setFormData({
        name: "",
        type: "cargo",
        ownerId: "2",
        ownerName: "کاربر نمونه",
        status: "pending",
        speed: 0,
        heading: 0,
        lat: 27.1865,
        lng: 56.2808,
      })
    }
  }, [vessel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
          position: { lat: formData.lat, lng: formData.lng },
        })
        toast({
          title: "موفق",
          description: "شناور ایجاد شد",
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{vessel ? "ویرایش شناور" : "افزودن شناور جدید"}</DialogTitle>
          <DialogDescription>اطلاعات شناور را وارد کنید</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">نام شناور</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">نوع شناور</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="speed">سرعت (گره)</Label>
                <Input
                  id="speed"
                  type="number"
                  value={formData.speed}
                  onChange={(e) => setFormData({ ...formData, speed: Number.parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heading">سمت (درجه)</Label>
                <Input
                  id="heading"
                  type="number"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: Number.parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">عرض جغرافیایی</Label>
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
                <Label htmlFor="lng">طول جغرافیایی</Label>
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
