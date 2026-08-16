import { neon } from "@neondatabase/serverless";

export async function checkDatabase(): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return false;
  }

  try {
    const sql = neon(url);
    await sql`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
