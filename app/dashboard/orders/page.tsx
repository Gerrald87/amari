"use client"

import { useDB } from "@/lib/db"
import { useAuth } from "@/components/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrdersPage() {
  const { user } = useAuth()
  const { getOrdersByUser } = useDB()
  const orders = user ? getOrdersByUser(user.id) : []

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold">Order History</h1>
      <div className="grid gap-4">
        {orders.length === 0 && <div className="text-sm text-muted-foreground">No orders yet.</div>}
        {orders.map((o) => (
          <Card key={o.id}>
            <CardHeader>
              <CardTitle className="text-base">Order #{o.id}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="text-muted-foreground">
                {new Date(o.createdAt).toLocaleString()} • {o.items.length} items • ${o.total.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
