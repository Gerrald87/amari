import { NextResponse } from "next/server"
import { ordersByUser, placeOrder } from "@/lib/data"
import { requireRole } from "@/lib/auth"

export async function GET() {
  const guard = await requireRole(["buyer", "seller", "admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 401 })
  try {
    const orders = await ordersByUser(guard.session!.userId)
    return NextResponse.json({ data: orders })
  } catch {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const guard = await requireRole(["buyer", "seller", "admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 401 })

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 })
  }

  const items = (body.items as Array<{ magazineId: string; qty: number }>) || []
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "EMPTY_CART" }, { status: 400 })
  }
  if (
    !items.every(
      (i) => typeof i?.magazineId === "string" && Number.isFinite(Number(i?.qty)) && Number(i?.qty) > 0,
    )
  ) {
    return NextResponse.json({ error: "INVALID_ITEMS" }, { status: 400 })
  }

  try {
    const order = await placeOrder(
      guard.session!.userId,
      items.map((i) => ({ magazineId: i.magazineId, qty: Number(i.qty) })),
    )
    return NextResponse.json({ data: order })
  } catch (err: any) {
    const msg = (err?.message || "").toString()
    if (msg.includes("MAGAZINE_NOT_FOUND")) {
      return NextResponse.json({ error: "MAGAZINE_NOT_FOUND" }, { status: 400 })
    }
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}
