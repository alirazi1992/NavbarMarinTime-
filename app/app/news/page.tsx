"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { newsApi } from "@/lib/api/news"
import { clientNavItems } from "@/lib/config/navigation"
import { useToast } from "@/hooks/use-toast"
import type { News } from "@/lib/types"
import { AlertTriangle, Info, Megaphone, CheckCircle } from "lucide-react"

export default function ClientNewsPage() {
  const { toast } = useToast()
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const loadNews = async () => {
    try {
      const data = await newsApi.getAll()
      setNews(data)
    } catch (error) {
      console.error("Error loading news:", error)
      toast({
        title: "خطا",
        description: "بارگذاری اخبار با خطا مواجه شد",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNews()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await newsApi.markAsRead(id)
      loadNews()
    } catch (error) {
      toast({
        title: "خطا",
        description: "عملیات با خطا مواجه شد",
        variant: "destructive",
      })
    }
  }

  const filteredNews = filter === "unread" ? news.filter((n) => !n.isRead) : news

  const getCategoryIcon = (category: News["category"]) => {
    switch (category) {
      case "warning":
        return <AlertTriangle className="h-5 w-5" />
      case "announcement":
        return <Megaphone className="h-5 w-5" />
      case "update":
        return <Info className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: News["category"]) => {
    switch (category) {
      case "warning":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "announcement":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "update":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  return (
    <DashboardLayout sidebarItems={clientNavItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">اخبار و اطلاعیه‌ها</h1>
            <p className="text-muted-foreground">آخرین اخبار و اطلاعیه‌های دریایی</p>
          </div>
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
              همه
            </Button>
            <Button variant={filter === "unread" ? "default" : "outline"} onClick={() => setFilter("unread")}>
              خوانده نشده
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">در حال بارگذاری...</div>
        ) : filteredNews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {filter === "unread" ? "همه اخبار را خوانده‌اید" : "خبری وجود ندارد"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {filter === "unread" ? "اخبار جدید به محض انتشار نمایش داده می‌شوند" : ""}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNews.map((item) => (
              <Card key={item.id} className={!item.isRead ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-1 rounded-full p-2 ${getCategoryColor(item.category)}`}>
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{item.title}</CardTitle>
                          {!item.isRead && (
                            <Badge variant="default" className="text-xs">
                              جدید
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{new Date(item.publishedAt).toLocaleString("fa-IR")}</CardDescription>
                      </div>
                    </div>
                    {!item.isRead && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(item.id)}>
                        علامت به عنوان خوانده شده
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
