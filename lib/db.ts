"use client"

import { useCallback } from "react"
import { nanoid } from "nanoid"

export type Magazine = {
  id: string
  name: string
  price: number
  language: string
  country: string
  category: string
  format: "print" | "digital"
  issueDate: string
  summary: string
  coverUrl: string
  rating?: number
  reviewsCount?: number
  sellerId: string
  tags?: string[]
  approved?: boolean
  samplePages?: string[]
}

export type Order = {
  id: string
  userId: string
  items: Array<{ magazineId: string; qty: number; price: number; format: "print" | "digital" }>
  total: number
  createdAt: string
}

export type User = {
  id: string
  name: string
  email: string
  role: "buyer" | "seller" | "admin"
}

const KEYS = {
  magazines: "amari:magazines",
  orders: "amari:orders",
  users: "amari:users",
  seeded: "amari:seeded",
}

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(key)
  return raw ? (JSON.parse(raw) as T[]) : []
}

function save<T>(key: string, val: T[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(val))
}

export function useDB() {
  const ensureSeed = useCallback(() => {
    if (typeof window === "undefined") return
    if (localStorage.getItem(KEYS.seeded)) return
    // Seed users
    const users: User[] = [
      { id: "u1", name: "Ayo", email: "ayo@example.com", role: "buyer" },
      { id: "u2", name: "Kofi", email: "kofi@example.com", role: "seller" },
      { id: "u3", name: "Admin", email: "admin@example.com", role: "admin" },
    ]
    save<User>(KEYS.users, users)

    // Seed magazines
    const magazines: Magazine[] = [
      {
        id: "m1",
        name: "Lagos Style — Summer Edition",
        price: 6.99,
        language: "English",
        country: "Nigeria",
        category: "Fashion",
        format: "digital",
        issueDate: "2025-06-01",
        summary: "Contemporary Nigerian fashion, designers, and street style.",
        coverUrl: "/nigerian-fashion-magazine-cover-vibrant.png",
        rating: 4.7,
        reviewsCount: 182,
        sellerId: "u2",
        tags: ["trending", "editors-pick"],
        approved: true,
        samplePages: [
          "/fashion-editorial.png",
          "/designer-feature-layout.png",
          "/street-style-collage.png",
        ],
      },
      {
        id: "m2",
        name: "East Africa Business Review",
        price: 8.5,
        language: "English",
        country: "Kenya",
        category: "Business",
        format: "print",
        issueDate: "2025-05-15",
        summary: "Markets, policy, and enterprise across East Africa.",
        coverUrl: "/placeholder.svg?height=800&width=600",
        rating: 4.4,
        reviewsCount: 96,
        sellerId: "u2",
        tags: ["business"],
        approved: true,
        samplePages: [
          "/placeholder.svg?height=300&width=220",
          "/placeholder.svg?height=300&width=220",
        ],
      },
      {
        id: "m3",
        name: "Pan-African Culture Quarterly",
        price: 5.0,
        language: "English",
        country: "Ghana",
        category: "Culture",
        format: "digital",
        issueDate: "2025-04-10",
        summary: "Arts, heritage, and contemporary culture narratives.",
        coverUrl: "/placeholder.svg?height=800&width=600",
        rating: 4.8,
        reviewsCount: 210,
        sellerId: "u2",
        tags: ["culture", "editors-pick"],
        approved: true,
        samplePages: [
          "/placeholder.svg?height=300&width=220",
          "/placeholder.svg?height=300&width=220",
        ],
      },
      {
        id: "m4",
        name: "Sahara Arts & Design",
        price: 7.25,
        language: "French",
        country: "Morocco",
        category: "Arts",
        format: "digital",
        issueDate: "2025-03-20",
        summary: "Visual arts, architecture, and design inspiration.",
        coverUrl: "/placeholder.svg?height=800&width=600",
        rating: 4.3,
        reviewsCount: 54,
        sellerId: "u2",
        tags: ["arts"],
        approved: true,
        samplePages: [
          "/placeholder.svg?height=300&width=220",
          "/placeholder.svg?height=300&width=220",
        ],
      },
    ]
    save<Magazine>(KEYS.magazines, magazines)

    // Seed orders
    const orders: Order[] = [
      {
        id: "o1",
        userId: "u1",
        items: [{ magazineId: "m1", qty: 1, price: 6.99, format: "digital" }],
        total: 6.99,
        createdAt: new Date().toISOString(),
      },
    ]
    save<Order>(KEYS.orders, orders)

    localStorage.setItem(KEYS.seeded, "1")
  }, [])

  const getMagazines = useCallback(() => {
    return load<Magazine>(KEYS.magazines).filter((m) => m.approved !== false)
  }, [])

  const getMagazineById = useCallback((id: string) => {
    return load<Magazine>(KEYS.magazines).find((m) => m.id === id)
  }, [])

  const addMagazine = useCallback((partial: Omit<Magazine, "id" | "approved">) => {
    const all = load<Magazine>(KEYS.magazines)
    const newMag: Magazine = { ...partial, id: nanoid(8), approved: false }
    all.unshift(newMag)
    save(KEYS.magazines, all)
  }, [])

  const moderatePending = useCallback(() => {
    const all = load<Magazine>(KEYS.magazines)
    all.forEach((m) => { if (m.approved === false) m.approved = true })
    save(KEYS.magazines, all)
  }, [])

  const getPendingCount = useCallback(() => {
    return load<Magazine>(KEYS.magazines).filter((m) => m.approved === false).length
  }, [])

  const countMagazines = useCallback(() => load<Magazine>(KEYS.magazines).length, [])
  const countUsers = useCallback(() => load<User>(KEYS.users).length, [])
  const countOrders = useCallback(() => load<Order>(KEYS.orders).length, [])

  const placeOrder = useCallback((userId: string, items: Array<{ magazineId: string; qty: number }>) => {
    const mags = load<Magazine>(KEYS.magazines)
    const fullItems = items.map((it) => {
      const m = mags.find((x) => x.id === it.magazineId)!
      return { magazineId: it.magazineId, qty: it.qty, price: m.price, format: m.format }
    })
    const total = fullItems.reduce((s, i) => s + i.price * i.qty, 0)
    const orders = load<Order>(KEYS.orders)
    const newO: Order = { id: nanoid(10), userId, items: fullItems, total, createdAt: new Date().toISOString() }
    orders.unshift(newO)
    save(KEYS.orders, orders)
    return newO
  }, [])

  const getOrdersByUser = useCallback((userId: string) => {
    return load<Order>(KEYS.orders).filter((o) => o.userId === userId)
  }, [])

  const getDigitalDownloadsForUser = useCallback((userId: string) => {
    return load<Order>(KEYS.orders)
      .filter((o) => o.userId === userId)
      .flatMap((o) =>
        o.items
          .filter((i) => i.format === "digital")
          .map((i) => ({ magazineId: i.magazineId, purchasedAt: o.createdAt }))
      )
  }, [])

  const getSalesForSeller = useCallback((sellerId: string) => {
    const orders = load<Order>(KEYS.orders)
    const mags = load<Magazine>(KEYS.magazines)
    // Aggregate mock sales per month for charts
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const points = months.map((month) => ({ month, sales: 0 }))
    orders.forEach((o) => {
      o.items.forEach((it) => {
        const m = mags.find((x) => x.id === it.magazineId)
        if (m?.sellerId === sellerId) {
          const idx = Math.floor(Math.random() * points.length)
          points[idx].sales += it.price * it.qty
        }
      })
    })
    return points
  }, [])

  return {
    ensureSeed,
    getMagazines,
    getMagazineById,
    addMagazine,
    moderatePending,
    getPendingCount,
    countMagazines,
    countUsers,
    countOrders,
    placeOrder,
    getOrdersByUser,
    getDigitalDownloadsForUser,
    getSalesForSeller,
  }
}
