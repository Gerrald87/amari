"use client"

import { ArrowRight, Flame, Stars, Sparkles, ChevronRight } from 'lucide-react'
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MagazineCard } from "@/components/magazine-card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroCarousel } from "@/components/hero-carousel"
import { useAuth } from "@/components/providers"
import { MagazinesClient } from "@/lib/client"

export default function HomePage() {
  const { user } = useAuth()
  const [mags, setMags] = useState<any[]>([])

  useEffect(() => {
    MagazinesClient.list().then((r) => setMags(r.data))
  }, [])

  const trending = mags.slice(0, 8)
  const editors = mags.filter((m) => (m.tags || []).includes("editors-pick")).slice(0, 6)
  const culture = mags.filter((m) => m.category === "Culture").slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative">
          <HeroCarousel
            slides={[
              {
                title: "Discover Africa’s Finest Magazines",
                subtitle: "From vibrant culture and fashion to business and politics — explore thousands of print and digital editions.",
                ctaLabel: "Browse Magazines",
                ctaHref: "/magazines",
                image: "/placeholder-3f0gh.png",
              },
              {
                title: "New Issues Every Week",
                subtitle: "Stay ahead with Editor’s Picks and trending releases from top publishers and independent creators.",
                ctaLabel: "See What’s Trending",
                ctaHref: "/magazines?sort=trending",
                image: "/african-magazine-spread.png",
              },
              {
                title: "Print or Digital — Your Choice",
                subtitle: "Buy single issues, subscribe monthly/yearly, or download digital editions instantly.",
                ctaLabel: "Start Reading",
                ctaHref: "/magazines?format=digital",
                image: "/african-grid.png",
              },
            ]}
          />
        </section>

        <section className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
              <Flame className="text-amber-600" />
              Trending Magazines
            </h2>
            <Link href="/magazines" className="text-amber-700 hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {trending.map((m) => (
              <MagazineCard key={m.id} magazine={m} />
            ))}
          </div>
        </section>

        <section className="bg-amber-50/60">
          <div className="container mx-auto px-4 py-10">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                <Stars className="text-rose-600" />
                Editor’s Picks
              </h2>
              <Link href="/magazines?tag=editors-pick" className="text-rose-700 hover:underline flex items-center gap-1">
                Explore picks <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {editors.map((m) => (
                <MagazineCard key={m.id} magazine={m} />
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
              <Sparkles className="text-emerald-600" />
              African Culture Highlight
            </h2>
            <Link href="/magazines?category=Culture" className="text-emerald-700 hover:underline flex items-center gap-1">
              See more <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {culture.map((m) => (
              <MagazineCard key={m.id} magazine={m} />
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          <h2 className="text-xl md:text-2xl font-semibold">Browse by Category or Country</h2>
          <p className="text-sm text-muted-foreground mt-1">Tap a chip to explore curated magazines.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {["Fashion", "Business", "News", "Culture", "Arts", "Politics", "Lifestyle"].map((c) => (
              <Link key={c} href={`/magazines?category=${encodeURIComponent(c)}`}>
                <Badge variant="secondary" className="rounded-full py-2 px-4 hover:bg-amber-100">
                  {c}
                </Badge>
              </Link>
            ))}
            <Separator className="mx-1 h-7" orientation="vertical" />
            {["Kenya", "Nigeria", "Ghana", "South Africa", "Ethiopia", "Egypt"].map((cty) => (
              <Link key={cty} href={`/magazines?country=${encodeURIComponent(cty)}`}>
                <Badge className="rounded-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white">{cty}</Badge>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <div className="text-sm text-muted-foreground">{user ? `Welcome back, ${user.name}!` : "Become a seller and reach readers worldwide."}</div>
            <div className="ml-auto" />
            <Link href={user?.role === "seller" && user?.sellerStatus === "approved" ? "/dashboard/seller" : "/dashboard/seller-request"}>
              <Button className="bg-amber-700 hover:bg-amber-800">
                Start Selling <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
