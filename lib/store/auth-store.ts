import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type UserRole = "admin" | "client"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => Promise<{ success: boolean; error?: string }>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: async (email: string, password: string) => {
        // Mock authentication
        const mockUsers = [
          { id: "1", email: "admin@maritime.ir", password: "admin123", name: "مدیر سیستم", role: "admin" as UserRole },
          {
            id: "2",
            email: "client@maritime.ir",
            password: "client123",
            name: "کاربر نمونه",
            role: "client" as UserRole,
          },
        ]

        const user = mockUsers.find((u) => u.email === email && u.password === password)

        if (user) {
          const token = `mock-token-${user.id}-${Date.now()}`
          const { password: _, ...userWithoutPassword } = user

          if (typeof document !== "undefined") {
            try {
              document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`
              document.cookie = `user-role=${user.role}; path=/; max-age=86400; SameSite=Lax`
            } catch (error) {
              console.error("[v0] Failed to set cookies:", error)
            }
          }

          set({ user: userWithoutPassword, token, isAuthenticated: true })
          return { success: true }
        }

        return { success: false, error: "ایمیل یا رمز عبور اشتباه است" }
      },

      logout: () => {
        if (typeof document !== "undefined") {
          try {
            document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax"
            document.cookie = "user-role=; path=/; max-age=0; SameSite=Lax"
          } catch (error) {
            console.error("[v0] Failed to clear cookies:", error)
          }
        }

        set({ user: null, token: null, isAuthenticated: false })
      },

      register: async (email: string, password: string, name: string, role: UserRole) => {
        // Mock registration
        const newUser = {
          id: `user-${Date.now()}`,
          email,
          name,
          role,
        }

        const token = `mock-token-${newUser.id}-${Date.now()}`

        if (typeof document !== "undefined") {
          try {
            document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`
            document.cookie = `user-role=${role}; path=/; max-age=86400; SameSite=Lax`
          } catch (error) {
            console.error("[v0] Failed to set cookies:", error)
          }
        }

        set({ user: newUser, token, isAuthenticated: true })
        return { success: true }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : ({
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
              clear: () => {},
              key: () => null,
              get length() {
                return 0
              },
            } as Storage),
      ),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
