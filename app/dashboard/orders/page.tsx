"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrdersClient, ChatClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

function StatusBadge({ status = "pending" }: { status?: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-gray-200 text-gray-800" },
    paid: { label: "Paid", className: "bg-emerald-200 text-emerald-800" },
    processing: { label: "Processing", className: "bg-blue-200 text-blue-800" },
    shipped: { label: "Shipped", className: "bg-indigo-200 text-indigo-800" },
    delivered: { label: "Delivered", className: "bg-green-200 text-green-800" },
    fulfilled: { label: "Fulfilled", className: "bg-green-200 text-green-800" },
    canceled: { label: "Canceled", className: "bg-red-200 text-red-800" },
    refunded: { label: "Refunded", className: "bg-rose-200 text-rose-800" },
  }
  const cfg = map[status] || map.pending
  return <Badge className={`${cfg.className}`}>{cfg.label}</Badge>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    OrdersClient.listMine()
      .then((r) => setOrders(r.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const startChat = async (o: any) => {
    if (!user) return
    // Find a seller from first item
    const firstItem = o.items[0]
    // We don't have sellerId on items; fetch magazine to infer seller
    try {
      const res = await fetch(`/api/magazines/${firstItem.magazineId}`)
      const j = await res.json()
      const sellerId = j?.data?.sellerId
      if (!sellerId) return
      const conv = await ChatClient.start({ buyerId: user.userId, sellerId, orderId: o.id })
      router.push(`/dashboard/messages?conversation=${encodeURIComponent(conv.id)}`)
    } catch {
      router.push(`/dashboard/messages`)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold">Order History</h1>
      <div className="grid gap-4">
        {!loading && orders.length === 0 && (
          <div className="text-sm text-muted-foreground">No orders yet.</div>
        )}
        {orders.map((o) => (
          <Card key={o.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Order #{o.id}</CardTitle>
              <StatusBadge status={o.status} />
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="text-muted-foreground">
                {new Date(o.createdAt).toLocaleString()} • {o.items.length} items • ${Number(o.total || 0).toFixed(2)}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startChat(o)}>
                  Message seller
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
