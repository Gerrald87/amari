import { NextResponse } from "next/server"
import { ensureConversation, listConversations } from "@/lib/data"
import { requireRole } from "@/lib/auth"

export async function GET() {
  const guard = await requireRole(["buyer", "seller", "admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 401 })
  const data = await listConversations(guard.session!.userId)
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const guard = await requireRole(["buyer", "seller", "admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const buyerId = String(body.buyerId || "")
  const sellerId = String(body.sellerId || "")
  const orderId = body.orderId ? String(body.orderId) : null

  // A user can only start conversations they are part of
  if (guard.session!.userId !== buyerId && guard.session!.userId !== sellerId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 })
  }

  const id = await ensureConversation(buyerId, sellerId, orderId)
  return NextResponse.json({ id })
}
