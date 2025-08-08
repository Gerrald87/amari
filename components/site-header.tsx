"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart, User, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth, useCart } from "@/components/providers"
import { useState } from "react"

export function SiteHeader() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { items } = useCart()
  const [q, setQ] = useState("")

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = `/magazines?q=${encodeURIComponent(q)}`
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto px-4 h-14 flex items-center gap-3">
        <Link href="/" className="font-semibold text-amber-800">Amari</Link>
        <nav className="hidden md:flex items-center gap-4 text-sm ml-4">
          <Link className={pathname === "/" ? "text-amber-700" : "text-muted-foreground hover:text-foreground"} href="/">Home</Link>
          <Link className={pathname.startsWith("/magazines") ? "text-amber-700" : "text-muted-foreground hover:text-foreground"} href="/magazines">Magazines</Link>
          <Link className={pathname.startsWith("/dashboard") ? "text-amber-700" : "text-muted-foreground hover:text-foreground"} href="/dashboard">Dashboard</Link>
        </nav>

        <form onSubmit={onSearch} className="ml-auto relative hidden md:block w-[380px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Amari..." className="pl-8" />
        </form>

        <Link href="/cart" className="relative">
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
          </Button>
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-1" /> {user.name}
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
          </div>
        ) : (
          <Link href="/login">
            <Button size="sm" className="bg-amber-700 hover:bg-amber-800">Login</Button>
          </Link>
        )}
      </div>
    </header>
  )
}
