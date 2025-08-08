import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export default async function CartLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth guard for /cart
  const session = await getSession()
  if (!session) {
    redirect("/login?next=/cart")
  }
  return <>{children}</>
}
