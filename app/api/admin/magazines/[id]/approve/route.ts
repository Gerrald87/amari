import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { approveMagazine } from "@/lib/data"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireRole(["admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.error === "UNAUTHENTICATED" ? 401 : 403 })
  await approveMagazine(params.id)
  return NextResponse.json({ ok: true })
}
