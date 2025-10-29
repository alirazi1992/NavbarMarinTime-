import type { User } from "@/lib/types"
import { getFromStorage, saveToStorage } from "./storage"

const STORAGE_KEY = "maritime_users"

const seedUsers: User[] = [
  {
    id: "u1",
    name: "Sara Rahimi",
    email: "admin@maritime.ir",
    role: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u2",
    name: "Reza Karimi",
    email: "client@maritime.ir",
    role: "client",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u3",
    name: "Operations Duty Officer",
    email: "operations@maritime.ir",
    role: "admin",
    status: "suspended",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    await new Promise((resolve) => setTimeout(resolve, 250))
    return getFromStorage(STORAGE_KEY, seedUsers)
  },

  create: async (user: Omit<User, "id" | "createdAt">): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 350))
    const users = getFromStorage<User[]>(STORAGE_KEY, seedUsers)
    const newUser: User = {
      ...user,
      id: `u${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    saveToStorage(STORAGE_KEY, users)
    return newUser
  },

  update: async (id: string, updates: Partial<Omit<User, "id">>): Promise<User | null> => {
    await new Promise((resolve) => setTimeout(resolve, 350))
    const users = getFromStorage<User[]>(STORAGE_KEY, seedUsers)
    const index = users.findIndex((user) => user.id === id)
    if (index === -1) {
      return null
    }

    users[index] = { ...users[index], ...updates }
    saveToStorage(STORAGE_KEY, users)
    return users[index]
  },

  updateStatus: async (id: string, status: User["status"]): Promise<User | null> => {
    return usersApi.update(id, { status })
  },

  delete: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 250))
    const users = getFromStorage<User[]>(STORAGE_KEY, seedUsers)
    const filtered = users.filter((user) => user.id !== id)
    if (filtered.length === users.length) {
      return false
    }

    saveToStorage(STORAGE_KEY, filtered)
    return true
  },
}
