"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ship, Activity, AlertTriangle, Bell } from "lucide-react"
import { vesselsApi } from "@/lib/api/vessels"
import { alertsApi } from "@/lib/api/alerts"
import { newsApi } from "@/lib/api/news"
import { useAuthStore } from "@/lib/store/auth-store"
import { clientNavItems } from "@/lib/config/navigation"
import type { Vessel, Alert, News } from "@/lib/types"

export default function ClientDashboard() {
  const user = useAuthStore((state) => state.user)
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        const [vesselsData, alertsData, newsData] = await Promise.all([
          vesselsApi.getByOwnerId(user.id),
          alertsApi.getUnread(),
          newsApi.getAll(),
        ])
        setVessels(vesselsData)
        setAlerts(alertsData)
        setNews(newsData.filter((n) => !n.isRead).slice(0, 5))
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const activeVessels = vessels.filter((v) => v.status === "active").length

  return (
    <DashboardLayout sidebarItems={clientNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">خوش آمدید، {user?.name}</h1>
          <p className="text-muted-foreground">نمای کلی شناورها و فعالیت‌های شما</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="شناورهای من"
            value={loading ? "..." : vessels.length}
            icon={<Ship className="h-4 w-4" />}
            description="تعداد کل شناورها"
          />
          <StatCard
            title="شناورهای فعال"
            value={loading ? "..." : activeVessels}
            icon={<Activity className="h-4 w-4" />}
            description="در حال فعالیت"
          />
          <StatCard
            title="هشدارها"
            value={loading ? "..." : alerts.length}
            icon={<AlertTriangle className="h-4 w-4" />}
            description="هشدارهای خوانده نشده"
          />
          <StatCard
            title="اخبار جدید"
            value={loading ? "..." : news.length}
            icon={<Bell className="h-4 w-4" />}
            description="اطلاعیه‌های جدید"
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* My Vessels */}
          <Card>
            <CardHeader>
              <CardTitle>شناورهای من</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">در حال بارگذاری...</p>
              ) : vessels.length === 0 ? (
                <p className="text-muted-foreground">شناوری ثبت نشده است</p>
              ) : (
                <div className="space-y-4">
                  {vessels.map((vessel) => (
                    <div
                      key={vessel.id}
                      className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Ship className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{vessel.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {vessel.speed} گره • {vessel.heading}°
                          </p>
                        </div>
                      </div>
                      <div
                        className={`rounded-full px-2 py-1 text-xs ${
                          vessel.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : vessel.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {vessel.status === "active" ? "فعال" : vessel.status === "pending" ? "در انتظار" : "غیرفعال"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent News */}
          <Card>
            <CardHeader>
              <CardTitle>اخبار و اطلاعیه‌ها</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">در حال بارگذاری...</p>
              ) : news.length === 0 ? (
                <p className="text-muted-foreground">خبری وجود ندارد</p>
              ) : (
                <div className="space-y-4">
                  {news.map((item) => (
                    <div key={item.id} className="border-b border-border pb-3 last:border-0">
                      <div className="flex items-start gap-2">
                        <div
                          className={`mt-1 h-2 w-2 rounded-full ${
                            item.category === "warning"
                              ? "bg-red-500"
                              : item.category === "announcement"
                                ? "bg-blue-500"
                                : "bg-green-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(item.publishedAt).toLocaleDateString("fa-IR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>هشدارهای فعال</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                      alert.level === "danger"
                        ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                        : alert.level === "warning"
                          ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950"
                          : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950"
                    }`}
                  >
                    <AlertTriangle
                      className={`mt-0.5 h-5 w-5 ${
                        alert.level === "danger"
                          ? "text-red-600"
                          : alert.level === "warning"
                            ? "text-yellow-600"
                            : "text-blue-600"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString("fa-IR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
