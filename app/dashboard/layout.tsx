import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth guard for all /dashboard routes
  const session = await getSession()
  if (!session) {
    redirect("/login?next=/dashboard")
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="bg-white">
        <header className="flex h-14 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <div className="text-sm text-muted-foreground ml-2">
            {`Logged in as ${session.name} (${session.role})`}
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
