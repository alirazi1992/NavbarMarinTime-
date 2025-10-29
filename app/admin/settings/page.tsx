"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { adminNavItems } from "@/lib/config/navigation"
import { useUIStore } from "@/lib/store/ui-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { useToast } from "@/hooks/use-toast"
import { Shield, ShieldAlert, Database, RefreshCcw } from "lucide-react"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const theme = useUIStore((state) => state.theme)
  const locale = useUIStore((state) => state.locale)
  const setTheme = useUIStore((state) => state.setTheme)
  const setLocale = useUIStore((state) => state.setLocale)
  const user = useAuthStore((state) => state.user)

  const [autoSync, setAutoSync] = useState(true)
  const [logRetention, setLogRetention] = useState(true)
  const [alertEscalation, setAlertEscalation] = useState(false)

  const handleApplySecurity = () => {
    toast({
      title: "Security policy applied",
      description: "Updated enforcement rules have been saved.",
    })
  }

  const handleBackup = () => {
    toast({
      title: "Backup started",
      description: "A snapshot of configuration and audit logs is being generated.",
    })
  }

  return (
    <DashboardLayout sidebarItems={adminNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Administration settings</h1>
          <p className="text-muted-foreground">
            Tune security posture, data retention, and operator preferences for the command center.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Identity and personal preferences for the signed-in administrator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="mt-1 font-medium">{user?.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="mt-1 font-medium">{user?.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <p className="mt-1 font-medium">{user?.role === "admin" ? "Administrator" : "Client"}</p>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-1">
                    <p className="font-medium">Enable dark mode</p>
                    <p className="text-sm text-muted-foreground">Switch to a low-light friendly interface.</p>
                  </div>
                  <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-1">
                    <p className="font-medium">Display interface in English</p>
                    <p className="text-sm text-muted-foreground">Toggle bilingual mode for international briefings.</p>
                  </div>
                  <Switch checked={locale === "en"} onCheckedChange={(checked) => setLocale(checked ? "en" : "fa")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security &amp; operations</CardTitle>
              <CardDescription>Control data flow, retention rules, and alert escalation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-start gap-3">
                  <Shield className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Automatic radar synchronization</p>
                    <p className="text-sm text-muted-foreground">
                      Refresh vessel telemetry and regional overlays every 15 minutes.
                    </p>
                  </div>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-start gap-3">
                  <Database className="mt-1 h-5 w-5 text-chart-2" />
                  <div>
                    <p className="font-medium">Retain audit logs for 90 days</p>
                    <p className="text-sm text-muted-foreground">
                      Preserve user sessions, access changes, and alert acknowledgements.
                    </p>
                  </div>
                </div>
                <Switch checked={logRetention} onCheckedChange={setLogRetention} />
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-1 h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium">Escalate critical alerts automatically</p>
                    <p className="text-sm text-muted-foreground">
                      Trigger SMS and automated calls when hazard-level alerts are raised.
                    </p>
                  </div>
                </div>
                <Switch checked={alertEscalation} onCheckedChange={setAlertEscalation} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleApplySecurity}>
                  <Shield className="ml-2 h-4 w-4" />
                  Apply security policies
                </Button>
                <Button variant="outline" onClick={handleBackup}>
                  <RefreshCcw className="ml-2 h-4 w-4" />
                  Start backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
