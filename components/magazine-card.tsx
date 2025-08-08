"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RatingStars } from "@/components/rating-stars"
import { useCart } from "@/components/providers"
import { useToast } from "@/hooks/use-toast"
import type { Magazine } from "@/lib/db"

const fallback: Magazine = {
  id: "0",
  name: "Untitled",
  price: 0,
  language: "English",
  country: "Kenya",
  category: "Culture",
  format: "digital",
  issueDate: new Date().toISOString(),
  summary: "",
  coverUrl: "/african-magazine-cover.png",
  rating: 4.5,
  reviewsCount: 10,
  sellerId: "s1",
  tags: [],
  approved: true,
  samplePages: [],
}

export function MagazineCard({ magazine = fallback }: { magazine?: Magazine }) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  return (
    <div className="flex flex-col border rounded-md overflow-hidden">
      <Link href={`/magazines/${magazine.id}`} className="block">
        <Image
          src={magazine.coverUrl || "/placeholder.svg"}
          alt={`${magazine.name} cover`}
          width={600}
          height={800}
          className="w-full h-auto object-cover"
        />
      </Link>
      <div className="p-3 flex-1 flex flex-col">
        <Link href={`/magazines/${magazine.id}`} className="font-medium line-clamp-2 min-h-[40px]">{magazine.name}</Link>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">{magazine.category}</Badge>
          <span className="text-xs text-muted-foreground capitalize">{magazine.format}</span>
        </div>
        <div className="mt-2">
          <RatingStars value={magazine.rating ?? 4.5} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="font-semibold">${magazine.price.toFixed(2)}</div>
          <div className="ml-auto" />
          <Button
            size="sm"
            className="bg-amber-700 hover:bg-amber-800"
            onClick={() => {
              addToCart(magazine.id, 1)
              toast({ title: "Added to cart", description: `${magazine.name} was added to your cart.` })
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
