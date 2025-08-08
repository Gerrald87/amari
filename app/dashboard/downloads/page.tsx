"use client"

import { useDB } from "@/lib/db"
import { useAuth } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'

export default function DownloadsPage() {
  const { user } = useAuth()
  const { getDigitalDownloadsForUser, getMagazineById } = useDB()
  const items = user ? getDigitalDownloadsForUser(user.id) : []

  const download = (name: string) => {
    const blob = new Blob([`Thank you for purchasing ${name} on Amari.\n\nMVP placeholder file.`], {
      type: "text/plain",
    })
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
          const m = getMagazineById(it.magazineId)
          if (!m) return null
          return (
            <div key={it.magazineId} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">
                  Purchased: {new Date(it.purchasedAt).toLocaleDateString()}
                </div>
              </div>
              <Button onClick={() => download(m.name)} className="bg-amber-700 hover:bg-amber-800">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
