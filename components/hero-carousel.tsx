"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

type Slide = {
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  image: string
}

export function HeroCarousel({
  slides = [],
  intervalMs = 5000,
}: {
  slides?: Slide[]
  intervalMs?: number
}) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), intervalMs)
    return () => clearInterval(id)
  }, [slides.length, intervalMs])

  const slide = slides[idx] ?? {
    title: "Amari",
    subtitle: "Discover African magazines",
    ctaLabel: "Browse",
    ctaHref: "/magazines",
    image: "/african-magazines.png"
  }

  return (
    <div className="relative">
      <div className="relative h-[380px] sm:h-[460px] md:h-[520px] overflow-hidden">
        <Image
          src={slide.image || "/placeholder.svg"}
          alt="Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/10" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-3xl md:text-5xl font-semibold">{slide.title}</h1>
              <p className="text-sm md:text-base mt-3 opacity-90">{slide.subtitle}</p>
              <Link href={slide.ctaHref}>
                <Button className="mt-6 bg-amber-600 hover:bg-amber-700">{slide.ctaLabel}</Button>
              </Link>
              <div className="mt-6 flex items-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to slide ${i + 1}`}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      i === idx ? "bg-amber-500" : "bg-white/60"
                    )}
                    onClick={() => setIdx(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
