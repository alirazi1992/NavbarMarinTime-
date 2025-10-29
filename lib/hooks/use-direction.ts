"use client"

import { useUIStore } from "@/lib/store/ui-store"
import { localeDirections } from "@/lib/i18n/config"
import { useEffect, useState } from "react"

export function useDirection() {
  const [mounted, setMounted] = useState(false)
  const locale = useUIStore((state) => state.locale)
  const hasHydrated = useUIStore((state) => state._hasHydrated)
  const direction = localeDirections[locale]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && hasHydrated && typeof document !== "undefined") {
      document.documentElement.dir = direction
      document.documentElement.lang = locale
    }
  }, [direction, locale, mounted, hasHydrated])

  return direction
}
