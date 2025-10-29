import type { Region, Policy } from "@/lib/types"
import { getFromStorage, saveToStorage } from "./storage"

const REGIONS_KEY = "maritime_regions"
const POLICIES_KEY = "maritime_policies"

const seedRegions: Region[] = [
  {
    id: "r1",
    name: "بندر عباس",
    type: "port",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [56.25, 27.15],
          [56.35, 27.15],
          [56.35, 27.25],
          [56.25, 27.25],
          [56.25, 27.15],
        ],
      ],
    },
    description: "منطقه بندری بندر عباس",
    createdAt: new Date().toISOString(),
  },
  {
    id: "r2",
    name: "منطقه حفاظت شده",
    type: "conservation",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [55.8, 26.8],
          [56.0, 26.8],
          [56.0, 27.0],
          [55.8, 27.0],
          [55.8, 26.8],
        ],
      ],
    },
    description: "منطقه حفاظت شده دریایی",
    createdAt: new Date().toISOString(),
  },
]

const seedPolicies: Policy[] = [
  {
    id: "p1",
    regionId: "r1",
    title: "قوانین ورود به بندر",
    content: "کلیه شناورها باید قبل از ورود به بندر، اطلاعات خود را به مرکز کنترل ترافیک اعلام نمایند.",
    category: "navigation",
    effectiveDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    regionId: "r2",
    title: "محدودیت‌های زیست‌محیطی",
    content: "در این منطقه، تخلیه هرگونه مواد زائد و آلاینده ممنوع است.",
    category: "environmental",
    effectiveDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
]

export const regionsApi = {
  getAll: async (): Promise<Region[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return getFromStorage(REGIONS_KEY, seedRegions)
  },

  getById: async (id: string): Promise<Region | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const regions = getFromStorage<Region[]>(REGIONS_KEY, seedRegions)
    return regions.find((r) => r.id === id) || null
  },

  create: async (region: Omit<Region, "id" | "createdAt">): Promise<Region> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const regions = getFromStorage<Region[]>(REGIONS_KEY, seedRegions)
    const newRegion: Region = {
      ...region,
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    regions.push(newRegion)
    saveToStorage(REGIONS_KEY, regions)
    return newRegion
  },

  update: async (id: string, updates: Partial<Region>): Promise<Region | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const regions = getFromStorage<Region[]>(REGIONS_KEY, seedRegions)
    const index = regions.findIndex((r) => r.id === id)
    if (index === -1) return null

    regions[index] = { ...regions[index], ...updates }
    saveToStorage(REGIONS_KEY, regions)
    return regions[index]
  },

  delete: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const regions = getFromStorage<Region[]>(REGIONS_KEY, seedRegions)
    const filtered = regions.filter((r) => r.id !== id)
    if (filtered.length === regions.length) return false
    saveToStorage(REGIONS_KEY, filtered)
    return true
  },
}

export const policiesApi = {
  getAll: async (): Promise<Policy[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return getFromStorage(POLICIES_KEY, seedPolicies)
  },

  getByRegion: async (regionId: string): Promise<Policy[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const policies = getFromStorage<Policy[]>(POLICIES_KEY, seedPolicies)
    return policies.filter((p) => p.regionId === regionId)
  },

  create: async (policy: Omit<Policy, "id" | "createdAt">): Promise<Policy> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const policies = getFromStorage<Policy[]>(POLICIES_KEY, seedPolicies)
    const newPolicy: Policy = {
      ...policy,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    policies.push(newPolicy)
    saveToStorage(POLICIES_KEY, policies)
    return newPolicy
  },

  update: async (id: string, updates: Partial<Policy>): Promise<Policy | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const policies = getFromStorage<Policy[]>(POLICIES_KEY, seedPolicies)
    const index = policies.findIndex((p) => p.id === id)
    if (index === -1) return null

    policies[index] = { ...policies[index], ...updates }
    saveToStorage(POLICIES_KEY, policies)
    return policies[index]
  },

  delete: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const policies = getFromStorage<Policy[]>(POLICIES_KEY, seedPolicies)
    const filtered = policies.filter((p) => p.id !== id)
    if (filtered.length === policies.length) return false
    saveToStorage(POLICIES_KEY, filtered)
    return true
  },
}
