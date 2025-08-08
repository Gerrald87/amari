"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, UserPlus } from 'lucide-react'
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useAuth } from "@/components/providers"

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [wantSell, setWantSell] = useState(false)
  const { register, login } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const sp = useSearchParams()

  const onSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      let ok = false
      if (mode === "register") {
        ok = await register({ name: name || email.split("@")[0], email, password, wantSell })
      } else {
        ok = await login({ email, password })
      }
      if (ok) {
        const next = sp.get("next") || "/dashboard"
        router.push(next)
      } else {
        setError("Authentication failed.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{mode === "register" ? "Create account" : "Sign in"}</CardTitle>
              <CardDescription>
                {mode === "register"
                  ? "Create your Amari account. If you want to sell, your seller access must be approved by an admin."
                  : "Sign in to your account."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === "register" && (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {mode === "register" && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={wantSell} onChange={(e) => setWantSell(e.target.checked)} />
                  I want to sell (requires admin approval)
                </label>
              )}
              {error && <div className="text-sm text-red-600">{error}</div>}
            </CardContent>
            <CardFooter className="flex items-center gap-2">
              <Button disabled={loading} className="bg-amber-700 hover:bg-amber-800" onClick={onSubmit}>
                {mode === "register" ? <UserPlus className="h-4 w-4 mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                {loading ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"}
              </Button>
              <Button variant="outline" onClick={() => setMode(mode === "register" ? "login" : "register")}>
                {mode === "register" ? "Have an account? Sign in" : "Create an account"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
