import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  // This enforces both role=seller and sellerStatus=approved via requireRole.
  const guard = await requireRole(["seller"])
  if (!guard.ok) {
    // If unauthenticated -> parent /dashboard layout will already redirect to /login
    // If forbidden (e.g., pending/rejected) -> send them back to dashboard
    redirect("/dashboard")
  }
  return <>{children}</>
}
