"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Vessel, Region } from "@/lib/types"
import { Layers } from "lucide-react"

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const Polygon = dynamic(() => import("react-leaflet").then((mod) => mod.Polygon), { ssr: false })

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

interface VesselMapProps {
  vessels: Vessel[]
  regions?: Region[]
  center?: [number, number]
  zoom?: number
  onVesselClick?: (vessel: Vessel) => void
}

export function VesselMap({
  vessels,
  regions = [],
  center = [27.1865, 56.2808],
  zoom = 8,
  onVesselClick,
}: VesselMapProps) {
  const [mounted, setMounted] = useState(false)
  const [showVessels, setShowVessels] = useState(true)
  const [showRegions, setShowRegions] = useState(true)
  const [showPorts, setShowPorts] = useState(true)
  const [layersOpen, setLayersOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: typeof markerIcon2x === "string" ? markerIcon2x : markerIcon2x.src,
          iconUrl: typeof markerIcon === "string" ? markerIcon : markerIcon.src,
          shadowUrl: typeof markerShadow === "string" ? markerShadow : markerShadow.src,
        })
      })
    }
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card>
        <CardContent className="flex h-[600px] items-center justify-center">
          <p className="text-muted-foreground">در حال آماده‌سازی نقشه...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>نقشه زنده ناوگان</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setLayersOpen((prev) => !prev)}>
            <Layers className="ml-2 h-4 w-4" />
            لایه‌ها
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] w-full">
            <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} className="z-0">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Vessels Layer */}
              {showVessels &&
                vessels.map((vessel) => (
                  <Marker
                    key={vessel.id}
                    position={[vessel.position.lat, vessel.position.lng]}
                    eventHandlers={{
                      click: () => onVesselClick?.(vessel),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[200px] space-y-2">
                        <h3 className="font-semibold">{vessel.name}</h3>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-muted-foreground">نوع:</span> {vessel.type}
                          </p>
                          <p>
                            <span className="text-muted-foreground">سرعت:</span> {vessel.speed} گره
                          </p>
                          <p>
                            <span className="text-muted-foreground">سمت:</span> {vessel.heading}°
                          </p>
                          <p>
                            <span className="text-muted-foreground">مالک:</span> {vessel.ownerName}
                          </p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {/* Regions Layer */}
              {showRegions &&
                regions.map((region) => {
                  const isPort = region.type === "port"
                  if (isPort && !showPorts) {
                    return null
                  }

                  return (
                    <Polygon
                      key={region.id}
                      positions={region.geometry.coordinates[0].map(([lng, lat]) => [lat, lng])}
                      pathOptions={{
                        color: isPort ? "#3b82f6" : region.type === "restricted" ? "#ef4444" : "#10b981",
                        fillOpacity: 0.2,
                      }}
                    >
                      <Popup>
                        <div className="min-w-[200px] space-y-2">
                          <h3 className="font-semibold">{region.name}</h3>
                          <p className="text-sm text-muted-foreground">{region.description ?? "بدون توضیحات"}</p>
                        </div>
                      </Popup>
                    </Polygon>
                  )
                })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Layer Control Panel */}
      {layersOpen && (
        <Card className="absolute left-4 top-20 z-10 w-64">
          <CardHeader>
            <CardTitle className="text-base">کنترل لایه‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="vessels" checked={showVessels} onCheckedChange={(checked) => setShowVessels(!!checked)} />
              <Label htmlFor="vessels" className="cursor-pointer">
                شناورها
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="regions" checked={showRegions} onCheckedChange={(checked) => setShowRegions(!!checked)} />
              <Label htmlFor="regions" className="cursor-pointer">
                مناطق عملیاتی
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="ports" checked={showPorts} onCheckedChange={(checked) => setShowPorts(!!checked)} />
              <Label htmlFor="ports" className="cursor-pointer">
                بنادر
              </Label>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
