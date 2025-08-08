import { NextResponse } from "next/server"
import { loginUser } from "@/lib/data"
import { setSession } from "@/lib/auth"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const email = String(body.email || "").trim().toLowerCase()
  const password = String(body.password || "")

  if (!email || !password) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 })
  }

  try {
    const u = await loginUser({ email, password })
    const res = NextResponse.json({ user: u })
    await setSession(res, { userId: u.id!, name: u.name, email: u.email, role: u.role, sellerStatus: u.sellerStatus })
    return res
  } catch {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 })
  }
}
