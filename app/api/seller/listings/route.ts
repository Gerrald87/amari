import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { getSql } from "@/lib/sql"

export async function GET() {
  const guard = await requireRole(["seller"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.error === "UNAUTHENTICATED" ? 401 : 403 })

  const sql = getSql()
  if (!sql) return NextResponse.json({ error: "NO_DB" }, { status: 500 })

  const rows = await sql<any[]>`
    select
      id,
      name,
      price::float as price,
      language,
      country,
      category,
      format,
      issue_date as "issueDate",
      summary,
      cover_url as "coverUrl",
      rating::float as rating,
      reviews_count::int as "reviewsCount",
      seller_id as "sellerId",
      tags,
      approved,
      created_at as "createdAt"
    from magazines
    where seller_id = ${guard.session!.userId}
    order by created_at desc
  `
  return NextResponse.json({ data: rows })
}
