"use client"

import { useEffect, useState } from "react"
import { AdminClient } from "@/lib/client"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  useEffect(() => {
    AdminClient.users().then((r) => setUsers(r.data)).catch(() => setUsers([]))
  }, [])
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-4">Users</h1>
      <div className="grid gap-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between border rounded p-3">
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-muted-foreground">{u.email}</div>
            </div>
            <div className="text-xs uppercase tracking-wide">{u.role}</div>
          </div>
        ))}
        {users.length === 0 && <div className="text-sm text-muted-foreground">No users found.</div>}
      </div>
    </div>
  )
}
