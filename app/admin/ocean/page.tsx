"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { adminNavItems } from "@/lib/config/navigation"
import { oceanApi } from "@/lib/api/ocean"
import type { OceanReading } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Compass, Droplet, RefreshCcw, Thermometer, Waves, Wind } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  helper?: string
  icon: ReactNode
}

export default function AdminOceanPage() {
  const [readings, setReadings] = useState<OceanReading[]>([])
  const [loading, setLoading] = useState(true)

  const loadReadings = async () => {
    try {
      const data = await oceanApi.getAll()
      setReadings(data)
    } catch (error) {
      console.error("Error loading ocean data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReadings()
  }, [])

  const latest = readings[0] ?? null

  const aggregates = useMemo(() => {
    if (readings.length === 0) {
      return {
        averageWave: 0,
        averageWind: 0,
        averageSeaTemp: 0,
        averageAirTemp: 0,
      }
    }

    const totals = readings.reduce(
      (accumulator, reading) => {
        accumulator.wave += reading.wave.height
        accumulator.wind += reading.wind.speed
        accumulator.seaTemp += reading.temperature.sea
        accumulator.airTemp += reading.temperature.air
        return accumulator
      },
      { wave: 0, wind: 0, seaTemp: 0, airTemp: 0 },
    )

    const count = readings.length
    return {
      averageWave: totals.wave / count,
      averageWind: totals.wind / count,
      averageSeaTemp: totals.seaTemp / count,
      averageAirTemp: totals.airTemp / count,
    }
  }, [readings])

  return (
    <DashboardLayout sidebarItems={adminNavItems}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Weather &amp; Sea State</h1>
            <p className="text-muted-foreground">
              Monitor real-time meteorological and oceanographic conditions for the maritime control room.
            </p>
          </div>
          <Button variant="outline" onClick={loadReadings} disabled={loading}>
            <RefreshCcw className="ml-2 h-4 w-4" />
            Refresh data
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading ocean observations…</div>
        ) : readings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No observations available yet. Connect a sensor feed to begin collecting data.
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              {latest && (
                <Card>
                  <CardHeader>
                    <CardTitle>Latest observation</CardTitle>
                    <CardDescription>
                      {new Date(latest.timestamp).toLocaleString("fa-IR")} · {latest.position.lat.toFixed(3)} /{" "}
                      {latest.position.lng.toFixed(3)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <MetricCard
                        title="Wave height"
                        value={`${latest.wave.height.toFixed(1)} m`}
                        helper={`Period ${latest.wave.period?.toFixed(0) ?? "—"} s`}
                        icon={<Waves className="h-5 w-5 text-chart-1" />}
                      />
                      <MetricCard
                        title="Wind"
                        value={`${latest.wind.speed.toFixed(1)} kt`}
                        helper={`Direction ${latest.wind.direction.toFixed(0)}°`}
                        icon={<Wind className="h-5 w-5 text-chart-2" />}
                      />
                      <MetricCard
                        title="Sea temperature"
                        value={`${latest.temperature.sea.toFixed(1)}°C`}
                        helper={`Air ${latest.temperature.air.toFixed(1)}°C`}
                        icon={<Thermometer className="h-5 w-5 text-chart-3" />}
                      />
                      <MetricCard
                        title="Current"
                        value={`${latest.current.speed.toFixed(1)} kt`}
                        helper={`Direction ${latest.current.direction.toFixed(0)}°`}
                        icon={<Droplet className="h-5 w-5 text-chart-4" />}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average wave height</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{aggregates.averageWave.toFixed(1)} m</div>
                    <p className="mt-1 text-sm text-muted-foreground">Calculated from the latest observations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average wind speed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{aggregates.averageWind.toFixed(1)} kt</div>
                    <p className="mt-1 text-sm text-muted-foreground">Reflects surface wind across the region</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average sea temperature</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{aggregates.averageSeaTemp.toFixed(1)}°C</div>
                    <p className="mt-1 text-sm text-muted-foreground">Near-surface water temperature</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average air temperature</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{aggregates.averageAirTemp.toFixed(1)}°C</div>
                    <p className="mt-1 text-sm text-muted-foreground">Ambient temperature at the observation sites</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Observation log</CardTitle>
                  <CardDescription>15 most recent meteorological and oceanographic records</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Wave height</TableHead>
                        <TableHead>Wind speed</TableHead>
                        <TableHead>Sea temperature</TableHead>
                        <TableHead>Beaufort</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readings.slice(0, 15).map((reading) => (
                        <TableRow key={reading.id}>
                          <TableCell>{new Date(reading.timestamp).toLocaleString("fa-IR")}</TableCell>
                          <TableCell>
                            {reading.position.lat.toFixed(3)} / {reading.position.lng.toFixed(3)}
                          </TableCell>
                          <TableCell>{reading.wave.height.toFixed(1)} m</TableCell>
                          <TableCell>{reading.wind.speed.toFixed(1)} kt</TableCell>
                          <TableCell>{reading.temperature.sea.toFixed(1)}°C</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="inline-flex items-center gap-1">
                              <Compass className="h-3 w-3" />
                              {reading.beaufort}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}

function MetricCard({ title, value, helper, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
      </CardContent>
    </Card>
  )
}
