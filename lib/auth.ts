import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getSql } from "./sql"

export type SellerStatus = "none" | "pending" | "approved" | "rejected"

export type Session = {
userId: string
name: string
email: string
role: "buyer" | "seller" | "admin"
sellerStatus?: SellerStatus
}

const SESSION_COOKIE = "amari:session"

export async function getSession(): Promise<Session | null> {
const jar = await cookies()
const val = jar.get(SESSION_COOKIE)?.value
if (!val) return null
try {
  return JSON.parse(val) as Session
} catch {
  return null
}
}

export async function setSession(res: NextResponse, session: Session) {
const isProd = process.env.NODE_ENV === "production"
res.cookies.set(SESSION_COOKIE, JSON.stringify(session), {
  httpOnly: true,
  sameSite: "lax",
  secure: isProd,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
})
}

export async function clearSession(res: NextResponse) {
const isProd = process.env.NODE_ENV === "production"
res.cookies.set(SESSION_COOKIE, "", {
  httpOnly: true,
  sameSite: "lax",
  secure: isProd,
  path: "/",
  maxAge: 0,
})
}

// Role guard with seller approval check.
export async function requireRole(roles: Session["role"][]) {
const s = await getSession()
if (!s) {
  return { ok: false as const, error: "UNAUTHENTICATED" as const, session: null as Session | null }
}

// Fail early if the user's role is not allowed.
if (!roles.includes(s.role)) {
  return { ok: false as const, error: "FORBIDDEN" as const, session: s }
}

// Require seller approval ONLY when the route actually needs seller privileges.
// That is: allowed roles include 'seller' and do NOT include 'buyer'.
// Examples:
// - ["seller"] => approval required
// - ["seller","admin"] => approval required
// - ["buyer","seller","admin"] => no approval required (general feature)
const needsSellerApproval = roles.includes("seller") && !roles.includes("buyer")

if (s.role === "seller" && needsSellerApproval) {
  // Try authoritative check via DB; if DB unavailable, fallback to cookie hint.
  let status: SellerStatus | undefined = s.sellerStatus
  try {
    const sql = getSql()
    const rows = await sql<{ seller_status: string }[]>`
      select seller_status from users where id = ${s.userId} limit 1
    `
    status = (rows[0]?.seller_status || "none") as SellerStatus
  } catch {
    // Ignore DB errors and fallback to cookie-provided sellerStatus.
  }

  if (status !== "approved") {
    return { ok: false as const, error: "FORBIDDEN" as const, session: s }
  }
}

return { ok: true as const, error: null as const, session: s }
}
