"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { eventsApi } from "@/lib/api/events"
import { clientNavItems } from "@/lib/config/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Event } from "@/lib/types"
import { Calendar, MapPin, Users, CheckCircle } from "lucide-react"

export default function ClientEventsPage() {
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set())

  const loadEvents = async () => {
    try {
      const data = await eventsApi.getAll()
      setEvents(data)
    } catch (error) {
      console.error("Error loading events:", error)
      toast({
        title: "خطا",
        description: "بارگذاری رویدادها با خطا مواجه شد",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleRegister = async (eventId: string) => {
    try {
      const success = await eventsApi.register(eventId)
      if (success) {
        toast({
          title: "موفق",
          description: "ثبت‌نام شما با موفقیت انجام شد",
        })
        setRegisteredEvents(new Set([...registeredEvents, eventId]))
        loadEvents()
      } else {
        toast({
          title: "خطا",
          description: "ظرفیت رویداد تکمیل شده است",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "ثبت‌نام با خطا مواجه شد",
        variant: "destructive",
      })
    }
  }

  const getCategoryLabel = (category: Event["category"]) => {
    const labels = {
      conference: "کنفرانس",
      training: "آموزشی",
      inspection: "بازرسی",
      maintenance: "تعمیرات",
      other: "سایر",
    }
    return labels[category] || category
  }

  return (
    <DashboardLayout sidebarItems={clientNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">رویدادها</h1>
          <p className="text-muted-foreground">رویدادها و دوره‌های آموزشی دریایی</p>
        </div>

        {loading ? (
          <div className="text-center py-12">در حال بارگذاری...</div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">رویدادی برگزار نمی‌شود</h3>
              <p className="mt-2 text-sm text-muted-foreground">رویدادهای جدید به زودی اعلام خواهند شد</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => {
              const isRegistered = registeredEvents.has(event.id)
              const isFull = event.maxParticipants ? event.registeredCount >= event.maxParticipants : false
              const startDate = new Date(event.startDate)
              const isPast = startDate < new Date()

              return (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription className="mt-1">{event.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{getCategoryLabel(event.category)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{startDate.toLocaleDateString("fa-IR")}</span>
                      {event.endDate && <span>تا {new Date(event.endDate).toLocaleDateString("fa-IR")}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.location.name}</span>
                    </div>
                    {event.maxParticipants && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {event.registeredCount} / {event.maxParticipants} نفر ثبت‌نام کرده‌اند
                        </span>
                      </div>
                    )}
                    <div className="pt-2">
                      {isRegistered ? (
                        <Button disabled className="w-full">
                          <CheckCircle className="ml-2 h-4 w-4" />
                          ثبت‌نام شده
                        </Button>
                      ) : isPast ? (
                        <Button disabled variant="outline" className="w-full bg-transparent">
                          رویداد برگزار شده
                        </Button>
                      ) : isFull ? (
                        <Button disabled variant="outline" className="w-full bg-transparent">
                          ظرفیت تکمیل
                        </Button>
                      ) : (
                        <Button onClick={() => handleRegister(event.id)} className="w-full">
                          ثبت‌نام در رویداد
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
