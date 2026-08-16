import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { checkDatabase } from "./db";

const app = createApp({ checkDatabase });
const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`ASCENT API listening on http://localhost:${info.port}`);
});
