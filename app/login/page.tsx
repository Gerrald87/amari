"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { LogIn } from 'lucide-react'
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useAuth } from "@/components/providers"

export default function LoginPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"buyer" | "seller" | "admin">("buyer")
  const { login } = useAuth()
  const router = useRouter()

  const onSubmit = () => {
    const ok = login({ name: name || "Guest", email: email || "guest@example.com", role })
    if (ok) {
      router.push(role === "buyer" ? "/dashboard" : role === "seller" ? "/dashboard/seller" : "/dashboard/admin")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Quick login for MVP. In production, use OAuth (Google/Facebook) or email-based auth.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <RadioGroup value={role} onValueChange={(v) => setRole(v as any)} className="grid grid-cols-3 gap-3">
                  <div>
                    <RadioGroupItem id="buyer" value="buyer" className="peer sr-only" />
                    <Label
                      htmlFor="buyer"
                      className="flex cursor-pointer items-center justify-center rounded-md border p-2 text-sm hover:bg-muted peer-data-[state=checked]:border-amber-700 peer-data-[state=checked]:bg-amber-50"
                    >
                      Buyer
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem id="seller" value="seller" className="peer sr-only" />
                    <Label
                      htmlFor="seller"
                      className="flex cursor-pointer items-center justify-center rounded-md border p-2 text-sm hover:bg-muted peer-data-[state=checked]:border-amber-700 peer-data-[state=checked]:bg-amber-50"
                    >
                      Seller
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem id="admin" value="admin" className="peer sr-only" />
                    <Label
                      htmlFor="admin"
                      className="flex cursor-pointer items-center justify-center rounded-md border p-2 text-sm hover:bg-muted peer-data-[state=checked]:border-amber-700 peer-data-[state=checked]:bg-amber-50"
                    >
                      Admin
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="bg-amber-700 hover:bg-amber-800" onClick={onSubmit}>
                <LogIn className="h-4 w-4 mr-2" /> Continue
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
