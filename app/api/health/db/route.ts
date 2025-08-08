import { NextResponse } from "next/server"
import { getSql } from "@/lib/sql"

export async function GET() {
  try {
    const sql = getSql()
    const res = await sql<{ now: string }[]>`select now()::text as now`
    return NextResponse.json({ ok: true, now: res[0].now })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "DB_ERROR" }, { status: 500 })
  }
}
