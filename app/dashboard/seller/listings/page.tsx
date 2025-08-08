"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useAuth } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { MagazinesClient, SellerClient } from "@/lib/client"

export default function SellerListingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [myMags, setMyMags] = useState<any[]>([])

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

  const canCreate = user?.role === "seller" && user?.sellerStatus === "approved"

  useEffect(() => {
    SellerClient.listings()
      .then((r) => setMyMags(r.data))
      .catch(() => setMyMags([]))
  }, [])

  const onCreate = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please login as a seller to create listings." })
      return
    }
    if (!canCreate) {
      toast({ title: "Pending approval", description: "Seller access pending admin approval.", variant: "destructive" as any })
      return
    }
    const { data } = await MagazinesClient.create({
      ...form,
      price: parseFloat(form.price || "0"),
      format: form.format,
      tags: ["new"],
    })
    toast({ title: "Listing created", description: "Your magazine is pending approval (admin)." })
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
    setMyMags((prev) => [data, ...prev])
  }

  const onDelete = async (id: string) => {
    await MagazinesClient.delete(id).catch(() => {})
    setMyMags((prev) => prev.filter((m) => m.id !== id))
  }

  const onSave = async (m: any) => {
    await MagazinesClient.update(m.id, {
      name: m.name,
      price: m.price,
      summary: m.summary,
      coverUrl: m.coverUrl,
      category: m.category,
      language: m.language,
      country: m.country,
      format: m.format,
      issueDate: m.issueDate?.slice(0, 10),
      tags: m.tags || [],
    }).catch(() => {})
    toast({ title: "Saved", description: "Listing updated and resubmitted for approval." })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold">Your Listings</h1>

      {!canCreate && user?.role === "seller" && (
        <div className="border rounded p-3 text-sm">
          Your seller access is pending admin approval. You can’t create or edit listings yet.
        </div>
      )}

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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Culture", "Fashion", "Business", "News", "Arts", "Politics", "Lifestyle"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Format</Label>
            <Select value={form.format} onValueChange={(v) => setForm((f) => ({ ...f, format: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
            <Image src={form.coverUrl || "/placeholder.svg?height=800&width=600&query=african magazine cover art"} alt="Cover preview" width={200} height={260} className="rounded border object-cover" />
          </div>
          <div className="md:col-span-2">
            <Button disabled={!canCreate} className="bg-amber-700 hover:bg-amber-800" onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" /> Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myMags.map((m) => (
          <div key={m.id} className="border rounded p-3 space-y-2">
            <Image src={m.coverUrl || "/placeholder.svg"} alt={`${m.name} cover`} width={400} height={520} className="rounded border object-cover w-full h-auto" />
            <Input value={m.name} onChange={(e) => setMyMags((prev) => prev.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)))} />
            <div className="flex items-center gap-2">
              <Input value={String(m.price)} onChange={(e) => setMyMags((prev) => prev.map((x) => (x.id === m.id ? { ...x, price: e.target.value } : x)))} />
              <Button variant="outline" size="sm" onClick={() => onSave(m)}>
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(m.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">{m.approved ? "Approved" : "Pending approval"}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
