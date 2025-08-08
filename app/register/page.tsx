"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from 'lucide-react'
import { useAuth } from "@/components/providers"
import { AuthHeader } from "@/components/auth-header"

export default function RegisterPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const { register } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (password.length < 8) {
        setError("Use at least 8 characters.")
        setLoading(false)
        return
      }
      const ok = await register({ name: name || email.split("@")[0], email, password })
      if (ok) {
        const next = sp.get("next") || "/dashboard"
        router.push(next)
      } else {
        setError("We couldn’t create your account. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="relative hidden lg:block">
        <Image
          src="/african-magazines.png"
          alt="Amari reading experience"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/10 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="text-sm uppercase tracking-wider text-white/80">JOIN AMARI</div>
          <div className="mt-2 text-3xl font-semibold leading-tight">
            Create an account and start exploring
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <AuthHeader
            title="Create your account"
            subtitle="Shop print or download digital issues"
            className="mb-6"
          />
          <Card>
            <form onSubmit={onSubmit}>
              <CardHeader>
                <CardTitle className="text-base">Sign up</CardTitle>
                <CardDescription>It only takes a minute to get started.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
                </div>
                {error && (
                  <div role="alert" className="text-sm text-red-600">
                    {error}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button disabled={loading} className="w-full bg-amber-700 hover:bg-amber-800" type="submit">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {loading ? "Creating account..." : "Create account"}
                </Button>
                <div className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-amber-700 hover:underline">
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
          <div className="mt-6 text-xs text-muted-foreground text-center">
            By continuing, you agree to Amari’s Terms and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  )
}
