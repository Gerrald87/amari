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
  res.cookies.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function clearSession(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
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
  // If seller role is required, ensure approval in DB (authoritative check)
  if (roles.includes("seller")) {
    const sql = getSql()
    if (sql) {
      try {
        const rows = await sql<{ seller_status: string }[]>`
          select seller_status from users where id = ${s.userId} limit 1
        `
        const status = (rows[0]?.seller_status || "none") as SellerStatus
        if (status !== "approved") {
          return { ok: false as const, error: "FORBIDDEN" as const, session: s }
        }
      } catch {
        // If DB check fails, fallback to cookie hint if present
        if (s.sellerStatus !== "approved") {
          return { ok: false as const, error: "FORBIDDEN" as const, session: s }
        }
      }
    } else {
      // No DB: fallback to cookie hint
      if (s.sellerStatus !== "approved") {
        return { ok: false as const, error: "FORBIDDEN" as const, session: s }
      }
    }
  }
  if (!roles.includes(s.role)) {
    return { ok: false as const, error: "FORBIDDEN" as const, session: s }
  }
  return { ok: true as const, error: null as const, session: s }
}
