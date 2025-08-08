import { getSql } from "./sql"
import type { Session, SellerStatus } from "./auth"
import bcrypt from "bcryptjs"

export type CreateListingInput = {
  name: string
  price: number
  language: string
  country: string
  category: string
  format: "print" | "digital"
  issueDate: string
  summary: string
  coverUrl: string
  sellerId: string
  tags?: string[]
}

/**
 * Auth
 */
export async function registerUser(input: { name: string; email: string; password: string }) {
  const sql = getSql()
  const hash = await bcrypt.hash(input.password, 10)
  const role: Session["role"] = "buyer"
  const sellerStatus: SellerStatus = "none"

  const rows = await sql<
    { id: string; name: string; email: string; role: Session["role"]; seller_status: SellerStatus }[]
  >`
    insert into users (name, email, role, password_hash, seller_status)
    values (${input.name}, ${input.email}, ${role}, ${hash}, ${sellerStatus})
    on conflict (email) do update set name = excluded.name
    returning id, name, email, role, seller_status
  `
  return { ...rows[0], sellerStatus: rows[0].seller_status }
}

export async function loginUser(input: { email: string; password: string }) {
  const sql = getSql()
  const rows = await sql<
    {
      id: string
      name: string
      email: string
      role: Session["role"]
      password_hash: string
      seller_status: SellerStatus
    }[]
  >`
    select id, name, email, role, password_hash, seller_status
    from users
    where email = ${input.email}
    limit 1
  `
  const user = rows[0]
  if (!user) throw new Error("INVALID_CREDENTIALS")

  const ok = await bcrypt.compare(input.password, user.password_hash || "")
  if (!ok) throw new Error("INVALID_CREDENTIALS")

  return { id: user.id, name: user.name, email: user.email, role: user.role, sellerStatus: user.seller_status }
}

/**
 * Forgot/Reset password
 */
export async function createPasswordReset(email: string, origin: string) {
  const sql = getSql()
  const rows = await sql<{ id: string }[]>`select id from users where email = ${email} limit 1`
  if (!rows.length) return { ok: true as const, link: null as string | null }

  const userId = rows[0].id
  const token = crypto.randomUUID().replace(/-/g, "")
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30)
  await sql`insert into password_resets (user_id, token, expires_at) values (${userId}, ${token}, ${expiresAt.toISOString()})`
  const link = `${origin}/reset-password?token=${encodeURIComponent(token)}`
  return { ok: true as const, link }
}

export async function validateResetToken(token: string) {
  const sql = getSql()
  const rows = await sql<{ id: string; user_id: string; expires_at: string; used_at: string | null }[]>`
    select id, user_id, expires_at::text, used_at::text
    from password_resets
    where token = ${token}
    limit 1
  `
  if (!rows.length) return { ok: false as const, reason: "INVALID" as const }
  const rec = rows[0]
  if (rec.used_at) return { ok: false as const, reason: "USED" as const }
  if (new Date(rec.expires_at).getTime() < Date.now()) return { ok: false as const, reason: "EXPIRED" as const }
  return { ok: true as const, resetId: rec.id, userId: rec.user_id }
}

export async function resetPasswordByToken(token: string, newPassword: string) {
  const sql = getSql()
  const v = await validateResetToken(token)
  if (!v.ok) return { ok: false as const, reason: v.reason }

  const hash = await bcrypt.hash(newPassword, 10)
  await sql`update users set password_hash = ${hash} where id = ${v.userId}`
  await sql`update password_resets set used_at = now() where id = ${v.resetId}`
  const user = await sql<{ id: string; name: string; email: string; role: Session["role"] }[]>`
    select id, name, email, role from users where id = ${v.userId} limit 1
  `
  const u = user[0]
  return { ok: true as const, user: u }
}

/**
 * Listings (Magazines)
 */
export async function listMagazines(params: {
  country?: string
  language?: string
  category?: string
  format?: "print" | "digital"
  from?: string
  to?: string
  q?: string
  tag?: string
}) {
  const sql = getSql()
  const q = params.q ? `%${params.q.toLowerCase()}%` : null
  const rows = await sql<any[]>`
    select id, name, price, language, country, category, format,
           issue_date as "issueDate", summary, cover_url as "coverUrl",
           rating, reviews_count as "reviewsCount", seller_id as "sellerId",
           tags, approved
    from magazines
    where approved = true
    ${params.country ? sql` and country = ${params.country}` : sql``}
    ${params.language ? sql` and language = ${params.language}` : sql``}
    ${params.category ? sql` and category = ${params.category}` : sql``}
    ${params.format ? sql` and format = ${params.format}` : sql``}
    ${params.tag ? sql` and tags @> array[${params.tag}]::text[]` : sql``}
    ${params.from ? sql` and issue_date >= ${params.from}` : sql``}
    ${params.to ? sql` and issue_date <= ${params.to}` : sql``}
    ${
      q
        ? sql`
            and (
              lower(name) like ${q}
              or lower(summary) like ${q}
              or exists (select 1 from unnest(tags) t where lower(t) like ${q})
            )
          `
        : sql``
    }
    order by created_at desc
  `
  return rows.map((r) => ({
    ...r,
    price: Number(r.price),
    rating: r.rating != null ? Number(r.rating) : null,
    reviewsCount: Number(r.reviewsCount ?? 0),
  }))
}

export async function getMagazine(id: string) {
  const sql = getSql()
  const rows = await sql<any[]>`
    select id, name, price, language, country, category, format,
           issue_date as "issueDate", summary, cover_url as "coverUrl",
           rating, reviews_count as "reviewsCount", seller_id as "sellerId",
           tags, approved
    from magazines
    where id = ${id}
    limit 1
  `
  const mag = rows[0]
  if (!mag) return null
  mag.price = Number(mag.price)
  mag.reviewsCount = Number(mag.reviewsCount ?? 0)
  const pages = await sql<{ url: string }[]>`select url from magazine_pages where magazine_id = ${id} order by idx asc`
  mag.samplePages = pages.map((p) => p.url)
  return mag
}

export async function createListing(input: CreateListingInput) {
  const sql = getSql()
  const rows = await sql<{ id: string }[]>`
    insert into magazines (
      name, price, language, country, category, format, issue_date, summary, cover_url, seller_id, tags, approved
    ) values (
      ${input.name}, ${input.price}, ${input.language}, ${input.country},
      ${input.category}, ${input.format}, ${input.issueDate}, ${input.summary},
      ${input.coverUrl}, ${input.sellerId}, ${input.tags || []}, false
    )
    returning id
  `
  return getMagazine(rows[0].id)
}

export async function updateListing(
  id: string,
  sellerId: string,
  patch: Partial<Omit<CreateListingInput, "sellerId">>,
) {
  const sql = getSql()
  const own = await sql<{ seller_id: string }[]>`select seller_id from magazines where id = ${id} limit 1`
  if (!own[0]) return { ok: false as const, error: "NOT_FOUND" as const }
  if (own[0].seller_id !== sellerId) return { ok: false as const, error: "FORBIDDEN" as const }

  await sql`
    update magazines
    set
      name = coalesce(${patch.name}, name),
      price = coalesce(${patch.price}::numeric, price),
      language = coalesce(${patch.language}, language),
      country = coalesce(${patch.country}, country),
      category = coalesce(${patch.category}, category),
      format = coalesce(${patch.format}, format),
      issue_date = coalesce(${patch.issueDate}::date, issue_date),
      summary = coalesce(${patch.summary}, summary),
      cover_url = coalesce(${patch.coverUrl}, cover_url),
      tags = coalesce(${patch.tags}::text[], tags),
      approved = false
    where id = ${id}
  `
  return { ok: true as const }
}

export async function deleteListing(id: string, sellerId: string) {
  const sql = getSql()
  const own = await sql<{ seller_id: string }[]>`select seller_id from magazines where id = ${id} limit 1`
  if (!own[0]) return { ok: false as const, error: "NOT_FOUND" as const }
  if (own[0].seller_id !== sellerId) return { ok: false as const, error: "FORBIDDEN" as const }
  await sql`delete from magazines where id = ${id}`
  return { ok: true as const }
}

export async function adminUpdateListing(id: string, patch: Partial<Omit<CreateListingInput, "sellerId">>) {
  const sql = getSql()
  await sql`
    update magazines
    set
      name = coalesce(${patch.name}, name),
      price = coalesce(${patch.price}::numeric, price),
      language = coalesce(${patch.language}, language),
      country = coalesce(${patch.country}, country),
      category = coalesce(${patch.category}, category),
      format = coalesce(${patch.format}, format),
      issue_date = coalesce(${patch.issueDate}::date, issue_date),
      summary = coalesce(${patch.summary}, summary),
      cover_url = coalesce(${patch.coverUrl}, cover_url),
      tags = coalesce(${patch.tags}::text[], tags),
      approved = false
    where id = ${id}
  `
  return { ok: true as const }
}

export async function adminDeleteListing(id: string) {
  const sql = getSql()
  await sql`delete from magazines where id = ${id}`
  return { ok: true as const }
}

export async function listPendingMagazines() {
  const sql = getSql()
  const rows = await sql<any[]>`
    select id, name, price, cover_url as "coverUrl", created_at
    from magazines
    where approved = false
    order by created_at desc
  `
  return rows.map((r) => ({ ...r, price: Number(r.price) }))
}

export async function approveMagazine(id: string) {
  const sql = getSql()
  await sql`update magazines set approved = true where id = ${id}`
  return true
}

export async function approveAll() {
  const sql = getSql()
  await sql`update magazines set approved = true where approved = false`
  return true
}

/**
 * Admin: Users and Sellers
 */

export async function counts() {
  const sql = getSql()
  const [u, m, o] = await Promise.all([
    sql<{ c: string }[]>`select count(*)::text as c from users`,
    sql<{ c: string }[]>`select count(*)::text as c from magazines`,
    sql<{ c: string }[]>`select count(*)::text as c from orders`,
  ])
  return {
    users: Number(u[0].c),
    magazines: Number(m[0].c),
    orders: Number(o[0].c),
  }
}

export async function getUsers() {
  const sql = getSql()
  const rows = await sql<any[]>`
    select id, name, email, role, seller_status as "sellerStatus"
    from users
    order by created_at desc
  `
  return rows
}

export async function listPendingSellers() {
  const sql = getSql()
  const rows = await sql<any[]>`
    select id, name, email, role, seller_status as "sellerStatus", created_at
    from users
    where role = 'seller' and seller_status = 'pending'
    order by created_at desc
  `
  return rows
}

export async function setSellerStatus(userId: string, status: SellerStatus) {
  const sql = getSql()
  await sql`update users set seller_status = ${status} where id = ${userId}`
  return { ok: true as const }
}

/**
 * Notifications
 */
export async function notify(userId: string, title: string, body?: string) {
  const sql = getSql()
  await sql`insert into notifications (user_id, title, body) values (${userId}, ${title}, ${body || null})`
}

export async function listNotifications(userId: string) {
  const sql = getSql()
  const rows = await sql<any[]>`
    select id, title, body, read_at as "readAt", created_at as "createdAt"
    from notifications
    where user_id = ${userId}
    order by created_at desc
  `
  return rows
}

export async function markNotificationRead(userId: string, id: string) {
  const sql = getSql()
  await sql`update notifications set read_at = now() where id = ${id} and user_id = ${userId}`
  return { ok: true as const }
}

export async function unreadCount(userId: string) {
  const sql = getSql()
  const rows = await sql<{ c: string }[]>`select count(*)::text as c from notifications where user_id = ${userId} and read_at is null`
  return Number(rows[0].c)
}

/**
 * Orders
 */
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'fulfilled' | 'canceled' | 'refunded'

export async function placeOrder(userId: string, items: Array<{ magazineId: string; qty: number }>) {
  const sql = getSql()
  const ids = items.map((i) => i.magazineId)
  const mags = await sql<{ id: string; price: string; format: "print" | "digital"; seller_id: string }[]>`
    select id, price::text as price, format, seller_id from magazines where id = any(${ids})
  `
  const fullItems = items.map((it) => {
    const m = mags.find((x) => x.id === it.magazineId)
    if (!m) throw new Error("MAGAZINE_NOT_FOUND")
    return { magazineId: it.magazineId, qty: it.qty, price: Number(m.price), format: m.format }
  })
  const total = fullItems.reduce((s, i) => s + i.price * i.qty, 0)
  const hasPrint = fullItems.some((i) => i.format === "print")
  const status: OrderStatus = hasPrint ? "processing" : "fulfilled"

  const orderIdRows = await sql<{ id: string }[]>`
    insert into orders (user_id, total, status) values (${userId}, ${total}, ${status}) returning id
  `
  const orderId = orderIdRows[0].id

  for (const it of fullItems) {
    await sql`insert into order_items (order_id, magazine_id, qty, price, format)
              values (${orderId}, ${it.magazineId}, ${it.qty}, ${it.price}, ${it.format})`
  }

  // Notify buyer
  await notify(userId, "Order placed", `Your order ${orderId} is ${status}.`)

  // Notify sellers involved
  const sellerIds = Array.from(new Set(mags.map((m) => m.seller_id)))
  for (const sid of sellerIds) {
    await notify(sid, "New order item", `An item in order ${orderId} includes your listing.`)
  }

  const order = await sql<any[]>`
    select id, user_id as "userId", total, status, created_at as "createdAt"
    from orders where id = ${orderId}
  `
  return { ...order[0], items: fullItems }
}

export async function ordersByUser(userId: string) {
  const sql = getSql()
  const orders = await sql<any[]>`
    select id, user_id as "userId", total, status, created_at as "createdAt"
    from orders
    where user_id = ${userId}
    order by created_at desc
  `
  for (const o of orders) {
    const items = await sql<any[]>`
      select magazine_id as "magazineId", qty, price::float as price, format
      from order_items where order_id = ${o.id}
    `
    o.items = items
  }
  return orders
}

// Admin-only status update in MVP
export async function adminUpdateOrderStatus(orderId: string, status: OrderStatus) {
  const sql = getSql()
  await sql`update orders set status = ${status} where id = ${orderId}`
  // Notify the buyer
  const row = await sql<{ user_id: string }[]>`select user_id from orders where id = ${orderId} limit 1`
  const uid = row[0]?.user_id
  if (uid) await notify(uid, "Order updated", `Order ${orderId} is now ${status}.`)
  return { ok: true as const }
}

/**
 * Chat
 */
export async function ensureConversation(buyerId: string, sellerId: string, orderId?: string | null) {
  const sql = getSql()
  const existing = await sql<{ id: string }[]>`
    select id from conversations
    where buyer_id = ${buyerId} and seller_id = ${sellerId} and coalesce(order_id::text,'') = coalesce(${orderId || null}::text,'')
    limit 1
  `
  if (existing.length) return existing[0].id
  const ins = await sql<{ id: string }[]>`
    insert into conversations (buyer_id, seller_id, order_id)
    values (${buyerId}, ${sellerId}, ${orderId || null})
    returning id
  `
  return ins[0].id
}

export async function listConversations(userId: string) {
  const sql = getSql()
  const rows = await sql<any[]>`
    select
      c.id,
      c.order_id as "orderId",
      c.buyer_id as "buyerId",
      c.seller_id as "sellerId",
      c.created_at as "createdAt",
      -- last message preview
      (select body from messages where conversation_id = c.id order by created_at desc limit 1) as lastBody,
      (select created_at from messages where conversation_id = c.id order by created_at desc limit 1) as lastAt
    from conversations c
    where c.buyer_id = ${userId} or c.seller_id = ${userId}
    order by coalesce((select created_at from messages where conversation_id = c.id order by created_at desc limit 1), c.created_at) desc
  `
  return rows
}

export async function listMessages(conversationId: string, userId: string) {
  const sql = getSql()
  const conv = await sql<{ buyer_id: string; seller_id: string }[]>`
    select buyer_id, seller_id from conversations where id = ${conversationId} limit 1
  `
  if (!conv.length) throw new Error("NOT_FOUND")
  const { buyer_id, seller_id } = conv[0]
  if (userId !== buyer_id && userId !== seller_id) throw new Error("FORBIDDEN")

  const msgs = await sql<any[]>`
    select id, sender_id as "senderId", body, created_at as "createdAt", read_at as "readAt"
    from messages
    where conversation_id = ${conversationId}
    order by created_at asc
  `
  return msgs
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  const sql = getSql()
  const conv = await sql<{ buyer_id: string; seller_id: string }[]>`
    select buyer_id, seller_id from conversations where id = ${conversationId} limit 1
  `
  if (!conv.length) throw new Error("NOT_FOUND")
  const { buyer_id, seller_id } = conv[0]
  if (senderId !== buyer_id && senderId !== seller_id) throw new Error("FORBIDDEN")

  const ins = await sql<{ id: string }[]>`
    insert into messages (conversation_id, sender_id, body)
    values (${conversationId}, ${senderId}, ${body})
    returning id
  `
  // Notify the other participant
  const recipient = senderId === buyer_id ? seller_id : buyer_id
  await notify(recipient, "New message", body.slice(0, 120))
  return { id: ins[0].id }
}

export async function downloadsForUser(userId: string) {
  const sql = getSql()
  const rows = await sql<
    { magazineId: string; purchasedAt: string }[]
  >`
    select
      oi.magazine_id as "magazineId",
      o.created_at::text as "purchasedAt"
    from orders o
    join order_items oi on oi.order_id = o.id
    where o.user_id = ${userId}
      and oi.format = 'digital'
    order by o.created_at desc
  `
  return rows
}
