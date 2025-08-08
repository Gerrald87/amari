"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { User } from "@/lib/db"
import { useDB } from "@/lib/db"

type AuthCtx = {
  user: User | null
  login: (u: { name: string; email: string; role: User["role"] }) => boolean
  logout: () => void
}
const AuthContext = createContext<AuthCtx>({ user: null, login: () => false, logout: () => {} })

type CartItem = { magazineId: string; qty: number }
type CartCtx = {
  items: CartItem[]
  addToCart: (id: string, qty: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  checkout: () => void
}
const CartContext = createContext<CartCtx>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  checkout: () => {},
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function useCart() {
  return useContext(CartContext)
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const { ensureSeed } = useDB()

  useEffect(() => {
    ensureSeed()
    const raw = localStorage.getItem("amari:auth")
    if (raw) setUser(JSON.parse(raw))
  }, [ensureSeed])

  const login: AuthCtx["login"] = (info) => {
    const u: User = { id: crypto.randomUUID(), name: info.name, email: info.email, role: info.role }
    setUser(u)
    localStorage.setItem("amari:auth", JSON.stringify(u))
    return true
  }
  const logout = () => {
    setUser(null)
    localStorage.removeItem("amari:auth")
  }

  const value = useMemo(() => ({ user, login, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const raw = localStorage.getItem("amari:cart")
    if (raw) setItems(JSON.parse(raw))
  }, [])
  useEffect(() => {
    localStorage.setItem("amari:cart", JSON.stringify(items))
  }, [items])

  const addToCart: CartCtx["addToCart"] = (id, qty) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.magazineId === id)
      if (existing) {
        return prev.map((i) => (i.magazineId === id ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { magazineId: id, qty }]
    })
  }
  const removeFromCart = (id: string) => setItems((prev) => prev.filter((i) => i.magazineId !== id))
  const clearCart = () => setItems([])

  const { placeOrder } = useDB()
  const { user } = useAuth()
  const checkout = () => {
    if (!user) {
      alert("Please login to checkout.")
      return
    }
    if (items.length === 0) return
    placeOrder(user.id, items)
    setItems([])
  }

  const value = useMemo(() => ({ items, addToCart, removeFromCart, clearCart, checkout }), [items, placeOrder, user])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
