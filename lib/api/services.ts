import type { Service } from "@/lib/types"
import { getFromStorage, saveToStorage } from "./storage"

const STORAGE_KEY = "maritime_services"

const seedServices: Service[] = [
  {
    id: "s1",
    name: "خدمات تعمیرات دریایی پارس",
    category: "repair",
    description: "ارائه خدمات تعمیر و نگهداری شناورها",
    location: { lat: 27.1865, lng: 56.2808 },
    contact: {
      phone: "+98-21-12345678",
      email: "info@parsrepair.ir",
      website: "https://parsrepair.ir",
    },
    rating: 4.5,
    status: "approved",
    createdAt: new Date().toISOString(),
  },
  {
    id: "s2",
    name: "تأمین سوخت و مواد",
    category: "supply",
    description: "تأمین سوخت، آب و مواد غذایی",
    location: { lat: 27.2, lng: 56.3 },
    contact: {
      phone: "+98-21-87654321",
      email: "supply@maritime.ir",
    },
    rating: 4.2,
    status: "approved",
    createdAt: new Date().toISOString(),
  },
]

export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return getFromStorage(STORAGE_KEY, seedServices)
  },

  getById: async (id: string): Promise<Service | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const services = getFromStorage<Service[]>(STORAGE_KEY, seedServices)
    return services.find((s) => s.id === id) || null
  },

  create: async (service: Omit<Service, "id" | "createdAt">): Promise<Service> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const services = getFromStorage<Service[]>(STORAGE_KEY, seedServices)
    const newService: Service = {
      ...service,
      id: `s${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    services.push(newService)
    saveToStorage(STORAGE_KEY, services)
    return newService
  },

  update: async (id: string, updates: Partial<Service>): Promise<Service | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const services = getFromStorage<Service[]>(STORAGE_KEY, seedServices)
    const index = services.findIndex((s) => s.id === id)
    if (index === -1) return null

    services[index] = { ...services[index], ...updates }
    saveToStorage(STORAGE_KEY, services)
    return services[index]
  },

  delete: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const services = getFromStorage<Service[]>(STORAGE_KEY, seedServices)
    const filtered = services.filter((s) => s.id !== id)
    if (filtered.length === services.length) return false
    saveToStorage(STORAGE_KEY, filtered)
    return true
  },
}
