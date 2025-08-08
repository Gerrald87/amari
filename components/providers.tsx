"use client"

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react"
import type { Session } from "@/lib/auth"
import { AuthClient, OrdersClient } from "@/lib/client"
import { Toaster } from "@/components/toaster"

type AuthCtx = {
  user: Session | null
  register: (u: { name: string; email: string; password: string; wantSell?: boolean }) => Promise<boolean>
  login: (u: { email: string; password: string }) => Promise<boolean>
  logout: () => Promise<void>
}
const AuthContext = createContext<AuthCtx>({ user: null, register: async () => false, login: async () => false, logout: async () => {} })

type CartItem = { magazineId: string; qty: number }
type CartCtx = {
  items: CartItem[]
  addToCart: (id: string, qty: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  checkout: () => Promise<boolean>
}
const CartContext = createContext<CartCtx>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  checkout: async () => false,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
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
  const [user, setUser] = useState<Session | null>(null)

  useEffect(() => {
    AuthClient.me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
  }, [])

  const register: AuthCtx["register"] = async (info) => {
    try {
      const { user } = await AuthClient.register(info)
      setUser(user)
      return true
    } catch {
      return false
    }
  }
  const login: AuthCtx["login"] = async (info) => {
    try {
      const { user } = await AuthClient.login(info)
      setUser(user)
      return true
    } catch {
      return false
    }
  }
  const logout = async () => {
    await AuthClient.logout().catch(() => {})
    setUser(null)
  }

  const value = useMemo(() => ({ user, register, login, logout }), [user])
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
      if (existing) return prev.map((i) => (i.magazineId === id ? { ...i, qty: i.qty + qty } : i))
      return [...prev, { magazineId: id, qty }]
    })
  }
  const removeFromCart = (id: string) => setItems((prev) => prev.filter((i) => i.magazineId !== id))
  const clearCart = () => setItems([])

  const checkout = useCallback(async () => {
    try {
      if (items.length === 0) return false
      await OrdersClient.checkout(items)
      setItems([])
      return true
    } catch {
      return false
    }
  }, [items])

  const value = useMemo(() => ({ items, addToCart, removeFromCart, clearCart, checkout }), [items, checkout])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
