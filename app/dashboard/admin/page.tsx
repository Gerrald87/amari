"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminClient } from "@/lib/client"
import { useEffect, useState } from "react"

export default function AdminPanelPage() {
  const [counts, setCounts] = useState<{ users: number; magazines: number; orders: number }>({
    users: 0,
    magazines: 0,
    orders: 0,
  })
  const [loading, setLoading] = useState(true)
  const [pendingSellers, setPendingSellers] = useState<any[]>([])
  const [pendingMags, setPendingMags] = useState<any[]>([])

  useEffect(() => {
    AdminClient.counts()
      .then((r) => setCounts(r.data))
      .finally(() => setLoading(false))
    AdminClient.pendingSellers()
      .then((r) => setPendingSellers(r.data))
      .catch(() => setPendingSellers([]))
    AdminClient.pendingMagazines()
      .then((r) => setPendingMags(r.data))
      .catch(() => setPendingMags([]))
  }, [])

  const approveSeller = async (id: string) => {
    await AdminClient.approveSeller(id).catch(() => {})
    setPendingSellers((prev) => prev.filter((p) => p.id !== id))
  }
  const rejectSeller = async (id: string) => {
    await AdminClient.rejectSeller(id).catch(() => {})
    setPendingSellers((prev) => prev.filter((p) => p.id !== id))
  }

  const approveMag = async (id: string) => {
    await AdminClient.approveMagazine(id).catch(() => {})
    setPendingMags((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold">Admin Panel</h1>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{loading ? "…" : counts.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Magazines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{loading ? "…" : counts.magazines}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{loading ? "…" : counts.orders}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seller Approvals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingSellers.length === 0 && <div className="text-sm text-muted-foreground">No pending sellers.</div>}
          {pendingSellers.map((s) => (
            <div key={s.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => approveSeller(s.id)}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => rejectSeller(s.id)}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listings Moderation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingMags.length === 0 && <div className="text-sm text-muted-foreground">No pending listings.</div>}
          {pendingMags.map((m) => (
            <div key={m.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">${Number(m.price).toFixed(2)}</div>
              </div>
              <Button size="sm" className="bg-amber-700 hover:bg-amber-800" onClick={() => approveMag(m.id)}>
                Approve
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        Database required. Make sure DATABASE_URL (or POSTGRES_URL) is configured for this app.
      </div>
    </div>
  )
}
