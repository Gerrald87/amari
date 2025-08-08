"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MagazineCard } from "@/components/magazine-card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Filters, type CatalogFilters } from "@/components/filters"
import { MagazinesClient } from "@/lib/client"

export default function CatalogPage() {
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
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (filters.country) params.country = filters.country
    if (filters.language) params.language = filters.language
    if (filters.category) params.category = filters.category
    if (filters.format) params.format = filters.format
    if (filters.from) params.from = filters.from
    if (filters.to) params.to = filters.to
    if (filters.tag) params.tag = filters.tag
    if (query) params.q = query
    MagazinesClient.list(params).then((r) => setData(r.data))
  }, [filters, query])

  const filtered = useMemo(() => data, [data])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search magazines, tags, or topics..." className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
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
          {filtered.length === 0 && <div className="col-span-full text-sm text-muted-foreground">No magazines matched your search.</div>}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
