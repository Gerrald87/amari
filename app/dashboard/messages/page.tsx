"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatClient } from "@/lib/client"
import { useAuth } from "@/components/providers"
import { useSearchParams } from "next/navigation"

export default function MessagesPage() {
  const { user } = useAuth()
  const sp = useSearchParams()
  const focusId = sp.get("conversation") || null

  const [convos, setConvos] = useState<any[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  const loadConvos = async () => {
    const r = await ChatClient.conversations()
    setConvos(r.data)
    if (!activeId && (focusId || r.data[0]?.id)) {
      setActiveId(focusId || r.data[0]?.id)
    }
  }

  const loadMessages = async (id: string | null) => {
    if (!id) return
    try {
      const r = await ChatClient.messages(id)
      setMessages(r.data)
    } catch {
      setMessages([])
    }
  }

  useEffect(() => {
    loadConvos().catch(() => setConvos([]))
  }, [])

  useEffect(() => {
    if (activeId) loadMessages(activeId)
    const int = setInterval(() => activeId && loadMessages(activeId), 5000)
    return () => clearInterval(int)
  }, [activeId])

  const onSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!activeId || !text.trim()) return
    setLoading(true)
    try {
      await ChatClient.send(activeId, text.trim())
      setText("")
      await loadMessages(activeId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-4 border rounded">
        <div className="p-3 font-medium border-b">Conversations</div>
        <div className="max-h-[60vh] overflow-auto">
          {convos.map((c) => {
            const isActive = c.id === activeId
            const title =
              user?.userId === c.buyerId ? `Seller ${c.sellerId.slice(0, 6)}` : `Buyer ${c.buyerId.slice(0, 6)}`
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-3 py-2 border-b hover:bg-accent ${isActive ? "bg-accent" : ""}`}
              >
                <div className="font-medium">{title}</div>
                {c.orderId && <div className="text-xs text-muted-foreground">Order {c.orderId}</div>}
                {c.lastBody && (
                  <div className="text-xs text-muted-foreground line-clamp-1">{c.lastBody}</div>
                )}
              </button>
            )
          })}
          {convos.length === 0 && <div className="p-3 text-sm text-muted-foreground">No conversations yet.</div>}
        </div>
      </div>

      <div className="md:col-span-8 border rounded flex flex-col">
        <div className="p-3 font-medium border-b">Messages</div>
        <div className="flex-1 p-3 space-y-2 max-h-[50vh] overflow-auto">
          {messages.map((m) => {
            const mine = m.senderId === user?.userId
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`${mine ? "bg-amber-600 text-white" : "bg-accent"} rounded px-3 py-2 max-w-[80%]`}>
                  <div className="text-sm">{m.body}</div>
                  <div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              </div>
            )
          })}
          {messages.length === 0 && <div className="text-sm text-muted-foreground">No messages in this conversation.</div>}
        </div>
        <form onSubmit={onSend} className="p-3 border-t flex gap-2">
          <Input placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} />
          <Button type="submit" disabled={!activeId || loading} className="bg-amber-700 hover:bg-amber-800">
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
