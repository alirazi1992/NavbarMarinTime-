"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wind, Waves, Navigation } from "lucide-react"
import { useTranslation } from "@/lib/hooks/use-translation"

interface WeatherData {
  timestamp: string
  course: number
  beaufortScale: number
  douglasSeaScale: number
  airTemp: number
  seaTemp: number
  windSpeed: number
  windDirection: number
  waveHeight: number
  swellHeight: number
  swellDirection: number
  currentSpeed: number
  currentDirection: number
}

interface WeatherCardProps {
  data: WeatherData
}

function CompassIndicator({ direction, label }: { direction: number; label: string }) {
  return (
    <div className="relative w-16 h-16">
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
        <text x="32" y="8" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5">
          N
        </text>
        <text x="56" y="35" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5">
          E
        </text>
        <text x="32" y="60" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5">
          S
        </text>
        <text x="8" y="35" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5">
          W
        </text>
        <g transform={`rotate(${direction} 32 32)`}>
          <path d="M32 12 L36 28 L32 26 L28 28 Z" fill="#3b82f6" />
          <path d="M32 52 L36 36 L32 38 L28 36 Z" fill="#60a5fa" opacity="0.6" />
        </g>
      </svg>
    </div>
  )
}

export function WeatherCard({ data }: WeatherCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("weather.title")}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {t("weather.course")}: {data.course}°
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{data.timestamp}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">BF</p>
            <p className="text-2xl font-bold">{data.beaufortScale}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">DSS</p>
            <p className="text-2xl font-bold">{data.douglasSeaScale}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("weather.airTemp")}</p>
            <p className="text-2xl font-bold">{data.airTemp}°</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("weather.seaTemp")}</p>
            <p className="text-2xl font-bold">{data.seaTemp}°</p>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Wind className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{t("weather.wind")}</span>
              </div>
              <p className="text-lg font-bold">{data.windSpeed} kn</p>
              <p className="text-sm text-muted-foreground">{data.windDirection}°</p>
            </div>
            <CompassIndicator direction={data.windDirection} label="Wind" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Waves className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{t("weather.wave")}</span>
              </div>
              <p className="text-lg font-bold">{data.waveHeight} m</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <span className="text-sm font-medium">{t("weather.swell")}</span>
              <p className="text-lg font-bold">{data.swellHeight} m</p>
              <p className="text-sm text-muted-foreground">{data.swellDirection}°</p>
            </div>
            <CompassIndicator direction={data.swellDirection} label="Swell" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{t("weather.current")}</span>
              </div>
              <p className="text-lg font-bold">{data.currentSpeed} kn</p>
              <p className="text-sm text-muted-foreground">{data.currentDirection}°</p>
            </div>
            <CompassIndicator direction={data.currentDirection} label="Current" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
