"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useCart } from "@/components/providers"
import { useToast } from "@/hooks/use-toast"
import { MagazinesClient } from "@/lib/client"
import { useAuth } from "@/components/providers"

type PricedItem = {
  id: string
  name: string
  coverUrl: string
  price: number
  format: "print" | "digital"
}

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, removeFromCart, clearCart, checkout } = useCart()
  const { toast } = useToast()

  const [catalog, setCatalog] = useState<Record<string, PricedItem>>({})
  const [loadingPrices, setLoadingPrices] = useState(false)

  // Fetch pricing/details for items in cart
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (items.length === 0) {
        setCatalog({})
        return
      }
      setLoadingPrices(true)
      const next: Record<string, PricedItem> = {}
      await Promise.all(
        items.map(async (r) => {
          try {
            const res = await MagazinesClient.get(r.magazineId)
            const m = res.data
            next[r.magazineId] = {
              id: m.id,
              name: m.name,
              coverUrl: m.coverUrl || "/african-magazine-cover.png",
              price: Number(m.price ?? 0),
              format: m.format,
            }
          } catch {
            // fallback if fetch fails
            next[r.magazineId] = {
              id: r.magazineId,
              name: `Item ${r.magazineId}`,
              coverUrl: "/placeholder-f7qa2.png",
              price: 0,
              format: "digital",
            }
          }
        })
      )
      if (!cancelled) {
        setCatalog(next)
        setLoadingPrices(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [items])

  const subtotal = useMemo(() => {
    return items.reduce((sum, r) => {
      const info = catalog[r.magazineId]
      const price = info ? Number(info.price) : 0
      return sum + price * r.qty
    }, 0)
  }, [items, catalog])

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login?next=/cart")
      return
    }
    const ok = await checkout()
    if (ok) {
      toast({
        title: "Order placed",
        description: "Your order was placed successfully. Digital items are now in Downloads.",
      })
      router.push("/dashboard/orders")
    } else {
      toast({
        title: "Checkout failed",
        description: "Please try again.",
        variant: "destructive" as any,
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-amber-600" /> Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          <div className="lg:col-span-8 space-y-4">
            {items.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Your cart is empty.{" "}
                <Link className="underline" href="/magazines">
                  Browse magazines
                </Link>
              </div>
            )}
            {items.map((r) => {
              const info = catalog[r.magazineId]
              const unit = info ? Number(info.price) : 0
              const lineTotal = unit * r.qty
              return (
                <div key={r.magazineId} className="flex gap-4 items-center border rounded p-3">
                  <Image
                    src={(info?.coverUrl as string) || "/placeholder.svg?height=120&width=96&query=magazine cover"}
                    alt={`Cover`}
                    width={80}
                    height={100}
                    className="rounded object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium line-clamp-1">
                      {info?.name || `Item ${r.magazineId}`}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {info?.format || "edition"} • Qty x{r.qty}
                    </div>
                  </div>
                  <div className="w-28 text-right font-medium">
                    {loadingPrices ? "…" : `$${unit.toFixed(2)}`}
                  </div>
                  <div className="w-32 text-right font-semibold">
                    {loadingPrices ? "…" : `$${lineTotal.toFixed(2)}`}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(r.magazineId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>

          <div className="lg:col-span-4">
            <div className="border rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {loadingPrices ? "…" : `$${subtotal.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">Total</span>
                <span className="text-xl font-semibold">
                  {loadingPrices ? "…" : `$${subtotal.toFixed(2)}`}
                </span>
              </div>
              <Button
                disabled={items.length === 0 || loadingPrices}
                className="w-full bg-amber-700 hover:bg-amber-800"
                onClick={handleCheckout}
              >
                {user ? "Checkout" : "Login to checkout"} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="ghost" className="w-full" onClick={clearCart} disabled={items.length === 0}>
                Clear Cart
              </Button>
              <div className="text-xs text-muted-foreground">
                Note: Payments are stubbed in this MVP. Integrate Stripe/Paystack/Flutterwave for production.
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
