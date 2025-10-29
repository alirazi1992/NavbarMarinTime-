import type React from "react"
import type { Metadata } from "next"
import { Vazirmatn } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/providers/theme-provider"
import "./globals.css"

const vazirmatn = Vazirmatn({
  subsets: ["latin", "arabic"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "سامانه نظارت دریایی | Maritime Monitoring System",
  description: "سامانه جامع نظارت و مدیریت شناورها",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
