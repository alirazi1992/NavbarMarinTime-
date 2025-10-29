import { LayoutDashboard, Ship, Users, Radar, Waves, MapPin, Briefcase, Calendar, Bell, Settings } from "lucide-react"

export const adminNavItems = [
  {
    title: "داشبورد",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "کاربران",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "شناورها",
    href: "/admin/vessels",
    icon: <Ship className="h-5 w-5" />,
  },
  {
    title: "نقشه و رادار",
    href: "/admin/radar",
    icon: <Radar className="h-5 w-5" />,
  },
  {
    title: "هوا و دریا",
    href: "/admin/ocean",
    icon: <Waves className="h-5 w-5" />,
  },
  {
    title: "مناطق و قوانین",
    href: "/admin/regions",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    title: "دایرکتوری خدمات",
    href: "/admin/services",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: "رویدادها",
    href: "/admin/events",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "اعلان‌ها",
    href: "/admin/alerts",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    title: "تنظیمات",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export const clientNavItems = [
  {
    title: "داشبورد",
    href: "/app",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "شناورهای من",
    href: "/app/vessels",
    icon: <Ship className="h-5 w-5" />,
  },
  {
    title: "نقشه و رادار",
    href: "/app/radar",
    icon: <Radar className="h-5 w-5" />,
  },
  {
    title: "هوا و دریا",
    href: "/app/ocean",
    icon: <Waves className="h-5 w-5" />,
  },
  {
    title: "قوانین منطقه‌ای",
    href: "/app/regions",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    title: "اخبار و اطلاعیه‌ها",
    href: "/app/news",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    title: "رویدادها",
    href: "/app/events",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "تنظیمات",
    href: "/app/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]
