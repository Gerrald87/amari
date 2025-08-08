import { NextResponse } from "next/server"
import { markNotificationRead } from "@/lib/data"
import { requireRole } from "@/lib/auth"

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireRole(["buyer", "seller", "admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 401 })
  await markNotificationRead(guard.session!.userId, params.id)
  return NextResponse.json({ ok: true })
}
