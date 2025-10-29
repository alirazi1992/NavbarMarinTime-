"use client"

import { useUIStore } from "@/lib/store/ui-store"
import { translations } from "@/lib/i18n/translations"
import { defaultLocale } from "@/lib/i18n/config"
import { useState, useEffect } from "react"

export function useTranslation() {
  const [mounted, setMounted] = useState(false)
  const locale = useUIStore((state) => state.locale)
  const hasHydrated = useUIStore((state) => state._hasHydrated)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeLocale = mounted && hasHydrated ? locale : defaultLocale

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[activeLocale]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return { t, locale: activeLocale }
}
