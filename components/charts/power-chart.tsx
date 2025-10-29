"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { useTranslation } from "@/lib/hooks/use-translation"

interface PowerDataPoint {
  timestamp: string
  actual: number | null
  nonCompliant: number | null
  instruction?: string
  constantPower?: number
}

interface PowerChartProps {
  data: PowerDataPoint[]
  title?: string
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-1">{data.timestamp}</p>
        {data.actual !== null && (
          <p className="text-sm text-blue-600">
            ME Power: <span className="font-bold">{data.actual} kw</span>
          </p>
        )}
        {data.instruction && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-sm font-medium">Instructions:</p>
            <p className="text-sm text-muted-foreground">{data.instruction}</p>
            {data.constantPower && <p className="text-sm font-bold mt-1">Constant Power: {data.constantPower} kw</p>}
          </div>
        )}
      </div>
    )
  }
  return null
}

export function PowerChart({ data, title = "ME Power" }: PowerChartProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              name="Actual"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="nonCompliant"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", r: 4 }}
              name="Non-compliant"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
