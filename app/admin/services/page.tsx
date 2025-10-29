"use client"

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { adminNavItems } from "@/lib/config/navigation"
import { servicesApi } from "@/lib/api/services"
import type { Service } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { MapPin, RefreshCcw, Trash2, Wrench } from "lucide-react"

type ServiceStatus = Service["status"]
type ServiceCategory = Service["category"]

interface ServiceFormState {
  name: string
  category: ServiceCategory
  description: string
  phone: string
  email: string
  website: string
  lat: number
  lng: number
  status: ServiceStatus
}

const statusLabels: Record<ServiceStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
}

const statusVariants: Record<ServiceStatus, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
}

const categoryLabels: Record<ServiceCategory, string> = {
  repair: "Repair & Maintenance",
  supply: "Supplies & Provisioning",
  logistics: "Logistics",
  inspection: "Inspection & Survey",
  other: "Other",
}

export default function AdminServicesPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formState, setFormState] = useState<ServiceFormState>({
    name: "",
    category: "repair",
    description: "",
    phone: "",
    email: "",
    website: "",
    lat: 27.1865,
    lng: 56.2808,
    status: "pending",
  })

  const loadServices = async () => {
    try {
      const data = await servicesApi.getAll()
      setServices(data)
    } catch (error) {
      console.error("Error loading services:", error)
      toast({
        title: "Unable to load services",
        description: "There was a problem fetching the service directory. Please retry.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  const resetForm = () => {
    setEditingService(null)
    setFormState({
      name: "",
      category: "repair",
      description: "",
      phone: "",
      email: "",
      website: "",
      lat: 27.1865,
      lng: 56.2808,
      status: "pending",
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (service: Service) => {
    setEditingService(service)
    setFormState({
      name: service.name,
      category: service.category,
      description: service.description,
      phone: service.contact.phone ?? "",
      email: service.contact.email ?? "",
      website: service.contact.website ?? "",
      lat: service.location.lat,
      lng: service.location.lng,
      status: service.status,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      name: formState.name,
      category: formState.category,
      description: formState.description,
      location: { lat: formState.lat, lng: formState.lng },
      contact: {
        phone: formState.phone || undefined,
        email: formState.email || undefined,
        website: formState.website || undefined,
      },
      status: formState.status,
    }

    try {
      if (editingService) {
        await servicesApi.update(editingService.id, payload)
        toast({
          title: "Service updated",
          description: "The service profile was saved successfully.",
        })
      } else {
        await servicesApi.create(payload)
        toast({
          title: "Service added",
          description: "The provider is now visible in the directory.",
        })
      }

      setDialogOpen(false)
      resetForm()
      loadServices()
    } catch (error) {
      toast({
        title: "Save failed",
        description: "We could not apply these changes. Please review the form and try again.",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (service: Service, status: ServiceStatus) => {
    try {
      await servicesApi.update(service.id, { status })
      toast({
        title: "Status updated",
        description: `${service.name} is now ${statusLabels[status].toLowerCase()}.`,
      })
      loadServices()
    } catch (error) {
      toast({
        title: "Unable to update status",
        description: "We ran into a problem changing the approval state.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (service: Service) => {
    if (!confirm(`Remove ${service.name} from the directory?`)) return

    try {
      const success = await servicesApi.delete(service.id)
      if (!success) {
        toast({
          title: "Delete failed",
          description: "We could not remove this record. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Service removed",
        description: `${service.name} is no longer listed.`,
      })
      loadServices()
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "An unexpected error occurred while deleting the service.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout sidebarItems={adminNavItems}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Service directory</h1>
            <p className="text-muted-foreground">
              Approve trusted suppliers, keep contact information current, and track their status.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadServices} disabled={loading}>
              <RefreshCcw className="ml-2 h-4 w-4" />
              Refresh list
            </Button>
            <Button onClick={openCreateDialog}>
              <Wrench className="ml-2 h-4 w-4" />
              Add service
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading service providers…</div>
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No services have been registered yet. Use “Add service” to create the first entry.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{categoryLabels[service.category]}</Badge>
                      <Badge variant={statusVariants[service.status]}>{statusLabels[service.status]}</Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => openEditDialog(service)} aria-label="Edit service">
                      <Wrench className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(service)}
                      aria-label="Delete service"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {service.location.lat.toFixed(3)} / {service.location.lng.toFixed(3)}
                      </span>
                    </div>
                    {service.contact.phone && (
                      <div>
                        <span className="font-medium">Phone:</span> {service.contact.phone}
                      </div>
                    )}
                    {service.contact.email && (
                      <div>
                        <span className="font-medium">Email:</span> {service.contact.email}
                      </div>
                    )}
                    {service.contact.website && (
                      <div>
                        <span className="font-medium">Website:</span> {service.contact.website}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        variant={service.status === "approved" ? "default" : "outline"}
                        onClick={() => handleStatusChange(service, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant={service.status === "pending" ? "secondary" : "outline"}
                        onClick={() => handleStatusChange(service, "pending")}
                      >
                        Mark pending
                      </Button>
                      <Button
                        size="sm"
                        variant={service.status === "rejected" ? "destructive" : "outline"}
                        onClick={() => handleStatusChange(service, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit service" : "Add service"}</DialogTitle>
            <DialogDescription>Capture the core details a duty officer needs to contact this provider.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Service name</Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, category: value as ServiceCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repair">{categoryLabels.repair}</SelectItem>
                    <SelectItem value="supply">{categoryLabels.supply}</SelectItem>
                    <SelectItem value="logistics">{categoryLabels.logistics}</SelectItem>
                    <SelectItem value="inspection">{categoryLabels.inspection}</SelectItem>
                    <SelectItem value="other">{categoryLabels.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formState.phone}
                  onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formState.website}
                  onChange={(event) => setFormState((prev) => ({ ...prev, website: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.0001"
                  value={formState.lat}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, lat: Number.parseFloat(event.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.0001"
                  value={formState.lng}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, lng: Number.parseFloat(event.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, status: value as ServiceStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{statusLabels.pending}</SelectItem>
                    <SelectItem value="approved">{statusLabels.approved}</SelectItem>
                    <SelectItem value="rejected">{statusLabels.rejected}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingService ? "Save changes" : "Create service"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
