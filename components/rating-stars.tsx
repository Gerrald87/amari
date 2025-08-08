"use client"

import { Star } from 'lucide-react'

export function RatingStars({ value = 4.5 }: { value?: number }) {
  const full = Math.floor(value)
  const half = value - full >= 0.5
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half)
        return (
          <Star
            key={i}
            className={filled ? "h-4 w-4 text-amber-600 fill-amber-600" : "h-4 w-4 text-amber-200"}
          />
        )
      })}
      <span className="text-xs text-muted-foreground ml-2">{value.toFixed(1)}</span>
    </div>
  )
}
