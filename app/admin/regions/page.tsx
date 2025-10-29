"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { adminNavItems } from "@/lib/config/navigation"
import { regionsApi, policiesApi } from "@/lib/api/regions"
import type { Policy, Region } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Layers, MapPin, RefreshCcw, ScrollText } from "lucide-react"

const regionTypeLabels: Record<Region["type"], string> = {
  port: "Port",
  restricted: "Restricted",
  fishing: "Fishing zone",
  military: "Military zone",
  conservation: "Conservation area",
  other: "Other",
}

const policyCategoryLabels: Record<Policy["category"], string> = {
  navigation: "Navigation",
  environmental: "Environmental",
  safety: "Safety",
  customs: "Customs",
  other: "Other",
}

export default function AdminRegionsPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [regionsData, policiesData] = await Promise.all([regionsApi.getAll(), policiesApi.getAll()])
      setRegions(regionsData)
      setPolicies(policiesData)
    } catch (error) {
      console.error("Error loading regions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const stats = useMemo(() => {
    const totalRegions = regions.length
    const policyCount = policies.length
    const restricted = regions.filter((region) => region.type === "restricted").length
    const conservation = regions.filter((region) => region.type === "conservation").length
    return { totalRegions, policyCount, restricted, conservation }
  }, [regions, policies])

  return (
    <DashboardLayout sidebarItems={adminNavItems}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Regions &amp; policies</h1>
            <p className="text-muted-foreground">
              Review controlled waters, protected areas, and the active sailing directives that govern them.
            </p>
          </div>
          <Button onClick={loadData} variant="outline" disabled={loading}>
            <RefreshCcw className="ml-2 h-4 w-4" />
            Refresh data
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total regions" value={stats.totalRegions} icon={<MapPin className="h-4 w-4" />} />
          <StatCard title="Policies" value={stats.policyCount} icon={<ScrollText className="h-4 w-4" />} />
          <StatCard title="Restricted zones" value={stats.restricted} icon={<Layers className="h-4 w-4" />} />
          <StatCard title="Conservation areas" value={stats.conservation} icon={<Layers className="h-4 w-4" />} />
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading regions…</div>
        ) : (
          <Tabs defaultValue="regions">
            <TabsList className="w-full max-w-md grid grid-cols-2">
              <TabsTrigger value="regions">Regions</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
            </TabsList>
            <TabsContent value="regions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Region inventory</CardTitle>
                  <CardDescription>Managed maritime zones with their designated type and geometry.</CardDescription>
                </CardHeader>
                <CardContent>
                  {regions.length === 0 ? (
                    <p className="py-12 text-center text-muted-foreground">No regions have been registered yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {regions.map((region) => (
                          <TableRow key={region.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{region.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {region.geometry.coordinates[0].length} vertices
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{regionTypeLabels[region.type]}</Badge>
                            </TableCell>
                            <TableCell>{new Date(region.createdAt).toLocaleDateString("fa-IR")}</TableCell>
                            <TableCell className="max-w-sm truncate text-sm text-muted-foreground">
                              {region.description ?? "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="policies" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Policy register</CardTitle>
                  <CardDescription>Current directives mapped to the zones they regulate.</CardDescription>
                </CardHeader>
                <CardContent>
                  {policies.length === 0 ? (
                    <p className="py-12 text-center text-muted-foreground">No policies are active right now.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Effective date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {policies.map((policy) => {
                          const regionName = regions.find((region) => region.id === policy.regionId)?.name ?? "—"
                          return (
                            <TableRow key={policy.id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{policy.title}</span>
                                  <span className="max-w-xs truncate text-xs text-muted-foreground">{policy.content}</span>
                                </div>
                              </TableCell>
                              <TableCell>{regionName}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{policyCategoryLabels[policy.category]}</Badge>
                              </TableCell>
                              <TableCell>{new Date(policy.effectiveDate).toLocaleDateString("fa-IR")}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: ReactNode
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
