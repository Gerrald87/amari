import type { Session } from "./auth"

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
  createdAt?: string
}

export type User = {
  id: string
  name: string
  email: string
  role: Session["role"]
  sellerStatus?: "none" | "pending" | "approved" | "rejected"
}

export type OrderItem = { magazineId: string; qty: number; price: number; format: "print" | "digital" }
export type Order = {
  id: string
  userId: string
  total: number
  items: OrderItem[]
  createdAt: string
}

type DB = {
  users: User[]
  magazines: Magazine[]
  orders: Order[]
  seeded?: boolean
}

const g = globalThis as any
if (!g.__amariMem) {
  g.__amariMem = { users: [], magazines: [], orders: [], seeded: false } as DB
}
const mem: DB = g.__amariMem

function seed() {
  if (mem.seeded) return
  mem.users = [
    { id: "u_admin", name: "Admin", email: "admin@amari.com", role: "admin", sellerStatus: "none" },
    { id: "u_seller", name: "Seller", email: "seller@amari.com", role: "seller", sellerStatus: "approved" },
    { id: "u_buyer", name: "Buyer", email: "buyer@amari.com", role: "buyer", sellerStatus: "none" },
  ]
  mem.magazines = [
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
      sellerId: "u_seller",
      tags: ["trending", "editors-pick"],
      approved: true,
      samplePages: ["/fashion-editorial.png", "/designer-feature-layout.png", "/street-style-collage.png"],
      createdAt: new Date().toISOString(),
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
      sellerId: "u_seller",
      tags: ["business"],
      approved: true,
      samplePages: ["/placeholder.svg?height=300&width=220", "/placeholder.svg?height=300&width=220"],
      createdAt: new Date().toISOString(),
    },
  ]
  mem.orders = [
    {
      id: "o1",
      userId: "u_buyer",
      total: 6.99,
      items: [{ magazineId: "m1", qty: 1, price: 6.99, format: "digital" }],
      createdAt: new Date().toISOString(),
    },
  ]
  mem.seeded = true
}

export function memGetUsers() {
  seed()
  return mem.users
}
export function memUpsertUser(user: Omit<User, "id"> & Partial<Pick<User, "id">>) {
  seed()
  const byEmail = mem.users.find((u) => u.email === user.email)
  if (byEmail) {
    byEmail.name = user.name
    byEmail.role = user.role
    if (user.sellerStatus) byEmail.sellerStatus = user.sellerStatus
    return byEmail
  }
  const id = user.id || crypto.randomUUID()
  const nu: User = {
    id,
    name: user.name,
    email: user.email,
    role: user.role,
    sellerStatus: user.sellerStatus ?? "none",
  }
  mem.users.push(nu)
  return nu
}

export function memListMagazines(filters: Partial<Magazine> & { from?: string; to?: string; q?: string; tag?: string }) {
  seed()
  let list = [...mem.magazines].filter((m) => m.approved !== false)
  const { country, language, category, format, from, to, q, tag } = filters
  if (country) list = list.filter((m) => m.country === country)
  if (language) list = list.filter((m) => m.language === language)
  if (category) list = list.filter((m) => m.category === category)
  if (format) list = list.filter((m) => m.format === format)
  if (tag) list = list.filter((m) => m.tags?.includes(tag))
  if (from) list = list.filter((m) => new Date(m.issueDate) >= new Date(from))
  if (to) list = list.filter((m) => new Date(m.issueDate) <= new Date(to))
  if (q) {
    const qq = q.toLowerCase()
    list = list.filter(
      (m) => m.name.toLowerCase().includes(qq) || m.summary.toLowerCase().includes(qq) || m.tags?.some((t) => t.toLowerCase().includes(qq))
    )
  }
  return list
}
export function memGetMagazine(id: string) {
  seed()
  return mem.magazines.find((m) => m.id === id) || null
}
export function memCreateMagazine(data: Omit<Magazine, "id" | "approved" | "createdAt" | "rating" | "reviewsCount" | "samplePages">) {
  seed()
  const m: Magazine = {
    ...data,
    id: crypto.randomUUID().slice(0, 8),
    approved: false,
    createdAt: new Date().toISOString(),
    rating: 4.5,
    reviewsCount: 0,
    samplePages: [],
  }
  mem.magazines.unshift(m)
  return m
}
export function memApproveAll() {
  seed()
  mem.magazines.forEach((m) => {
    if (m.approved === false) m.approved = true
  })
  return true
}
export function memCount() {
  seed()
  return { users: mem.users.length, magazines: mem.magazines.length, orders: mem.orders.length }
}

export function memPlaceOrder(userId: string, items: Array<{ magazineId: string; qty: number }>) {
  seed()
  const fullItems = items.map((it) => {
    const m = mem.magazines.find((x) => x.id === it.magazineId)
    if (!m) throw new Error("MAGAZINE_NOT_FOUND")
    return { magazineId: m.id, qty: it.qty, price: m.price, format: m.format }
  })
  const total = fullItems.reduce((s, i) => s + i.qty * i.price, 0)
  const order = { id: crypto.randomUUID().slice(0, 10), userId, total, items: fullItems, createdAt: new Date().toISOString() }
  mem.orders.unshift(order)
  return order
}
export function memOrdersByUser(userId: string) {
  seed()
  return mem.orders.filter((o) => o.userId === userId)
}
export function memDownloads(userId: string) {
  const orders = memOrdersByUser(userId)
  return orders.flatMap((o) => o.items.filter((i) => i.format === "digital").map((i) => ({ magazineId: i.magazineId, purchasedAt: o.createdAt })))
}
export function memSalesForSeller(sellerId: string) {
  seed()
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  const points = months.map((month) => ({ month, sales: 0 }))
  mem.orders.forEach((o) => {
    o.items.forEach((it) => {
      const m = mem.magazines.find((x) => x.id === it.magazineId)
      if (m?.sellerId === sellerId) {
        const idx = Math.floor(Math.random() * points.length)
        points[idx].sales += it.price * it.qty
      }
    })
  })
  return points
}
