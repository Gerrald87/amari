"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, Sparkles, LayoutDashboard, Upload, Users, Settings, Package, BarChartIcon as ChartBar, Download, Heart, ShieldCheck } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/providers"

export function AppSidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href

  const sellerApproved = user?.role === "seller" && user?.sellerStatus === "approved"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Sparkles />
                <span>Amari</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/orders")}>
                  <Link href="/dashboard/orders">
                    <Package />
                    <span>Orders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/downloads")}>
                  <Link href="/dashboard/downloads">
                    <Download />
                    <span>Downloads</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/magazines")}>
                  <Link href="/magazines">
                    <ShoppingBag />
                    <span>Browse</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/wishlist")}>
                  <Link href="/dashboard/wishlist">
                    <Heart />
                    <span>Wishlist</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {!sellerApproved && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/seller-request")}>
                    <Link href="/dashboard/seller-request">
                      <ShieldCheck />
                      <span>Become a Seller</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className={sellerApproved ? "" : "group-data-[collapsible=icon]:hidden"}>
          <SidebarGroupLabel>Seller</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/seller")}>
                  <Link href="/dashboard/seller">
                    <ChartBar />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/seller/listings")}>
                  <Link href="/dashboard/seller/listings">
                    <Upload />
                    <span>Listings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            {!sellerApproved && user?.role === "seller" && (
              <div className="mt-2 text-xs text-amber-700 flex items-center gap-1 px-2">
                <ShieldCheck className="h-3.5 w-3.5" /> Seller access pending approval
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className={user?.role === "admin" ? "" : "group-data-[collapsible=icon]:hidden"}>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/admin")}>
                  <Link href="/dashboard/admin">
                    <Settings />
                    <span>Admin Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/admin/users")}>
                  <Link href="/dashboard/admin/users">
                    <Users />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/")}>
              <Link href="/">
                <Home />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
