import type { News } from "@/lib/types"
import { getFromStorage, saveToStorage } from "./storage"

const STORAGE_KEY = "maritime_news"

const seedNews: News[] = [
  {
    id: "n1",
    title: "هشدار طوفان در خلیج فارس",
    content:
      "پیش‌بینی می‌شود طوفان شدیدی در ۴۸ ساعت آینده خلیج فارس را تحت تأثیر قرار دهد. به کلیه شناورها توصیه می‌شود از تردد در این منطقه خودداری نمایند.",
    category: "warning",
    publishedAt: new Date().toISOString(),
    isRead: false,
  },
  {
    id: "n2",
    title: "بروزرسانی قوانین بندر",
    content: "قوانین جدید ورود و خروج به بندر عباس از تاریخ ۱۵ فروردین لازم‌الاجرا خواهد شد.",
    category: "announcement",
    regionId: "r1",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
]

export const newsApi = {
  getAll: async (): Promise<News[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return getFromStorage(STORAGE_KEY, seedNews)
  },

  getById: async (id: string): Promise<News | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const news = getFromStorage<News[]>(STORAGE_KEY, seedNews)
    return news.find((n) => n.id === id) || null
  },

  create: async (newsItem: Omit<News, "id">): Promise<News> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const news = getFromStorage<News[]>(STORAGE_KEY, seedNews)
    const newNews: News = {
      ...newsItem,
      id: `n${Date.now()}`,
    }
    news.unshift(newNews)
    saveToStorage(STORAGE_KEY, news)
    return newNews
  },

  markAsRead: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const news = getFromStorage<News[]>(STORAGE_KEY, seedNews)
    const item = news.find((n) => n.id === id)
    if (!item) return false

    item.isRead = true
    saveToStorage(STORAGE_KEY, news)
    return true
  },

  delete: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const news = getFromStorage<News[]>(STORAGE_KEY, seedNews)
    const filtered = news.filter((n) => n.id !== id)
    if (filtered.length === news.length) return false
    saveToStorage(STORAGE_KEY, filtered)
    return true
  },
}
