import { neon } from "@neondatabase/serverless";

/** True when a Neon (or compatible) Postgres connection string is configured. */
export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

/** Lightweight connectivity check used by /api/health. */
export async function pingDatabase() {
  if (!process.env.DATABASE_URL) {
    return { mode: "demo-data" as const, connected: false };
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`select 1 as ok`;
    return { mode: "postgres" as const, connected: rows[0]?.ok === 1 };
  } catch {
    return { mode: "postgres" as const, connected: false };
  }
}
