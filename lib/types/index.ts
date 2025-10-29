export type VesselType = "cargo" | "tanker" | "passenger" | "fishing" | "military" | "other"
export type VesselStatus = "active" | "inactive" | "pending" | "approved" | "rejected"
export type UserRole = "admin" | "client"
export type AlertLevel = "info" | "warning" | "danger"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  status: "active" | "suspended"
}

export interface Vessel {
  id: string
  name: string
  type: VesselType
  ownerId: string
  ownerName: string
  status: VesselStatus
  position: {
    lat: number
    lng: number
  }
  speed: number // knots
  heading: number // degrees
  lastUpdate: string
  imo?: string
  mmsi?: string
  callSign?: string
  flag?: string
  length?: number
  beam?: number
  draft?: number
}

export interface OceanReading {
  id: string
  vesselId?: string
  position: {
    lat: number
    lng: number
  }
  timestamp: string
  wind: {
    speed: number // knots
    direction: number // degrees
  }
  wave: {
    height: number // meters
    period?: number // seconds
  }
  swell: {
    height: number // meters
    direction: number // degrees
    period?: number // seconds
  }
  current: {
    speed: number // knots
    direction: number // degrees
  }
  temperature: {
    air: number // celsius
    sea: number // celsius
  }
  visibility: number // nautical miles
  beaufort: number
  course?: number // degrees
}

export interface Region {
  id: string
  name: string
  type: "port" | "restricted" | "fishing" | "military" | "conservation" | "other"
  geometry: {
    type: "Polygon"
    coordinates: number[][][]
  }
  description?: string
  createdAt: string
}

export interface Policy {
  id: string
  regionId: string
  title: string
  content: string
  category: "navigation" | "environmental" | "safety" | "customs" | "other"
  effectiveDate: string
  createdAt: string
}

export interface News {
  id: string
  title: string
  content: string
  category: "announcement" | "warning" | "update" | "event"
  regionId?: string
  publishedAt: string
  isRead?: boolean
}

export interface Service {
  id: string
  name: string
  category: "repair" | "supply" | "logistics" | "inspection" | "other"
  description: string
  location: {
    lat: number
    lng: number
  }
  contact: {
    phone?: string
    email?: string
    website?: string
  }
  rating?: number
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate?: string
  location: {
    name: string
    lat: number
    lng: number
  }
  category: "conference" | "training" | "inspection" | "maintenance" | "other"
  maxParticipants?: number
  registeredCount: number
  createdAt: string
}

export interface AlertRule {
  id: string
  name: string
  conditions: {
    waveHeight?: { operator: ">" | "<" | "="; value: number }
    windSpeed?: { operator: ">" | "<" | "="; value: number }
    vesselId?: string
    regionId?: string
  }
  alertLevel: AlertLevel
  message: string
  notifyOwner: boolean
  isActive: boolean
  createdAt: string
}

export interface Alert {
  id: string
  ruleId: string
  vesselId?: string
  level: AlertLevel
  message: string
  timestamp: string
  isRead: boolean
}

export interface PowerReading {
  timestamp: string
  power: number // kW
  isCompliant: boolean
}

export interface NonCompliancePeriod {
  startTime: string
  endTime: string
  instruction: string
  constantPower: number
}
