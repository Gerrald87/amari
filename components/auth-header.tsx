"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

export function AuthHeader({
  title = "Welcome back",
  subtitle = "Sign in to your Amari account",
  className = "",
}: {
  title?: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <Link href="/" className="inline-flex items-center gap-2 mb-3">
        <span className="font-semibold text-xl tracking-tight text-amber-800">Amari</span>
      </Link>
      <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  )
}
