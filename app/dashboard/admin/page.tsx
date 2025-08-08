"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDB } from "@/lib/db"

export default function AdminPanelPage() {
  const { countUsers, countMagazines, countOrders, moderatePending, getPendingCount } = useDB()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold">Admin Panel</h1>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Users</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{countUsers()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Magazines</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{countMagazines()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{countOrders()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Content Moderation</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Pending listings: {getPendingCount()}
          </div>
          <Button className="bg-amber-700 hover:bg-amber-800" onClick={moderatePending}>
            Approve All
          </Button>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        Note: This MVP uses localStorage. For production, move to a SQL/NoSQL database with role-based access and audit logs.
      </div>
    </div>
  )
}
