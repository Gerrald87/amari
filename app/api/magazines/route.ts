import { NextResponse } from "next/server"
import { createListing, listMagazines } from "@/lib/data"
import { requireRole } from "@/lib/auth"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const data = await listMagazines({
    country: searchParams.get("country") || undefined,
    language: searchParams.get("language") || undefined,
    category: searchParams.get("category") || undefined,
    format: (searchParams.get("format") as "print" | "digital" | null) || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    q: searchParams.get("q") || undefined,
    tag: searchParams.get("tag") || undefined,
  })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const guard = await requireRole(["seller", "admin"])
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.error === "UNAUTHENTICATED" ? 401 : 403 })
  const body = await req.json()
  const created = await createListing({
    name: body.name,
    price: Number(body.price || 0),
    language: body.language,
    country: body.country,
    category: body.category,
    format: body.format,
    issueDate: body.issueDate,
    summary: body.summary,
    coverUrl: body.coverUrl,
    sellerId: guard.session!.userId,
    tags: body.tags || [],
  })
  return NextResponse.json({ data: created })
}
