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
export async function registerUser(input: {
  name: string
  email: string
  password: string
  wantSell?: boolean
}) {
  const sql = getSql()
  const hash = await bcrypt.hash(input.password, 10)
  const role: Session["role"] = input.wantSell ? "seller" : "buyer"
  const sellerStatus: SellerStatus = input.wantSell ? "pending" : "none"

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

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    sellerStatus: user.seller_status,
  }
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
  const rows = await sql<any[]>`
    select
      id,
      name,
      price,
      language,
      country,
      category,
      format,
      issue_date as "issueDate",
      summary,
      cover_url as "coverUrl",
      rating,
      reviews_count as "reviewsCount",
      seller_id as "sellerId",
      tags,
      approved
    from magazines
    where approved = true
    ${params.country ? sql` and country = ${params.country}` : sql``}
    ${params.language ? sql` and language = ${params.language}` : sql``}
    ${params.category ? sql` and category = ${params.category}` : sql``}
    ${params.format ? sql` and format = ${params.format}` : sql``}
    ${params.tag ? sql` and tags @> array[${params.tag}]::text[]` : sql``}
    ${params.from ? sql` and issue_date >= ${params.from}` : sql``}
    ${params.to ? sql` and issue_date <= ${params.to}` : sql``}
    order by created_at desc
  `
  const normalized = rows.map((r) => ({
    ...r,
    price: Number(r.price),
    reviewsCount: Number(r.reviewsCount ?? 0),
  }))

  if (!params.q) return normalized
  const q = params.q.toLowerCase()
  return normalized.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      (m.tags || []).some((t: string) => t.toLowerCase().includes(q)),
  )
}

export async function getMagazine(id: string) {
  const sql = getSql()
  const rows = await sql<any[]>`
    select
      id,
      name,
      price,
      language,
      country,
      category,
      format,
      issue_date as "issueDate",
      summary,
      cover_url as "coverUrl",
      rating,
      reviews_count as "reviewsCount",
      seller_id as "sellerId",
      tags,
      approved
    from magazines
    where id = ${id}
    limit 1
  `
  const mag = rows[0]
  if (!mag) return null
  mag.price = Number(mag.price)
  mag.reviewsCount = Number(mag.reviewsCount ?? 0)

  const pages = await sql<{ url: string }[]>`
    select url from magazine_pages where magazine_id = ${id} order by idx asc
  `
  mag.samplePages = pages.map((p) => p.url)
  return mag
}

export async function createListing(input: CreateListingInput) {
  const sql = getSql()
  const rows = await sql<{ id: string }[]>`
    insert into magazines (
      name, price, language, country, category, format, issue_date, summary, cover_url, seller_id, tags, approved
    ) values (
      ${input.name},
      ${input.price},
      ${input.language},
      ${input.country},
      ${input.category},
      ${input.format},
      ${input.issueDate},
      ${input.summary},
      ${input.coverUrl},
      ${input.sellerId},
      ${input.tags || []},
      false
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
  const own = await sql<{ seller_id: string }[]>`
    select seller_id from magazines where id = ${id} limit 1
  `
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
  const own = await sql<{ seller_id: string }[]>`
    select seller_id from magazines where id = ${id} limit 1
  `
  if (!own[0]) return { ok: false as const, error: "NOT_FOUND" as const }
  if (own[0].seller_id !== sellerId) return { ok: false as const, error: "FORBIDDEN" as const }
  await sql`delete from magazines where id = ${id}`
  return { ok: true as const }
}

export async function adminUpdateListing(
  id: string,
  patch: Partial<Omit<CreateListingInput, "sellerId">>
) {
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
 * Analytics / counts
 */
export async function counts() {
  const sql = getSql()
  const [users, mags, orders] = await Promise.all([
    sql<{ c: string }[]>`select count(*)::text as c from users`,
    sql<{ c: string }[]>`select count(*)::text as c from magazines`,
    sql<{ c: string }[]>`select count(*)::text as c from orders`,
  ])
  return {
    users: Number(users[0].c),
    magazines: Number(mags[0].c),
    orders: Number(orders[0].c),
  }
}

/**
 * Orders
 */
export async function placeOrder(userId: string, items: Array<{ magazineId: string; qty: number }>) {
  const sql = getSql()
  const ids = items.map((i) => i.magazineId)
  const mags = await sql<any[]>`
    select id, price, format from magazines where id = any(${ids})
  `
  const fullItems = items.map((it) => {
    const m = mags.find((x) => x.id === it.magazineId)
    if (!m) throw new Error("MAGAZINE_NOT_FOUND")
    return {
      magazineId: it.magazineId,
      qty: it.qty,
      price: Number(m.price),
      format: m.format as "print" | "digital",
    }
  })
  const total = fullItems.reduce((s, i) => s + i.price * i.qty, 0)

  const orderIdRows = await sql<{ id: string }[]>`
    insert into orders (user_id, total) values (${userId}, ${total}) returning id
  `
  const orderId = orderIdRows[0].id

  for (const it of fullItems) {
    await sql`
      insert into order_items (order_id, magazine_id, qty, price, format)
      values (${orderId}, ${it.magazineId}, ${it.qty}, ${it.price}, ${it.format})
    `
  }

  const order = await sql<any[]>`
    select id, user_id as "userId", total, created_at as "createdAt"
    from orders
    where id = ${orderId}
  `
  return { ...order[0], items: fullItems }
}

export async function ordersByUser(userId: string) {
  const sql = getSql()
  const orders = await sql<any[]>`
    select id, user_id as "userId", total, created_at as "createdAt"
    from orders
    where user_id = ${userId}
    order by created_at desc
  `
  for (const o of orders) {
    const items = await sql<any[]>`
      select magazine_id as "magazineId", qty, price, format
      from order_items
      where order_id = ${o.id}
    `
    o.items = items.map((i) => ({ ...i, price: Number(i.price) }))
  }
  return orders
}

export async function downloadsForUser(userId: string) {
  const sql = getSql()
  const rows = await sql<any[]>`
    select oi.magazine_id as "magazineId", o.created_at as "purchasedAt"
    from orders o
    join order_items oi on oi.order_id = o.id
    where o.user_id = ${userId} and oi.format = 'digital'
    order by o.created_at desc
  `
  return rows
}

/**
 * Admin: Users and Sellers
 */
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
