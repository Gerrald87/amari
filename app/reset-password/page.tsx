"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck } from 'lucide-react'
import { AuthHeader } from "@/components/auth-header"
import { AuthClient } from "@/lib/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const token = sp.get("token") || ""
  const [valid, setValid] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setValid(false)
      return
    }
    AuthClient.validateReset(token)
      .then(() => setValid(true))
      .catch(() => setValid(false))
  }, [token])

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
      await AuthClient.reset({ token, password })
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Unable to reset password.")
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
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <AuthHeader
            title="Set a new password"
            subtitle="Choose a strong password to secure your Amari account"
            className="mb-6"
          />
          <Card>
            {valid === null ? (
              <CardContent className="p-6 text-sm text-muted-foreground">Validating link…</CardContent>
            ) : valid === false ? (
              <>
                <CardHeader>
                  <CardTitle className="text-base">Link invalid or expired</CardTitle>
                  <CardDescription>Please request a new password reset.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/forgot-password" className="w-full">
                    <Button className="w-full bg-amber-700 hover:bg-amber-800">Request new link</Button>
                  </Link>
                </CardFooter>
              </>
            ) : (
              <form onSubmit={onSubmit}>
                <CardHeader>
                  <CardTitle className="text-base">Reset your password</CardTitle>
                  <CardDescription>Enter your new password below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">New password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
                  </div>
                  {error && <div className="text-sm text-red-600">{error}</div>}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button disabled={loading} className="w-full bg-amber-700 hover:bg-amber-800" type="submit">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    {loading ? "Updating..." : "Update password"}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Changed your mind?{" "}
                    <Link href="/login" className="text-amber-700 hover:underline">
                      Back to sign in
                    </Link>
                  </div>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
