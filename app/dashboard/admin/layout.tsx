import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const guard = await requireRole(["admin"])
  if (!guard.ok) {
    redirect("/dashboard")
  }
  return <>{children}</>
}
