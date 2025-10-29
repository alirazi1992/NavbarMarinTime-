"use client"

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { adminNavItems } from "@/lib/config/navigation"
import { eventsApi } from "@/lib/api/events"
import type { Event } from "@/lib/types"
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
import { Calendar, MapPin, PlusCircle, RefreshCcw, Trash2, Users } from "lucide-react"

type EventCategory = Event["category"]

interface EventFormState {
  title: string
  description: string
  startDate: string
  endDate: string
  locationName: string
  lat: number
  lng: number
  category: EventCategory
  maxParticipants: number | ""
}

const categoryLabels: Record<EventCategory, string> = {
  conference: "Conference",
  training: "Training",
  inspection: "Inspection",
  maintenance: "Maintenance",
  other: "Other",
}

export default function AdminEventsPage() {
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formState, setFormState] = useState<EventFormState>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    locationName: "",
    lat: 27.1865,
    lng: 56.2808,
    category: "conference",
    maxParticipants: "",
  })

  const loadEvents = async () => {
    try {
      const data = await eventsApi.getAll()
      setEvents(data)
    } catch (error) {
      console.error("Error loading events:", error)
      toast({
        title: "Unable to load events",
        description: "We could not retrieve the scheduling queue. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const resetForm = () => {
    setEditingEvent(null)
    setFormState({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      locationName: "",
      lat: 27.1865,
      lng: 56.2808,
      category: "conference",
      maxParticipants: "",
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (event: Event) => {
    setEditingEvent(event)
    setFormState({
      title: event.title,
      description: event.description,
      startDate: toLocalInputValue(event.startDate),
      endDate: event.endDate ? toLocalInputValue(event.endDate) : "",
      locationName: event.location.name,
      lat: event.location.lat,
      lng: event.location.lng,
      category: event.category,
      maxParticipants: event.maxParticipants ?? "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      title: formState.title,
      description: formState.description,
      startDate: fromLocalInputValue(formState.startDate),
      endDate: formState.endDate ? fromLocalInputValue(formState.endDate) : undefined,
      location: {
        name: formState.locationName,
        lat: formState.lat,
        lng: formState.lng,
      },
      category: formState.category,
      maxParticipants: formState.maxParticipants === "" ? undefined : Number(formState.maxParticipants),
    }

    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent.id, payload)
        toast({
          title: "Event updated",
          description: "The event details were saved successfully.",
        })
      } else {
        await eventsApi.create(payload)
        toast({
          title: "Event scheduled",
          description: "The event is now published to the operations calendar.",
        })
      }
      setDialogOpen(false)
      resetForm()
      loadEvents()
    } catch (error) {
      toast({
        title: "Save failed",
        description: "We could not save this event. Please review the form and try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (event: Event) => {
    if (!confirm(`Remove “${event.title}” from the calendar?`)) return

    try {
      const success = await eventsApi.delete(event.id)
      if (!success) {
        toast({
          title: "Delete failed",
          description: "We were unable to remove this event. Please retry.",
          variant: "destructive",
        })
        return
      }
      toast({
        title: "Event removed",
        description: "The entry has been cleared from the schedule.",
      })
      loadEvents()
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "An unexpected error occurred while deleting the event.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout sidebarItems={adminNavItems}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Events &amp; training</h1>
            <p className="text-muted-foreground">
              Coordinate drills, inspections, and stakeholder meetings across the maritime network.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadEvents} disabled={loading}>
              <RefreshCcw className="ml-2 h-4 w-4" />
              Refresh list
            </Button>
            <Button onClick={openCreateDialog}>
              <PlusCircle className="ml-2 h-4 w-4" />
              Schedule event
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading events…</div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nothing scheduled yet. Use “Schedule event” to add an entry to the calendar.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => {
              const startDate = new Date(event.startDate)
              const endDate = event.endDate ? new Date(event.endDate) : null
              const isPast = startDate < new Date()
              const capacity = event.maxParticipants
                ? `${event.registeredCount} / ${event.maxParticipants}`
                : `${event.registeredCount}`

              return (
                <Card key={event.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{categoryLabels[event.category]}</Badge>
                        <Badge variant={isPast ? "secondary" : "default"}>{isPast ? "Completed" : "Upcoming"}</Badge>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(event)} aria-label="Edit event">
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(event)} aria-label="Delete event">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{startDate.toLocaleString("fa-IR")}</span>
                        {endDate && <span>until {endDate.toLocaleString("fa-IR")}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.maxParticipants ? `Capacity: ${capacity}` : `Registered: ${capacity}`}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
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
            <DialogTitle>{editingEvent ? "Edit event" : "Schedule event"}</DialogTitle>
            <DialogDescription>Provide the essential logistics so crews and partners can attend.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, category: value as EventCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conference">{categoryLabels.conference}</SelectItem>
                    <SelectItem value="training">{categoryLabels.training}</SelectItem>
                    <SelectItem value="inspection">{categoryLabels.inspection}</SelectItem>
                    <SelectItem value="maintenance">{categoryLabels.maintenance}</SelectItem>
                    <SelectItem value="other">{categoryLabels.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formState.startDate}
                  onChange={(event) => setFormState((prev) => ({ ...prev, startDate: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formState.endDate}
                  onChange={(event) => setFormState((prev) => ({ ...prev, endDate: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="locationName">Location</Label>
                <Input
                  id="locationName"
                  value={formState.locationName}
                  onChange={(event) => setFormState((prev) => ({ ...prev, locationName: event.target.value }))}
                  required
                />
              </div>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Maximum participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                min={0}
                value={formState.maxParticipants}
                onChange={(event) => {
                  const value = event.target.value
                  setFormState((prev) => ({
                    ...prev,
                    maxParticipants: value === "" ? "" : Number.parseInt(value),
                  }))
                }}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingEvent ? "Save changes" : "Create event"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

function toLocalInputValue(value: string) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function fromLocalInputValue(value: string) {
  return new Date(value).toISOString()
}
