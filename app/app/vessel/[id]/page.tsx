"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { WeatherCard } from "@/components/weather/weather-card"
import { PowerChart } from "@/components/charts/power-chart"
import { ComplianceTimeline } from "@/components/charts/compliance-timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "@/lib/hooks/use-translation"
import { vesselsApi } from "@/lib/api/vessels"
import type { Vessel } from "@/lib/types"
import { Ship, MapPin, TrendingUp, TrendingDown } from "lucide-react"

export default function VesselDetailPage() {
  const params = useParams()
  const { t } = useTranslation()
  const [vessel, setVessel] = useState<Vessel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVesselData()
  }, [params.id])

  const loadVesselData = async () => {
    try {
      const data = await vesselsApi.getById(params.id as string)
      setVessel(data)
    } catch (error) {
      console.error("Failed to load vessel:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="client">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!vessel) {
    return (
      <DashboardLayout role="client">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("vessels.notFound")}</p>
        </div>
      </DashboardLayout>
    )
  }

  // Mock data for charts
  const powerData = [
    { timestamp: "2020-07-02T00:00:00Z", actual: 95, nonCompliant: null },
    { timestamp: "2020-07-03T00:00:00Z", actual: 102, nonCompliant: null },
    { timestamp: "2020-07-04T00:00:00Z", actual: 98, nonCompliant: null },
    { timestamp: "2020-07-05T00:00:00Z", actual: 105, nonCompliant: null },
    { timestamp: "2020-07-06T00:00:00Z", actual: null, nonCompliant: 98 },
    {
      timestamp: "2020-07-07T00:00:00Z",
      actual: null,
      nonCompliant: 98,
      instruction: "6 July 2020 10:43 - 7 July 2020 23:55",
      constantPower: 98,
    },
    { timestamp: "2020-07-08T00:00:00Z", actual: null, nonCompliant: 110 },
    { timestamp: "2020-07-09T00:00:00Z", actual: 103, nonCompliant: null },
  ]

  const complianceEvents = [
    {
      id: "1",
      startTime: "2020-07-06T10:43:00Z",
      endTime: "2020-07-07T23:55:00Z",
      instruction: "Constant Power: 98 kw",
      constantPower: 98,
      type: "non-compliant" as const,
    },
    {
      id: "2",
      startTime: "2020-07-08T21:10:00Z",
      endTime: "2020-07-09T01:03:00Z",
      instruction: "Constant Power: 110 kw",
      constantPower: 110,
      type: "non-compliant" as const,
    },
  ]

  const weatherData = {
    timestamp: "3 June 2020 - 09:20",
    course: 83,
    beaufortScale: 4,
    douglasSeaScale: 5,
    airTemp: 19,
    seaTemp: 12,
    windSpeed: 17,
    windDirection: 349,
    waveHeight: 2,
    swellHeight: 1.3,
    swellDirection: 101,
    currentSpeed: 1.2,
    currentDirection: 270,
  }

  const efficiencyMetrics = [
    { label: t("vessel.mainEngine"), value: "+2.0%", change: "+5.3 mt", trend: "up", color: "green" },
    { label: t("vessel.overallPerformance"), value: "+4.0%", change: "+7.9 mt", trend: "up", color: "green" },
    { label: t("vessel.weatherImpact"), value: "+7.0%", change: "+1.2 mt", trend: "up", color: "cyan" },
    { label: t("vessel.hullPropeller"), value: "+1.0%", change: "+1.9 mt", trend: "up", color: "orange" },
    { label: t("vessel.cipRisk"), value: "No risk", change: "10min", trend: "neutral", color: "gray" },
    { label: t("vessel.emissionRisk"), value: "3.0%", change: "10.8 mt", trend: "down", color: "red" },
  ]

  return (
    <DashboardLayout role="client">
      <div className="space-y-6">
        {/* Vessel Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Ship className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">{vessel.name}</h1>
              <Badge variant={vessel.status === "active" ? "default" : "secondary"}>
                {t(`vessels.status.${vessel.status}`)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>IMO: {vessel.imo}</span>
              <span>•</span>
              <span>{t(`vessels.type.${vessel.type}`)}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{vessel.currentLocation}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">{t("vessel.overview")}</TabsTrigger>
            <TabsTrigger value="performance">{t("vessel.performance")}</TabsTrigger>
            <TabsTrigger value="compliance">{t("vessel.compliance")}</TabsTrigger>
            <TabsTrigger value="weather">{t("vessel.weather")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Efficiency Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {efficiencyMetrics.map((metric, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className="text-sm text-muted-foreground">{metric.change}</p>
                      </div>
                      {metric.trend === "up" && <TrendingUp className={`w-6 h-6 text-${metric.color}-500`} />}
                      {metric.trend === "down" && <TrendingDown className={`w-6 h-6 text-${metric.color}-500`} />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Vessel Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t("vessel.details")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("vessels.form.flag")}</p>
                    <p className="font-medium">{vessel.flag}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("vessels.form.yearBuilt")}</p>
                    <p className="font-medium">{vessel.yearBuilt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("vessels.form.dwt")}</p>
                    <p className="font-medium">{vessel.dwt?.toLocaleString()} MT</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("vessels.form.speed")}</p>
                    <p className="font-medium">{vessel.speed} knots</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PowerChart data={powerData} title="ME Power" />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <ComplianceTimeline
              events={complianceEvents}
              startDate="2020-07-02T00:00:00Z"
              endDate="2020-07-09T00:00:00Z"
            />
          </TabsContent>

          <TabsContent value="weather" className="space-y-6">
            <div className="flex justify-center">
              <WeatherCard data={weatherData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
