"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/components/providers"
import { AuthClient } from "@/lib/client"

export default function SellerRequestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [status, setStatus] = useState<null | "idle" | "pending" | "done" | "error">(null)
  const [message, setMessage] = useState<string | null>(null)

  const onRequest = async () => {
    setStatus("pending")
    setMessage(null)
    try {
      const res = await AuthClient.becomeSeller()
      setStatus("done")
      setMessage(
        res.sellerStatus === "approved"
          ? "You are already approved as a seller."
          : "Request submitted. An admin will review your access."
      )
      // Hard refresh so the session and header reflect new role/status.
      window.location.href = "/dashboard"
    } catch (e: any) {
      setStatus("error")
      setMessage("Unable to submit request. Please try again.")
    }
  }

  const alreadyApproved = user?.role === "seller" && user?.sellerStatus === "approved"

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Become a Seller</CardTitle>
          <CardDescription>
            Request access to create listings and manage sales on Amari. Admin approval is required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            With a seller account, you can publish magazines, track analytics, and chat with buyers. Your request is reviewed by an admin to keep the marketplace high quality.
          </p>
          {alreadyApproved && (
            <div className="text-emerald-700">
              You’re already an approved seller. Visit your Seller Dashboard to manage listings.
            </div>
          )}
          {message && <div className="text-muted-foreground">{message}</div>}
        </CardContent>
        <CardFooter>
          <Button
            onClick={onRequest}
            disabled={alreadyApproved || status === "pending"}
            className="bg-amber-700 hover:bg-amber-800"
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            {alreadyApproved ? "Seller approved" : status === "pending" ? "Submitting..." : "Request seller access"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
