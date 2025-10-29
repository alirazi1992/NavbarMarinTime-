"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store/auth-store"
import { useTranslation } from "@/lib/hooks/use-translation"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const login = useAuthStore((state) => state.login)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await login(email, password)

    if (result.success) {
      toast({
        title: "ورود موفق",
        description: "به سامانه خوش آمدید",
      })

      // Redirect based on role
      const user = useAuthStore.getState().user
      if (user?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/app")
      }
    } else {
      toast({
        title: "خطا",
        description: result.error || "ورود ناموفق بود",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">سامانه نظارت دریایی</CardTitle>
          <CardDescription className="text-center">{t("auth.signIn")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@maritime.ir"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>حساب آزمایشی مدیر: admin@maritime.ir / admin123</p>
              <p>حساب آزمایشی کاربر: client@maritime.ir / client123</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("auth.login")}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              {t("auth.dontHaveAccount")}{" "}
              <Link href="/register" className="text-primary hover:underline">
                {t("auth.register")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
