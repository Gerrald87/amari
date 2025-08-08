"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import { DownloadsClient, MagazinesClient } from "@/lib/client"

export default function DownloadsPage() {
  const [items, setItems] = useState<Array<{ magazineId: string; purchasedAt: string }>>([])
  const [names, setNames] = useState<Record<string, string>>({})

  useEffect(() => {
    DownloadsClient.listMine().then((r) => setItems(r.data))
  }, [])
  useEffect(() => {
    async function loadNames() {
      const map: Record<string, string> = {}
      await Promise.all(
        items.map(async (it) => {
          if (!map[it.magazineId]) {
            const mg = await MagazinesClient.get(it.magazineId)
            map[it.magazineId] = mg.data.name
          }
        })
      )
      setNames(map)
    }
    if (items.length) loadNames()
  }, [items])

  const download = (name: string) => {
    const blob = new Blob([`Thank you for purchasing ${name} on Amari.\n\nMVP placeholder file.`], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${name.replace(/\s+/g, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-4">Downloads</h1>
      <div className="grid gap-3">
        {items.length === 0 && <div className="text-sm text-muted-foreground">No digital items yet.</div>}
        {items.map((it) => {
          const name = names[it.magazineId] || it.magazineId
          return (
            <div key={it.magazineId} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">{name}</div>
                <div className="text-xs text-muted-foreground">Purchased: {new Date(it.purchasedAt).toLocaleDateString()}</div>
              </div>
              <Button onClick={() => download(name)} className="bg-amber-700 hover:bg-amber-800">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
