import { NextResponse } from "next/server"
import { getMagazine, updateListing, deleteListing, adminUpdateListing, adminDeleteListing } from "@/lib/data"
import { requireRole } from "@/lib/auth"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const mag = await getMagazine(params.id)
  if (!mag) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 })
  return NextResponse.json({ data: mag })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireRole(["seller", "admin"])
  if (!guard.ok)
    return NextResponse.json({ error: guard.error }, { status: guard.error === "UNAUTHENTICATED" ? 401 : 403 })

  const body = await req.json().catch(() => ({}))
  if (guard.session?.role === "admin") {
    const res = await adminUpdateListing(params.id, body)
    if (!res.ok) {
      return NextResponse.json({ error: res.error || "UPDATE_FAILED" }, { status: res.error === "NO_DB" ? 501 : 400 })
    }
    return NextResponse.json({ ok: true })
  } else {
    const res = await updateListing(params.id, guard.session!.userId, body)
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.error === "NOT_FOUND" ? 404 : 403 })
    return NextResponse.json({ ok: true })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireRole(["seller", "admin"])
  if (!guard.ok)
    return NextResponse.json({ error: guard.error }, { status: guard.error === "UNAUTHENTICATED" ? 401 : 403 })
  if (guard.session?.role === "admin") {
    const res = await adminDeleteListing(params.id)
    if (!res.ok)
      return NextResponse.json({ error: res.error || "DELETE_FAILED" }, { status: res.error === "NO_DB" ? 501 : 400 })
    return NextResponse.json({ ok: true })
  } else {
    const res = await deleteListing(params.id, guard.session!.userId)
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.error === "NOT_FOUND" ? 404 : 403 })
    return NextResponse.json({ ok: true })
  }
}
