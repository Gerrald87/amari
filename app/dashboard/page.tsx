"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import Link from "next/link"
import { useAuth } from "@/components/providers"
import { OrdersClient } from "@/lib/client"

export default function DashboardHome() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    OrdersClient.listMine().then((r) => setOrders(r.data)).catch(() => setOrders([]))
  }, [])

  const digitalCount = useMemo(() => orders.reduce((acc, o) => acc + o.items.filter((i: any) => i.format === "digital").length, 0), [orders])
  const chartData = [
    { month: "Jan", orders: 2 },
    { month: "Feb", orders: 1 },
    { month: "Mar", orders: 3 },
    { month: "Apr", orders: 1 },
    { month: "May", orders: 2 },
    { month: "Jun", orders: 4 },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold">Welcome{user ? `, ${user.name}` : ""}</h1>
        <Link href="/magazines">
          <Button className="bg-amber-700 hover:bg-amber-800">Browse Magazines</Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{orders.length}</div>
            <div className="text-xs text-muted-foreground">Total orders placed</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{digitalCount}</div>
            <div className="text-xs text-muted-foreground">Digital items available</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Wishlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">5</div>
            <div className="text-xs text-muted-foreground">Saved items (stub)</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reading Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ orders: { label: "Orders", color: "hsl(35 92% 50%)" } }} className="h-56">
            <AreaChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area dataKey="orders" type="monotone" fill="hsl(35 92% 50% / 0.2)" stroke="hsl(35 92% 50%)" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
