import { NextResponse } from "next/server"
import { registerUser } from "@/lib/data"
import { setSession } from "@/lib/auth"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const name = String(body.name || "").trim()
  const email = String(body.email || "").trim().toLowerCase()
  const password = String(body.password || "")

  if (!email || !password) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 })
  }

  const u = await registerUser({ name: name || email.split("@")[0], email, password }).catch(() => null)
  if (!u) return NextResponse.json({ error: "REGISTER_FAILED" }, { status: 400 })

  const res = NextResponse.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role, sellerStatus: u.sellerStatus } })
  await setSession(res, { userId: u.id, name: u.name, email: u.email, role: u.role, sellerStatus: u.sellerStatus })
  return res
}
