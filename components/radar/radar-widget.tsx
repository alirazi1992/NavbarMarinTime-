"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Vessel } from "@/lib/types"

interface RadarWidgetProps {
  vessels: Vessel[]
  centerLat: number
  centerLng: number
  range?: number // nautical miles
  onTargetClick?: (vessel: Vessel) => void
}

const CANVAS_SIZE = 600

export function RadarWidget({ vessels, centerLat, centerLng, range = 50, onTargetClick }: RadarWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sweepAngle, setSweepAngle] = useState(0)
  const [gain, setGain] = useState(50)
  const [threshold, setThreshold] = useState(30)
  const [pulseLength, setPulseLength] = useState(50)
  const [stcEnabled, setStcEnabled] = useState(true)
  const [cfarEnabled, setCfarEnabled] = useState(false)
  const [boostEnabled, setBoostEnabled] = useState(false)
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle((prev) => (prev + 2) % 360)
    }, 50)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 20

    ctx.fillStyle = "rgba(0, 20, 40, 0.95)"
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = "rgba(0, 255, 100, 0.3)"
    ctx.lineWidth = 1
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, (radius / 4) * i, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = "rgba(0, 255, 100, 0.6)"
      ctx.font = "10px monospace"
      ctx.fillText(`${((range / 4) * i).toFixed(0)} NM`, centerX + 5, centerY - (radius / 4) * i + 5)
    }

    ctx.strokeStyle = "rgba(0, 255, 100, 0.4)"
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - radius)
    ctx.lineTo(centerX, centerY + radius)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(centerX - radius, centerY)
    ctx.lineTo(centerX + radius, centerY)
    ctx.stroke()

    ctx.fillStyle = "rgba(0, 255, 100, 0.8)"
    ctx.font = "14px monospace"
    ctx.textAlign = "center"
    ctx.fillText("N", centerX, centerY - radius - 5)
    ctx.fillText("S", centerX, centerY + radius + 15)
    ctx.textAlign = "right"
    ctx.fillText("W", centerX - radius - 5, centerY + 5)
    ctx.textAlign = "left"
    ctx.fillText("E", centerX + radius + 5, centerY + 5)

    const sweepRad = (sweepAngle * Math.PI) / 180
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, "rgba(0, 255, 100, 0.3)")
    gradient.addColorStop(0.5, "rgba(0, 255, 100, 0.1)")
    gradient.addColorStop(1, "rgba(0, 255, 100, 0)")

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(sweepRad)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, radius, -Math.PI / 12, Math.PI / 12)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.restore()

    const gainFactor = 1 + gain / 50
    const noiseLevel = threshold / 100

    vessels.forEach((vessel) => {
      const latDiff = vessel.position.lat - centerLat
      const lngDiff = vessel.position.lng - centerLng

      const distanceNM = Math.sqrt(
        latDiff * latDiff * 3600 + lngDiff * lngDiff * 3600 * Math.cos((centerLat * Math.PI) / 180),
      )
      if (distanceNM > range) return

      const angle = Math.atan2(lngDiff, latDiff)
      const angleDeg = (angle * 180) / Math.PI
      const targetRadius = (distanceNM / range) * radius
      const targetX = centerX + targetRadius * Math.sin((angleDeg * Math.PI) / 180)
      const targetY = centerY - targetRadius * Math.cos((angleDeg * Math.PI) / 180)

      let intensity = 0.6 * gainFactor
      if (stcEnabled) {
        intensity *= distanceNM / range + 0.4
      }
      if (cfarEnabled) {
        intensity *= 1 - noiseLevel
      }
      if (boostEnabled) {
        intensity *= 1.2
      }

      ctx.beginPath()
      ctx.arc(targetX, targetY, 6, 0, Math.PI * 2)
      ctx.closePath()
      ctx.fillStyle = `rgba(0, 255, 180, ${Math.min(intensity, 1)})`
      ctx.fill()
    })
  }, [boostEnabled, cfarEnabled, centerLat, centerLng, gain, range, stcEnabled, threshold, vessels, sweepAngle])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) / 2 - 20

    for (const vessel of vessels) {
      const latDiff = vessel.position.lat - centerLat
      const lngDiff = vessel.position.lng - centerLng
      const distanceNM = Math.sqrt(
        latDiff * latDiff * 3600 + lngDiff * lngDiff * 3600 * Math.cos((centerLat * Math.PI) / 180),
      )
      if (distanceNM > range) continue

      const angle = Math.atan2(lngDiff, latDiff)
      const angleDeg = (angle * 180) / Math.PI
      const targetRadius = (distanceNM / range) * radius
      const targetX = centerX + targetRadius * Math.sin((angleDeg * Math.PI) / 180)
      const targetY = centerY - targetRadius * Math.cos((angleDeg * Math.PI) / 180)

      const distance = Math.sqrt((x - targetX) ** 2 + (y - targetY) ** 2)
      if (distance < 10) {
        setSelectedVessel(vessel)
        onTargetClick?.(vessel)
        return
      }
    }

    setSelectedVessel(null)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <Card>
        <CardHeader>
          <CardTitle>نمای راداری</CardTitle>
        </CardHeader>
        <CardContent>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="w-full cursor-crosshair rounded-lg"
            onClick={handleCanvasClick}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">تنظیمات رادار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Gain: {gain}%</Label>
              <Slider value={[gain]} onValueChange={(v) => setGain(v[0])} max={100} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Threshold: {threshold}%</Label>
              <Slider value={[threshold]} onValueChange={(v) => setThreshold(v[0])} max={100} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Pulse length: {pulseLength}%</Label>
              <Slider value={[pulseLength]} onValueChange={(v) => setPulseLength(v[0])} max={100} step={1} />
            </div>
            <div className="flex items-center justify-between">
              <Label>STC</Label>
              <Switch checked={stcEnabled} onCheckedChange={setStcEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <Label>CFAR</Label>
              <Switch checked={cfarEnabled} onCheckedChange={setCfarEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Boost</Label>
              <Switch checked={boostEnabled} onCheckedChange={setBoostEnabled} />
            </div>
          </CardContent>
        </Card>

        {selectedVessel && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">جزئیات هدف</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-muted-foreground">نام شناور</Label>
                <p className="font-medium">{selectedVessel.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">نوع</Label>
                <p className="font-medium">{selectedVessel.type}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-muted-foreground">سرعت</Label>
                  <p className="font-medium">{selectedVessel.speed} kn</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">سمت</Label>
                  <p className="font-medium">{selectedVessel.heading}°</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">مختصات</Label>
                <p className="font-mono text-sm">
                  {selectedVessel.position.lat.toFixed(4)}°, {selectedVessel.position.lng.toFixed(4)}°
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={() => setSelectedVessel(null)}>
                بستن جزئیات
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
