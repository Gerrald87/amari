"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrdersClient } from "@/lib/client"

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    OrdersClient.listMine()
      .then((r) => setOrders(r.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold">Order History</h1>
      <div className="grid gap-4">
        {!loading && orders.length === 0 && (
          <div className="text-sm text-muted-foreground">No orders yet.</div>
        )}
        {orders.map((o) => (
          <Card key={o.id}>
            <CardHeader>
              <CardTitle className="text-base">Order #{o.id}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="text-muted-foreground">
                {new Date(o.createdAt).toLocaleString()} • {o.items.length} items • ${Number(o.total || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
