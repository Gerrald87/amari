"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MagazineCard } from "@/components/magazine-card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Filters, type CatalogFilters } from "@/components/filters"
import { useDB } from "@/lib/db"

export default function CatalogPage() {
  const { ensureSeed, getMagazines } = useDB()
  const sp = useSearchParams()
  const [query, setQuery] = useState(sp.get("q") ?? "")
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<CatalogFilters>({
    country: sp.get("country") ?? "",
    language: sp.get("language") ?? "",
    category: sp.get("category") ?? "",
    format: sp.get("format") ?? "",
    from: sp.get("from") ?? "",
    to: sp.get("to") ?? "",
    tag: sp.get("tag") ?? "",
  })

  useEffect(() => {
    ensureSeed()
  }, [ensureSeed])

  const data = getMagazines()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.filter((m) => {
      const matchQ =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.toLowerCase().includes(q))
      const matchCountry = !filters.country || m.country === filters.country
      const matchLang = !filters.language || m.language === filters.language
      const matchCat = !filters.category || m.category === filters.category
      const matchFmt = !filters.format || m.format === filters.format
      const matchTag = !filters.tag || m.tags?.includes(filters.tag)
      const matchFrom = !filters.from || new Date(m.issueDate) >= new Date(filters.from)
      const matchTo = !filters.to || new Date(m.issueDate) <= new Date(filters.to)
      return matchQ && matchCountry && matchLang && matchCat && matchFmt && matchTag && matchFrom && matchTo
    })
  }, [data, query, filters])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search magazines, tags, or topics..."
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </div>

        <Filters open={open} setOpen={setOpen} filters={filters} setFilters={setFilters} />

        <div className="mt-6 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => (
            <MagazineCard key={m.id} magazine={m} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground">No magazines matched your search.</div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
