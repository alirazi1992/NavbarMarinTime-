"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useUIStore } from "@/lib/store/ui-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { clientNavItems } from "@/lib/config/navigation"
import { useTranslation } from "@/lib/hooks/use-translation"

export default function ClientSettingsPage() {
  const { t } = useTranslation()
  const theme = useUIStore((state) => state.theme)
  const locale = useUIStore((state) => state.locale)
  const setTheme = useUIStore((state) => state.setTheme)
  const setLocale = useUIStore((state) => state.setLocale)
  const user = useAuthStore((state) => state.user)

  return (
    <DashboardLayout sidebarItems={clientNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">تنظیمات</h1>
          <p className="text-muted-foreground">مدیریت تنظیمات حساب کاربری</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات حساب کاربری</CardTitle>
              <CardDescription>اطلاعات شخصی شما</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">نام</Label>
                  <p className="mt-1 font-medium">{user?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">ایمیل</Label>
                  <p className="mt-1 font-medium">{user?.email}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">نقش</Label>
                <p className="mt-1 font-medium">{user?.role === "admin" ? "مدیر سیستم" : "کاربر"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>ظاهر</CardTitle>
              <CardDescription>تنظیمات نمایش سامانه</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تم تاریک</Label>
                  <p className="text-sm text-muted-foreground">استفاده از تم تاریک</p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>زبان انگلیسی</Label>
                  <p className="text-sm text-muted-foreground">تغییر زبان به انگلیسی</p>
                </div>
                <Switch checked={locale === "en"} onCheckedChange={(checked) => setLocale(checked ? "en" : "fa")} />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>اعلان‌ها</CardTitle>
              <CardDescription>مدیریت اعلان‌های سامانه</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>هشدارهای دریایی</Label>
                  <p className="text-sm text-muted-foreground">دریافت هشدارهای مربوط به وضعیت دریا</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>اخبار و اطلاعیه‌ها</Label>
                  <p className="text-sm text-muted-foreground">دریافت اخبار و اطلاعیه‌های جدید</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>رویدادها</Label>
                  <p className="text-sm text-muted-foreground">اطلاع‌رسانی رویدادهای جدید</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
