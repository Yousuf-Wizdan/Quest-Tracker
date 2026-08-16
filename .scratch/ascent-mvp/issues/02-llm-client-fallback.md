# 02 — LLM client + deterministic fallback

**What to build:** A server-side LLM client that talks to the OpenAI-compatible endpoint, plus deterministic template fallbacks so the app still works when the model is down, slow, or returns garbage.

**Blocked by:** 01 — Monorepo scaffold + health tracer bullet

**Status:** ready-for-agent

- [ ] Client calls the configured OpenAI-compatible base URL and model
- [ ] Requests time out and surface a failure signal rather than hanging
- [ ] "Why this?" and System Message templates render when the LLM fails
- [ ] Tests use a mocked transport and cover success, timeout, and malformed-response paths
- [ ] LLM base URL and model string are backend-only env vars
