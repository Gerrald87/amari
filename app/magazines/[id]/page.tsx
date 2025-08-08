"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Download, Star } from 'lucide-react'
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { RatingStars } from "@/components/rating-stars"
import { useCart } from "@/components/providers"
import { useToast } from "@/hooks/use-toast"
import { MagazinesClient } from "@/lib/client"

export default function MagazineDetailPage() {
  const params = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [magazine, setMagazine] = useState<any | null>(null)

  useEffect(() => {
    if (!params?.id) return
    MagazinesClient.get(params.id).then((r) => setMagazine(r.data)).catch(() => setMagazine(null))
  }, [params?.id])

  if (!magazine) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="container mx-auto px-4 py-12">
          <div className="text-sm text-muted-foreground">Magazine not found.</div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const handleAdd = () => {
    addToCart(magazine.id, 1)
    toast({ title: "Added to cart", description: `${magazine.name} was added to your cart.` })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <Image src={magazine.coverUrl || "/placeholder.svg"} alt={`${magazine.name} cover`} width={600} height={800} className="w-full h-auto rounded-md object-cover border" />
            <div className="mt-4">
              <div className="text-sm font-medium">Preview</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {magazine.samplePages?.slice(0, 6).map((p: string, i: number) => (
                  <Image key={i} src={p || "/placeholder.svg"} alt={`Preview page ${i + 1}`} width={220} height={300} className="w-full h-auto rounded border object-cover" />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h1 className="text-2xl md:text-3xl font-semibold">{magazine.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">{magazine.category}</Badge>
              <Badge className="bg-amber-600 hover:bg-amber-700"> {magazine.country} </Badge>
              <span className="text-muted-foreground">•</span>
              <span>{magazine.language}</span>
              <span className="text-muted-foreground">•</span>
              <span>{new Date(magazine.issueDate).toLocaleDateString()}</span>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <RatingStars value={magazine.rating ?? 4.6} />
              <span className="text-sm text-muted-foreground">({magazine.reviewsCount ?? 120} reviews)</span>
            </div>

            <Separator className="my-6" />

            <p className="text-sm leading-6 text-muted-foreground">{magazine.summary}</p>

            <div className="mt-6 flex items-center gap-2 flex-wrap">
              {magazine.tags?.map((t: string) => (
                <Badge key={t} variant="outline" className="rounded-full">
                  #{t}
                </Badge>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div>
                <div className="text-3xl font-semibold">${Number(magazine.price).toFixed(2)}</div>
                <div className="text-xs text-muted-foreground capitalize">{magazine.format} edition</div>
              </div>
              <div className="ml-auto" />
              <Button onClick={handleAdd} className="bg-amber-700 hover:bg-amber-800">
                <ShoppingCart className="h-4 w-4 mr-2" /> Add to cart
              </Button>
              {magazine.format === "digital" && (
                <Link href="/dashboard/downloads">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" /> Go to downloads
                  </Button>
                </Link>
              )}
            </div>

            <div className="mt-10">
              <div className="font-medium mb-2">Ratings & Reviews</div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded border p-4">
                    <div className="flex items-center gap-2">
                      <Star className="text-amber-600 fill-amber-600 h-4 w-4" />
                      <Star className="text-amber-600 fill-amber-600 h-4 w-4" />
                      <Star className="text-amber-600 fill-amber-600 h-4 w-4" />
                      <Star className="text-amber-600 fill-amber-600 h-4 w-4" />
                      <Star className="text-amber-200 h-4 w-4" />
                      <span className="text-xs text-muted-foreground ml-2">by Reader {i}</span>
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">Great insights and beautiful design. Looking forward to the next issue!</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
