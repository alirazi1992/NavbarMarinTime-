import type { Event } from "@/lib/types"
import { getFromStorage, saveToStorage } from "./storage"

const STORAGE_KEY = "maritime_events"

const seedEvents: Event[] = [
  {
    id: "e1",
    title: "کنفرانس دریانوردی خلیج فارس",
    description: "کنفرانس سالانه دریانوردی با حضور متخصصان بین‌المللی",
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(),
    location: {
      name: "بندر عباس",
      lat: 27.1865,
      lng: 56.2808,
    },
    category: "conference",
    maxParticipants: 200,
    registeredCount: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: "e2",
    title: "دوره آموزشی ایمنی دریایی",
    description: "دوره جامع آموزش ایمنی و مقررات دریایی",
    startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    location: {
      name: "تهران",
      lat: 35.6892,
      lng: 51.389,
    },
    category: "training",
    maxParticipants: 50,
    registeredCount: 32,
    createdAt: new Date().toISOString(),
  },
]

export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return getFromStorage(STORAGE_KEY, seedEvents)
  },

  getById: async (id: string): Promise<Event | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const events = getFromStorage<Event[]>(STORAGE_KEY, seedEvents)
    return events.find((e) => e.id === id) || null
  },

  create: async (event: Omit<Event, "id" | "createdAt" | "registeredCount">): Promise<Event> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const events = getFromStorage<Event[]>(STORAGE_KEY, seedEvents)
    const newEvent: Event = {
      ...event,
      id: `e${Date.now()}`,
      registeredCount: 0,
      createdAt: new Date().toISOString(),
    }
    events.push(newEvent)
    saveToStorage(STORAGE_KEY, events)
    return newEvent
  },

  update: async (id: string, updates: Partial<Event>): Promise<Event | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const events = getFromStorage<Event[]>(STORAGE_KEY, seedEvents)
    const index = events.findIndex((e) => e.id === id)
    if (index === -1) return null

    events[index] = { ...events[index], ...updates }
    saveToStorage(STORAGE_KEY, events)
    return events[index]
  },

  delete: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const events = getFromStorage<Event[]>(STORAGE_KEY, seedEvents)
    const filtered = events.filter((e) => e.id !== id)
    if (filtered.length === events.length) return false
    saveToStorage(STORAGE_KEY, filtered)
    return true
  },

  register: async (eventId: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const events = getFromStorage<Event[]>(STORAGE_KEY, seedEvents)
    const event = events.find((e) => e.id === eventId)
    if (!event) return false
    if (event.maxParticipants && event.registeredCount >= event.maxParticipants) return false

    event.registeredCount++
    saveToStorage(STORAGE_KEY, events)
    return true
  },
}
