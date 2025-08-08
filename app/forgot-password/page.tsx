"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail } from 'lucide-react'
import { AuthHeader } from "@/components/auth-header"
import { AuthClient } from "@/lib/client"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [devLink, setDevLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await AuthClient.forgot(email)
      setSubmitted(true)
      setDevLink(res.link || null)
    } catch {
      // still show success (avoid email enumeration)
      setSubmitted(true)
      setDevLink(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="relative hidden lg:block">
        <Image
          src="/african-grid.png"
          alt="Amari magazines collage"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/10 to-transparent" />
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <AuthHeader
            title="Forgot your password?"
            subtitle="We’ll send you a reset link if your email is in our system."
            className="mb-6"
          />
          <Card>
            {!submitted ? (
              <form onSubmit={onSubmit}>
                <CardHeader>
                  <CardTitle className="text-base">Reset your password</CardTitle>
                  <CardDescription>Enter the email associated with your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {error && <div className="text-sm text-red-600">{error}</div>}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button disabled={loading} className="w-full bg-amber-700 hover:bg-amber-800" type="submit">
                    <Mail className="h-4 w-4 mr-2" />
                    {loading ? "Sending..." : "Send reset link"}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Remembered it?{" "}
                    <Link href="/login" className="text-amber-700 hover:underline">
                      Back to sign in
                    </Link>
                  </div>
                </CardFooter>
              </form>
            ) : (
              <>
                <CardHeader>
                  <CardTitle className="text-base">Check your email</CardTitle>
                  <CardDescription>
                    If an account exists for {email}, you’ll receive a reset link shortly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {devLink ? (
                    <div className="border rounded p-3">
                      Dev shortcut: use this link to reset now:
                      <div className="mt-1 break-all">
                        <Link className="text-amber-700 underline" href={devLink}>
                          {devLink}
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div>Return to the app after resetting your password.</div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
                    Back to sign in
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
