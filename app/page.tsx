import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ship, Radar, Waves, MapPin } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">سامانه جامع نظارت و مدیریت دریایی</h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            مدیریت هوشمند شناورها، رصد وضعیت دریا، و نظارت بر مناطق دریایی
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/login">ورود به سامانه</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              <Link href="/register">ثبت‌نام</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">امکانات سامانه</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Ship className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">مدیریت شناورها</h3>
              <p className="text-muted-foreground">ثبت و پیگیری اطلاعات کامل شناورها</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Radar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">رادار و نقشه</h3>
              <p className="text-muted-foreground">رصد لحظه‌ای موقعیت شناورها</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Waves className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">هوا و دریا</h3>
              <p className="text-muted-foreground">اطلاعات کامل وضعیت دریا و آب‌وهوا</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">مناطق و قوانین</h3>
              <p className="text-muted-foreground">مدیریت مناطق و قوانین دریایی</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <p>© ۱۴۰۳ سامانه نظارت دریایی. تمامی حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  )
}
