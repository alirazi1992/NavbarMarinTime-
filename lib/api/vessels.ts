import type { Vessel } from "@/lib/types"
import { getFromStorage, saveToStorage } from "./storage"

const STORAGE_KEY = "maritime_vessels"

// Initial seed data
const seedVessels: Vessel[] = [
  {
    id: "v1",
    name: "کشتی آزادی",
    type: "cargo",
    ownerId: "2",
    ownerName: "کاربر نمونه",
    status: "active",
    position: { lat: 27.1865, lng: 56.2808 },
    speed: 12.5,
    heading: 45,
    lastUpdate: new Date().toISOString(),
    imo: "9234567",
    mmsi: "422123456",
    callSign: "EPAA",
    flag: "IR",
    length: 180,
    beam: 28,
    draft: 9.5,
  },
  {
    id: "v2",
    name: "نفتکش خلیج فارس",
    type: "tanker",
    ownerId: "2",
    ownerName: "کاربر نمونه",
    status: "active",
    position: { lat: 26.5, lng: 55.8 },
    speed: 8.2,
    heading: 180,
    lastUpdate: new Date().toISOString(),
    imo: "9345678",
    mmsi: "422234567",
    callSign: "EPBB",
    flag: "IR",
    length: 250,
    beam: 42,
    draft: 15,
  },
  {
    id: "v3",
    name: "کشتی تجاری پارس",
    type: "cargo",
    ownerId: "2",
    ownerName: "کاربر نمونه",
    status: "pending",
    position: { lat: 27.5, lng: 56.5 },
    speed: 0,
    heading: 0,
    lastUpdate: new Date().toISOString(),
    imo: "9456789",
    mmsi: "422345678",
    callSign: "EPCC",
    flag: "IR",
    length: 150,
    beam: 24,
    draft: 8,
  },
]

export const vesselsApi = {
  getAll: async (): Promise<Vessel[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return getFromStorage(STORAGE_KEY, seedVessels)
  },

  getById: async (id: string): Promise<Vessel | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const vessels = getFromStorage<Vessel[]>(STORAGE_KEY, seedVessels)
    return vessels.find((v) => v.id === id) || null
  },

  getByOwnerId: async (ownerId: string): Promise<Vessel[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const vessels = getFromStorage<Vessel[]>(STORAGE_KEY, seedVessels)
    return vessels.filter((v) => v.ownerId === ownerId)
  },

  create: async (vessel: Omit<Vessel, "id" | "lastUpdate">): Promise<Vessel> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const vessels = getFromStorage<Vessel[]>(STORAGE_KEY, seedVessels)
    const newVessel: Vessel = {
      ...vessel,
      id: `v${Date.now()}`,
      lastUpdate: new Date().toISOString(),
    }
    vessels.push(newVessel)
    saveToStorage(STORAGE_KEY, vessels)
    return newVessel
  },

  update: async (id: string, updates: Partial<Vessel>): Promise<Vessel | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const vessels = getFromStorage<Vessel[]>(STORAGE_KEY, seedVessels)
    const index = vessels.findIndex((v) => v.id === id)
    if (index === -1) return null

    vessels[index] = {
      ...vessels[index],
      ...updates,
      lastUpdate: new Date().toISOString(),
    }
    saveToStorage(STORAGE_KEY, vessels)
    return vessels[index]
  },

  delete: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const vessels = getFromStorage<Vessel[]>(STORAGE_KEY, seedVessels)
    const filtered = vessels.filter((v) => v.id !== id)
    if (filtered.length === vessels.length) return false
    saveToStorage(STORAGE_KEY, filtered)
    return true
  },

  updateStatus: async (id: string, status: Vessel["status"]): Promise<Vessel | null> => {
    return vesselsApi.update(id, { status })
  },
}
