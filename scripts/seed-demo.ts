import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.log("DATABASE_URL is not set. Skipping DB seeding.")
    return
  }

  const sql = neon(url)
  const password = "12345678"
  const hash = await bcrypt.hash(password, 10)

  async function upsertUser(
    name: string,
    email: string,
    role: "buyer" | "seller" | "admin",
    sellerStatus: "none" | "pending" | "approved" | "rejected" = "none"
  ) {
    await sql`
      insert into users (name, email, role, password_hash, seller_status)
      values (${name}, ${email.toLowerCase()}, ${role}, ${hash}, ${sellerStatus})
      on conflict (email) do update
        set name = excluded.name,
            role = excluded.role,
            password_hash = excluded.password_hash,
            seller_status = excluded.seller_status
    `
    console.log(`Seeded or updated: ${email} (${role}, seller_status=${sellerStatus})`)
  }

  console.log("Seeding demo users...")
  await upsertUser("Admin", "admin@amari.com", "admin", "none")
  await upsertUser("Seller", "seller@amari.com", "seller", "pending")
  await upsertUser("Buyer", "buyer@amari.com", "buyer", "none")
  console.log("Done seeding demo users. Password for all: 12345678")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
