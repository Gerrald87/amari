import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/sql"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null })

  // Enrich sellerStatus from DB when available
  const sql = getSql()
  if (sql) {
    try {
      const rows = await sql<{ seller_status: string; name: string; role: string }[]>`
        select seller_status, name, role from users where id = ${session.userId} limit 1
      `
      const db = rows[0]
      if (db) {
        return NextResponse.json({
          user: {
            ...session,
            name: db.name,
            role: db.role as any,
            sellerStatus: db.seller_status as any,
          },
        })
      }
    } catch {}
  }

  return NextResponse.json({ user: session })
}
