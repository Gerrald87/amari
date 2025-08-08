import { NextResponse } from "next/server"
import { adminUpdateOrderStatus, type OrderStatus } from "@/lib/data"
import { requireRole } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // MVP: admin only updates order-level status
  const guard = await requireRole(["admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const status = String(body.status || "") as OrderStatus
  const allowed: OrderStatus[] = ['pending','paid','processing','shipped','delivered','fulfilled','canceled','refunded']
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 })
  }

  await adminUpdateOrderStatus(params.id, status)
  return NextResponse.json({ ok: true })
}
