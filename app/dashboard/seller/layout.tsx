import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  // Enforces seller role and approval on server.
  const guard = await requireRole(["seller"])
  if (!guard.ok) {
    redirect("/dashboard")
  }
  return <>{children}</>
}
