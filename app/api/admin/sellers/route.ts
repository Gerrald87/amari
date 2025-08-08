import { NextResponse } from "next/server"
import { listPendingSellers } from "@/lib/data"
import { requireRole } from "@/lib/auth"

export async function GET() {
  const guard = await requireRole(["admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.error === "UNAUTHENTICATED" ? 401 : 403 })
  const data = await listPendingSellers()
  return NextResponse.json({ data })
}
