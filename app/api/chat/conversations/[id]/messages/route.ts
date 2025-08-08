import { NextResponse } from "next/server"
import { listMessages, sendMessage } from "@/lib/data"
import { requireRole } from "@/lib/auth"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireRole(["buyer", "seller", "admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 401 })
  try {
    const data = await listMessages(params.id, guard.session!.userId)
    return NextResponse.json({ data })
  } catch (e: any) {
    const msg = String(e?.message || "")
    return NextResponse.json({ error: msg }, { status: msg === "FORBIDDEN" ? 403 : 404 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireRole(["buyer", "seller", "admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const text = String(body.body || "").trim()
  if (!text) return NextResponse.json({ error: "EMPTY_MESSAGE" }, { status: 400 })
  try {
    const out = await sendMessage(params.id, guard.session!.userId, text)
    return NextResponse.json({ id: out.id })
  } catch (e: any) {
    const msg = String(e?.message || "")
    return NextResponse.json({ error: msg }, { status: msg === "FORBIDDEN" ? 403 : 404 })
  }
}
