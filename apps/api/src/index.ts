import { serve } from "@hono/node-server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createApp } from "./app";
import { createRepositories } from "./repositories";
import * as schema from "./schema";
import { seedDemoAccount } from "./seed";

const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET ?? "dev-secret-change-me";

const sql = databaseUrl ? neon(databaseUrl) : null;
const db = sql ? drizzle(sql, { schema }) : null;

async function checkDatabase(): Promise<boolean> {
  if (!sql) return false;
  try {
    await sql`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

const app = createApp({
  checkDatabase,
  repos: createRepositories(
    // @ts-expect-error — the app is dev-first; without DATABASE_URL the routes fail closed.
    db ?? ({} as ReturnType<typeof drizzle>),
  ),
  jwtSecret,
});

const port = Number(process.env.PORT ?? 3000);

async function main() {
  if (db) {
    await seedDemoAccount(createRepositories(db));
  }

  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`ASCENT API listening on http://localhost:${info.port}`);
  });
}

main();
