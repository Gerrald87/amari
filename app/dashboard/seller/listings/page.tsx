"use client"

import { useState } from "react"
import Image from "next/image"
import { useAuth } from "@/components/providers"
import { useDB } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function SellerListingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { getMagazines, addMagazine } = useDB()
  const mags = getMagazines().filter((m) => m.sellerId === user?.id)

  const [form, setForm] = useState({
    name: "",
    price: "5.00",
    language: "English",
    country: "Kenya",
    category: "Culture",
    format: "digital",
    issueDate: new Date().toISOString().slice(0, 10),
    summary: "",
    coverUrl: "/african-magazine-cover.png",
  })
  const onCreate = () => {
    if (!user) return
    addMagazine({
      name: form.name || "Untitled Magazine",
      price: parseFloat(form.price || "0"),
      language: form.language,
      country: form.country,
      category: form.category,
      format: form.format as "print" | "digital",
      issueDate: form.issueDate,
      summary: form.summary || "New magazine",
      coverUrl: form.coverUrl,
      sellerId: user.id,
      tags: ["new"],
    })
    toast({ title: "Listing created", description: "Your magazine is now live." })
    setForm({
      name: "",
      price: "5.00",
      language: "English",
      country: "Kenya",
      category: "Culture",
      format: "digital",
      issueDate: new Date().toISOString().slice(0, 10),
      summary: "",
      coverUrl: "/african-magazine-cover.png",
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold">Your Listings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Listing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Price (USD)</Label>
            <Input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Language</Label>
            <Input value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Country</Label>
            <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Culture", "Fashion", "Business", "News", "Arts", "Politics", "Lifestyle"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Format</Label>
            <Select value={form.format} onValueChange={(v) => setForm((f) => ({ ...f, format: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="print">Print</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Issue Date</Label>
            <Input type="date" value={form.issueDate} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Summary</Label>
            <Textarea value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Cover URL</Label>
            <Input value={form.coverUrl} onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Preview</Label>
            <Image
              src={form.coverUrl || "/placeholder.svg?height=800&width=600&query=african magazine cover art"}
              alt="Cover preview"
              width={200}
              height={260}
              className="rounded border object-cover"
            />
          </div>
          <div className="md:col-span-2">
            <Button className="bg-amber-700 hover:bg-amber-800" onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" /> Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mags.map((m) => (
          <div key={m.id} className="border rounded p-3">
            <Image src={m.coverUrl || "/placeholder.svg"} alt={`${m.name} cover`} width={400} height={520} className="rounded border object-cover w-full h-auto" />
            <div className="mt-2 font-medium">{m.name}</div>
            <div className="text-xs text-muted-foreground">${m.price.toFixed(2)} • {m.format}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
