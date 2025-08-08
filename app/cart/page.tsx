"use client"

import { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useCart } from "@/components/providers"
import { useDB } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { items, removeFromCart, clearCart, checkout } = useCart()
  const { getMagazines } = useDB()
  const { toast } = useToast()
  const data = getMagazines()

  const rows = useMemo(() => {
    return items
      .map((it) => {
        const m = data.find((x) => x.id === it.magazineId)
        return m ? { ...m, qty: it.qty } : null
      })
      .filter(Boolean) as Array<ReturnType<typeof data[number]> & { qty: number }>
  }, [items, data])

  const subtotal = rows.reduce((sum, r) => sum + r.price * r.qty, 0)

  const handleCheckout = () => {
    checkout()
    toast({
      title: "Order placed",
      description: "Your order was placed successfully. Digital items are now in Downloads.",
    })
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
            {rows.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Your cart is empty. <Link className="underline" href="/magazines">Browse magazines</Link>
              </div>
            )}
            {rows.map((r) => (
              <div key={r.id} className="flex gap-4 items-center border rounded p-3">
                <Image
                  src={r.coverUrl || "/placeholder.svg"}
                  alt={`${r.name} cover`}
                  width={80}
                  height={100}
                  className="rounded object-cover border"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium line-clamp-1">{r.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{r.format}</div>
                </div>
                <div className="text-sm">x{r.qty}</div>
                <div className="w-24 text-right font-medium">${(r.price * r.qty).toFixed(2)}</div>
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="border rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">Total</span>
                <span className="text-xl font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <Button
                disabled={rows.length === 0}
                className="w-full bg-amber-700 hover:bg-amber-800"
                onClick={handleCheckout}
              >
                Checkout <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="ghost" className="w-full" onClick={clearCart}>
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
