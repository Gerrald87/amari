import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

type Role = "buyer" | "seller" | "admin"
type SellerStatus = "none" | "pending" | "approved" | "rejected"

async function upsertUser(sql: ReturnType<typeof neon>, name: string, email: string, role: Role, password: string, sellerStatus: SellerStatus) {
  const hash = await bcrypt.hash(password, 10)
  const rows = await sql<{ id: string }[]>`
    insert into users (name, email, role, password_hash, seller_status)
    values (${name}, ${email.toLowerCase()}, ${role}, ${hash}, ${sellerStatus})
    on conflict (email) do update
      set name = excluded.name,
          role = excluded.role,
          password_hash = excluded.password_hash,
          seller_status = excluded.seller_status
    returning id
  `
  return rows[0].id
}

async function ensureMagazine(
  sql: ReturnType<typeof neon>,
  sellerId: string,
  data: {
    name: string
    price: number
    language: string
    country: string
    category: string
    format: "print" | "digital"
    issueDate: string
    summary: string
    coverUrl: string
    tags: string[]
    approved: boolean
  },
) {
  const existing = await sql<{ id: string }[]>`
    select id from magazines where name = ${data.name} and seller_id = ${sellerId} limit 1
  `
  if (existing.length) return existing[0].id
  const ins = await sql<{ id: string }[]>`
    insert into magazines (name, price, language, country, category, format, issue_date, summary, cover_url, rating, reviews_count, seller_id, tags, approved)
    values (
      ${data.name}, ${data.price}, ${data.language}, ${data.country}, ${data.category}, ${data.format},
      ${data.issueDate}, ${data.summary}, ${data.coverUrl}, 4.50, 0, ${sellerId}, ${data.tags}, ${data.approved}
    )
    returning id
  `
  return ins[0].id
}

async function setPages(sql: ReturnType<typeof neon>, magId: string, urls: string[]) {
  await sql`delete from magazine_pages where magazine_id = ${magId}`
  for (let i = 0; i < urls.length; i++) {
    await sql`insert into magazine_pages (magazine_id, idx, url) values (${magId}, ${i + 1}, ${urls[i]})`
  }
}

async function createOrderIfNone(sql: ReturnType<typeof neon>, buyerId: string, items: Array<{ magName: string; qty: number }>) {
  const exists = await sql`select id from orders where user_id = ${buyerId} limit 1`
  if (exists.length) return

  const details = []
  let total = 0
  for (const it of items) {
    const mag = await sql<{ id: string; price: string; format: "print" | "digital" }[]>`
      select id, price::text as price, format from magazines where name = ${it.magName} limit 1
    `
    if (!mag.length) continue
    const priceNum = Number(mag[0].price)
    total += priceNum * it.qty
    details.push({ magazineId: mag[0].id, qty: it.qty, price: priceNum, format: mag[0].format })
  }

  const order = await sql<{ id: string }[]>`insert into orders (user_id, total) values (${buyerId}, ${total}) returning id`
  const orderId = order[0].id
  for (const d of details) {
    await sql`
      insert into order_items (order_id, magazine_id, qty, price, format)
      values (${orderId}, ${d.magazineId}, ${d.qty}, ${d.price}, ${d.format})
    `
  }
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.log("DATABASE_URL is not set. Aborting.")
    return
  }
  const sql = neon(url)

  // Users
  const adminId = await upsertUser(sql, "Admin", "admin@amari.com", "admin", "12345678", "none")
  const sellerId = await upsertUser(sql, "Seller", "seller@amari.com", "seller", "12345678", "approved")
  const buyerId = await upsertUser(sql, "Buyer", "buyer@amari.com", "buyer", "12345678", "none")
  console.log("Seeded users:", { adminId, sellerId, buyerId })

  // Magazines
  const m1 = await ensureMagazine(sql, sellerId, {
    name: "Lagos Style — Summer Edition",
    price: 6.99,
    language: "English",
    country: "Nigeria",
    category: "Fashion",
    format: "digital",
    issueDate: "2025-06-01",
    summary: "Contemporary Nigerian fashion, designers, and street style.",
    coverUrl: "/nigerian-fashion-magazine-cover-vibrant.png",
    tags: ["trending", "editors-pick"],
    approved: true,
  })
  await setPages(sql, m1, ["/fashion-editorial.png", "/designer-feature-layout.png", "/street-style-collage.png"])

  const m2 = await ensureMagazine(sql, sellerId, {
    name: "East Africa Business Review",
    price: 8.5,
    language: "English",
    country: "Kenya",
    category: "Business",
    format: "print",
    issueDate: "2025-05-15",
    summary: "Markets, policy, and enterprise across East Africa.",
    coverUrl: "/placeholder.svg?height=800&width=600",
    tags: ["business"],
    approved: true,
  })
  await setPages(sql, m2, ["/placeholder.svg?height=300&width=220", "/placeholder.svg?height=300&width=220"])

  const m3 = await ensureMagazine(sql, sellerId, {
    name: "Pan-African Culture Quarterly",
    price: 5.0,
    language: "English",
    country: "Ghana",
    category: "Culture",
    format: "digital",
    issueDate: "2025-04-10",
    summary: "Arts, heritage, and contemporary culture narratives.",
    coverUrl: "/placeholder.svg?height=800&width=600",
    tags: ["culture", "editors-pick"],
    approved: true,
  })
  await setPages(sql, m3, ["/placeholder.svg?height=300&width=220", "/placeholder.svg?height=300&width=220"])

  const m4 = await ensureMagazine(sql, sellerId, {
    name: "Sahara Arts & Design",
    price: 7.25,
    language: "French",
    country: "Morocco",
    category: "Arts",
    format: "digital",
    issueDate: "2025-03-20",
    summary: "Visual arts, architecture, and design inspiration.",
    coverUrl: "/placeholder.svg?height=800&width=600",
    tags: ["arts"],
    approved: false, // pending moderation
  })
  await setPages(sql, m4, ["/placeholder.svg?height=300&width=220", "/placeholder.svg?height=300&width=220"])

  console.log("Seeded magazines and pages:", { m1, m2, m3, m4 })

  // Order for buyer
  await createOrderIfNone(sql, buyerId, [
    { magName: "Lagos Style — Summer Edition", qty: 1 },
    { magName: "East Africa Business Review", qty: 2 },
  ])
  console.log("Seeded orders and order_items for buyer.")

  console.log("Done. You can now login:\n- Admin: admin@amari.com / 12345678\n- Seller: seller@amari.com / 12345678\n- Buyer: buyer@amari.com / 12345678")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
