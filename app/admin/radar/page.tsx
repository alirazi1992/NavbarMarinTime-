"use client"

import "leaflet/dist/leaflet.css"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RadarWidget } from "@/components/radar/radar-widget"
import { VesselMap } from "@/components/map/vessel-map"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { vesselsApi } from "@/lib/api/vessels"
import { regionsApi } from "@/lib/api/regions"
import { adminNavItems } from "@/lib/config/navigation"
import type { Vessel, Region } from "@/lib/types"

export default function AdminRadarPage() {
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vesselsData, regionsData] = await Promise.all([vesselsApi.getAll(), regionsApi.getAll()])
        setVessels(vesselsData)
        setRegions(regionsData)
      } catch (err) {
        console.error("Error loading radar data:", err)
        setError("امکان دریافت اطلاعات ناوگان و مناطق وجود ندارد. لطفاً دوباره تلاش کنید.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <DashboardLayout sidebarItems={adminNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">نقشه و رادار</h1>
          <p className="text-muted-foreground">
            وضعیت لحظه‌ای ناوگان و مناطق عملیاتی را روی نقشه زنده یا نمای راداری مشاهده کنید.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">در حال بارگذاری داده‌های موقعیت...</div>
        ) : error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
            {error}
          </div>
        ) : (
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="map">نقشه زنده</TabsTrigger>
              <TabsTrigger value="radar">نمای راداری</TabsTrigger>
            </TabsList>
            <TabsContent value="map" className="mt-6">
              <VesselMap vessels={vessels} regions={regions} />
            </TabsContent>
            <TabsContent value="radar" className="mt-6">
              <RadarWidget vessels={vessels} centerLat={27.1865} centerLng={56.2808} range={50} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}
