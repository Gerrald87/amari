import { NextResponse } from "next/server"
import { approveAll } from "@/lib/data"
import { requireRole } from "@/lib/auth"

export async function POST() {
  const guard = await requireRole(["admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.error === "UNAUTHENTICATED" ? 401 : 403 })
  await approveAll()
  return NextResponse.json({ ok: true })
}
