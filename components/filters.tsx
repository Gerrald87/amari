"use client"

import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CatalogFilters = {
  country: string
  language: string
  category: string
  format: string
  from: string
  to: string
  tag?: string
}

export function Filters({
  open = false,
  setOpen = () => {},
  filters = { country: "", language: "", category: "", format: "", from: "", to: "" },
  setFilters = () => {},
}: {
  open?: boolean
  setOpen?: (v: boolean) => void
  filters?: CatalogFilters
  setFilters?: (v: CatalogFilters) => void
}) {
  const reset = () =>
    setFilters({ country: "", language: "", category: "", format: "", from: "", to: "", tag: "" })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Country</Label>
            <Input
              placeholder="e.g. Kenya"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Language</Label>
            <Input
              placeholder="e.g. English"
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
              <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                {["", "Fashion", "Business", "News", "Culture", "Arts", "Politics", "Lifestyle"].map((c) => (
                  <SelectItem key={c || "any"} value={c}>{c || "Any"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Format</Label>
            <Select value={filters.format} onValueChange={(v) => setFilters({ ...filters, format: v })}>
              <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                {["", "print", "digital"].map((f) => (
                  <SelectItem key={f || "any"} value={f}>{f || "Any"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label>From</Label>
              <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>To</Label>
              <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={reset} className="gap-2">
              <X className="h-4 w-4" /> Reset
            </Button>
            <Button className="bg-amber-700 hover:bg-amber-800" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
