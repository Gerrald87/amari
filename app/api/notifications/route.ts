import { NextResponse } from "next/server"
import { listNotifications, unreadCount } from "@/lib/data"
import { requireRole } from "@/lib/auth"

export async function GET() {
  const guard = await requireRole(["buyer", "seller", "admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 401 })
  const [items, unread] = await Promise.all([
    listNotifications(guard.session!.userId),
    unreadCount(guard.session!.userId),
  ])
  return NextResponse.json({ data: items, unread })
}
