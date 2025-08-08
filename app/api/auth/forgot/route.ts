import { NextResponse } from "next/server"
import { createPasswordReset } from "@/lib/data"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const email = String(body.email || "").trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: "MISSING_EMAIL" }, { status: 400 })
  }

  const origin = new URL(req.url).origin
  const res = await createPasswordReset(email, origin).catch(() => ({ ok: true as const, link: null }))
  // In production you'd send an email. For dev, we return the link when available.
  return NextResponse.json({ ok: true, link: res.link })
}
