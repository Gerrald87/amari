import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/sql"
import { notify } from "@/lib/data"

export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 })
  }

  const sql = getSql()

  // Update current user to role 'seller' and set status to 'pending' unless already approved.
  const rows = await sql<{ role: string; seller_status: string }[]>`
    update users
    set role = 'seller',
        seller_status = case when seller_status = 'approved' then seller_status else 'pending' end
    where id = ${session.userId}
    returning role, seller_status
  `
  const role = rows[0]?.role || "seller"
  const sellerStatus = rows[0]?.seller_status || "pending"

  // Notify all admins of the seller request (idempotent enough for MVP).
  try {
    const admins = await sql<{ id: string }[]>`select id from users where role = 'admin'`
    await Promise.all(
      admins.map((a) =>
        notify(
          a.id,
          "Seller access requested",
          `${session.name} (${session.email}) requested seller access.`
        )
      )
    )
  } catch {
    // Non-fatal
  }

  return NextResponse.json({ ok: true, role, sellerStatus })
}
