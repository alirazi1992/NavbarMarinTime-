import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Locale } from "@/lib/i18n/config"

interface UIState {
  theme: "light" | "dark"
  locale: Locale
  sidebarOpen: boolean
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: "light" | "dark") => void
  setLocale: (locale: Locale) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "light",
      locale: "fa",
      sidebarOpen: true,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "ui-storage",
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
