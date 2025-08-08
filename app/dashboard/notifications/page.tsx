"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { NotificationsClient } from "@/lib/client"

export default function NotificationsPage() {
  const [items, setItems] = useState<Array<{ id: string; title: string; body?: string; readAt?: string; createdAt: string }>>([])

  const load = async () => {
    try {
      const r = await NotificationsClient.list()
      setItems(r.data)
    } catch {
      setItems([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  const markRead = async (id: string) => {
    await NotificationsClient.markRead(id).catch(() => {})
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)))
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold">Notifications</h1>
      <div className="grid gap-2">
        {items.length === 0 && <div className="text-sm text-muted-foreground">No notifications.</div>}
        {items.map((n) => (
          <div key={n.id} className="flex items-center justify-between border rounded p-3">
            <div>
              <div className="font-medium">{n.title}</div>
              {n.body && <div className="text-sm text-muted-foreground">{n.body}</div>}
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(n.createdAt).toLocaleString()} • {n.readAt ? "Read" : "Unread"}
              </div>
            </div>
            {!n.readAt && (
              <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>
                Mark as read
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
