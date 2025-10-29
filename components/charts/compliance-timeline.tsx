"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/lib/hooks/use-translation"
import { useState } from "react"

interface ComplianceEvent {
  id: string
  startTime: string
  endTime: string
  instruction: string
  constantPower: number
  type: "compliant" | "non-compliant"
}

interface ComplianceTimelineProps {
  events: ComplianceEvent[]
  startDate: string
  endDate: string
}

export function ComplianceTimeline({ events, startDate, endDate }: ComplianceTimelineProps) {
  const { t } = useTranslation()
  const [hoveredEvent, setHoveredEvent] = useState<ComplianceEvent | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const totalDuration = end - start

  const getEventPosition = (eventStart: string, eventEnd: string) => {
    const eventStartTime = new Date(eventStart).getTime()
    const eventEndTime = new Date(eventEnd).getTime()

    const left = ((eventStartTime - start) / totalDuration) * 100
    const width = ((eventEndTime - eventStartTime) / totalDuration) * 100

    return { left: `${left}%`, width: `${width}%` }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getDate()} ${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()} ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
  }

  const getDayLabels = () => {
    const labels = []
    const current = new Date(start)
    const endDate = new Date(end)

    while (current <= endDate) {
      labels.push({
        date: new Date(current),
        position: ((current.getTime() - start) / totalDuration) * 100,
      })
      current.setDate(current.getDate() + 1)
    }

    return labels
  }

  const handleMouseEnter = (event: ComplianceEvent, e: React.MouseEvent) => {
    setHoveredEvent(event)
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredEvent) {
      setTooltipPosition({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseLeave = () => {
    setHoveredEvent(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("compliance.timeline")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-32">
          {/* Timeline axis */}
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-border" />

          {/* Day labels */}
          <div className="absolute top-0 left-0 right-0 flex justify-between text-sm text-muted-foreground">
            {getDayLabels().map((label, idx) => (
              <div
                key={idx}
                style={{ position: "absolute", left: `${label.position}%`, transform: "translateX(-50%)" }}
              >
                {label.date.getDate()} {label.date.toLocaleString("default", { month: "short" })}
              </div>
            ))}
          </div>

          {/* Events */}
          <div className="absolute top-10 left-0 right-0 h-6">
            {events.map((event) => {
              const position = getEventPosition(event.startTime, event.endTime)
              return (
                <div
                  key={event.id}
                  className={`absolute h-6 cursor-pointer transition-opacity hover:opacity-80 ${
                    event.type === "non-compliant" ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={position}
                  onMouseEnter={(e) => handleMouseEnter(event, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
              )
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>{t("compliance.compliant")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>{t("compliance.nonCompliant")}</span>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredEvent && (
          <div
            className="fixed z-50 bg-background border rounded-lg p-3 shadow-lg pointer-events-none"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y + 10,
            }}
          >
            <p className="font-medium mb-1">
              {formatDate(hoveredEvent.startTime)} - {formatDate(hoveredEvent.endTime)}
            </p>
            <p className="text-sm">
              <span className="font-medium">{t("compliance.instruction")}:</span> {hoveredEvent.instruction}
            </p>
            <p className="text-sm font-bold text-red-600 mt-1">
              {hoveredEvent.type === "non-compliant" && t("compliance.nonCompliantPeriod")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
