import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <div className={cn("mt-2 text-xs", trend.isPositive ? "text-green-600" : "text-red-600")}>
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}
