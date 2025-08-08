import { neon } from "@neondatabase/serverless"

// Reusable Neon SQL client for the whole app.
// Throws if no database URL is configured, making DB a hard requirement.
let _sql: ReturnType<typeof neon> | null = null

export function getSql() {
  if (_sql) return _sql
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL_NO_SSL

  if (!url) {
    throw new Error(
      "NO_DB_URL: A Postgres connection string is required. Set DATABASE_URL (or POSTGRES_URL) to your database."
    )
  }

  _sql = neon(url)
  return _sql
}
