"use client"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/components/providers"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Ensure we’re logged in; in production you’d guard with middleware or server checks.
  const { user } = useAuth()

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="bg-white">
        <header className="flex h-14 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <div className="text-sm text-muted-foreground ml-2">
            {user ? `Logged in as ${user.name} (${user.role})` : "Not signed in"}
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
