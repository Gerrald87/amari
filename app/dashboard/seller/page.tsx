"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useDB } from "@/lib/db"
import { useAuth } from "@/components/providers"

export default function SellerAnalyticsPage() {
  const { user } = useAuth()
  const { getSalesForSeller } = useDB()
  const data = user ? getSalesForSeller(user.id) : []

  const chartData = data.length
    ? data
    : [
        { month: "Jan", sales: 120 },
        { month: "Feb", sales: 80 },
        { month: "Mar", sales: 140 },
        { month: "Apr", sales: 70 },
        { month: "May", sales: 160 },
        { month: "Jun", sales: 200 },
      ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold">Seller Analytics</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">${(chartData.reduce((s, d) => s + d.sales, 0) / 6).toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Avg per month (mock)</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{Math.floor(Math.random() * 10) + 4}</div>
            <div className="text-xs text-muted-foreground">Mock metric</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{Math.floor(Math.random() * 300) + 120}</div>
            <div className="text-xs text-muted-foreground">Mock metric</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              sales: { label: "Sales", color: "hsl(14 90% 45%)" },
            }}
            className="h-56"
          >
            <AreaChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area dataKey="sales" type="monotone" fill="hsl(14 90% 45% / 0.2)" stroke="hsl(14 90% 45%)" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
