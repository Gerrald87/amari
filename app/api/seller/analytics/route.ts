import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { getSql } from "@/lib/sql"

export async function GET() {
  const guard = await requireRole(["seller"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.error === "UNAUTHENTICATED" ? 401 : 403 })

  const sql = getSql()
  if (!sql) return NextResponse.json({ error: "NO_DB" }, { status: 500 })

  // Sum monthly sales for last 6 months (including current month)
  const rows = await sql<{ month_key: string; month_label: string; sales: string }[]>`
    with months as (
      select to_char(date_trunc('month', now()) - (n || 0) * interval '1 month', 'YYYY-MM') as month_key,
             to_char(date_trunc('month', now()) - (n || 0) * interval '1 month', 'Mon') as month_label
      from generate_series(0, 5) as s(n)
    ),
    sales as (
      select to_char(date_trunc('month', o.created_at), 'YYYY-MM') as month_key,
             sum(oi.price * oi.qty)::text as sales
      from orders o
      join order_items oi on oi.order_id = o.id
      join magazines m on m.id = oi.magazine_id
      where m.seller_id = ${guard.session!.userId}
        and o.created_at >= date_trunc('month', now()) - interval '5 months'
      group by 1
    )
    select m.month_key, m.month_label, coalesce(s.sales, '0') as sales
    from months m
    left join sales s on s.month_key = m.month_key
    order by m.month_key
  `

  const data = rows.map((r) => ({ month: r.month_label, sales: Number(r.sales) }))
  return NextResponse.json({ data })
}
