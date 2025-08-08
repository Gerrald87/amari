import { NextResponse } from "next/server"
import { resetPasswordByToken, validateResetToken } from "@/lib/data"
import { setSession } from "@/lib/auth"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token") || ""
  if (!token) return NextResponse.json({ ok: false, reason: "INVALID" }, { status: 400 })
  const v = await validateResetToken(token)
  if (!v.ok) return NextResponse.json({ ok: false, reason: v.reason }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const token = String(body.token || "")
  const password = String(body.password || "")
  if (!token || !password) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "WEAK_PASSWORD" }, { status: 400 })
  }

  const out = await resetPasswordByToken(token, password)
  if (!out.ok) {
    return NextResponse.json({ error: out.reason }, { status: 400 })
  }
  const res = NextResponse.json({ ok: true, user: out.user })
  await setSession(res, {
    userId: out.user.id,
    name: out.user.name,
    email: out.user.email,
    role: out.user.role,
  })
  return res
}
