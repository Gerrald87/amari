import { NextResponse } from "next/server"
import { ordersByUser, placeOrder } from "@/lib/data"
import { requireRole } from "@/lib/auth"

export async function GET() {
  const guard = await requireRole(["buyer", "seller", "admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 401 })
  const orders = await ordersByUser(guard.session!.userId)
  return NextResponse.json({ data: orders })
}

export async function POST(req: Request) {
  const guard = await requireRole(["buyer", "seller", "admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 401 })
  const body = await req.json()
  const items = (body.items as Array<{ magazineId: string; qty: number }>) || []
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "EMPTY_CART" }, { status: 400 })
  }
  const order = await placeOrder(guard.session!.userId, items)
  return NextResponse.json({ data: order })
}
