# Cloud-first architecture with a thin backend proxy

ASCENT's source of truth is Neon Postgres reached through a Hono API on Vercel, rather than the local-first SQLite store a mobile app would normally use. The Expo app is a thin client; it never holds database credentials or the LLM key.

Chosen because the product also needs a multi-user account system and a hosted OpenAI-compatible LLM. Embedding Neon/LLM credentials in the app binary would be extractable and insecure, and a shared cloud Postgres makes multi-user data isolation natural. Rejected local-first because it would have meant a sync engine plus a backend anyway, with the LLM secrets still server-side.
