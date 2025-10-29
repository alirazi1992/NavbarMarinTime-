import type { OceanReading } from "@/lib/types"
import { getFromStorage, saveToStorage } from "./storage"

const STORAGE_KEY = "maritime_ocean_readings"

// Generate seed data
const generateSeedReadings = (): OceanReading[] => {
  const readings: OceanReading[] = []
  const now = new Date()

  for (let i = 0; i < 20; i++) {
    const timestamp = new Date(now.getTime() - i * 3600000).toISOString()
    readings.push({
      id: `or${i + 1}`,
      position: {
        lat: 27.1865 + (Math.random() - 0.5) * 0.5,
        lng: 56.2808 + (Math.random() - 0.5) * 0.5,
      },
      timestamp,
      wind: {
        speed: 10 + Math.random() * 15,
        direction: Math.floor(Math.random() * 360),
      },
      wave: {
        height: 1 + Math.random() * 2,
        period: 5 + Math.random() * 5,
      },
      swell: {
        height: 0.5 + Math.random() * 1.5,
        direction: Math.floor(Math.random() * 360),
        period: 8 + Math.random() * 4,
      },
      current: {
        speed: 0.5 + Math.random() * 1.5,
        direction: Math.floor(Math.random() * 360),
      },
      temperature: {
        air: 18 + Math.random() * 8,
        sea: 16 + Math.random() * 6,
      },
      visibility: 5 + Math.random() * 10,
      beaufort: Math.floor(3 + Math.random() * 3),
      course: Math.floor(Math.random() * 360),
    })
  }

  return readings
}

export const oceanApi = {
  getAll: async (): Promise<OceanReading[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return getFromStorage(STORAGE_KEY, generateSeedReadings())
  },

  getLatest: async (): Promise<OceanReading | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const readings = getFromStorage<OceanReading[]>(STORAGE_KEY, generateSeedReadings())
    return readings.length > 0 ? readings[0] : null
  },

  getByVessel: async (vesselId: string): Promise<OceanReading[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const readings = getFromStorage<OceanReading[]>(STORAGE_KEY, generateSeedReadings())
    return readings.filter((r) => r.vesselId === vesselId)
  },

  create: async (reading: Omit<OceanReading, "id">): Promise<OceanReading> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const readings = getFromStorage<OceanReading[]>(STORAGE_KEY, generateSeedReadings())
    const newReading: OceanReading = {
      ...reading,
      id: `or${Date.now()}`,
    }
    readings.unshift(newReading)
    saveToStorage(STORAGE_KEY, readings)
    return newReading
  },

  delete: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const readings = getFromStorage<OceanReading[]>(STORAGE_KEY, generateSeedReadings())
    const filtered = readings.filter((r) => r.id !== id)
    if (filtered.length === readings.length) return false
    saveToStorage(STORAGE_KEY, filtered)
    return true
  },
}
