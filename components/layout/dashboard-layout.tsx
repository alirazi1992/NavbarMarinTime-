"use client"

import type React from "react"
import { Header } from "./header"
import { Sidebar, MobileSidebar } from "@/components/ui/sidebar"
import { useUIStore } from "@/lib/store/ui-store"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebarItems: {
    title: string
    href: string
    icon: React.ReactNode
  }[]
}

export function DashboardLayout({ children, sidebarItems }: DashboardLayoutProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden border-l border-border transition-all duration-300 md:block",
            sidebarOpen ? "w-64" : "w-0",
          )}
        >
          {sidebarOpen && <Sidebar items={sidebarItems} />}
        </aside>

        {/* Mobile Sidebar */}
        <MobileSidebar items={sidebarItems} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
