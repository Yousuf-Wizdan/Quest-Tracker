# 06 — Auth + demo account

**What to build:** Email/password signup and login with JWT access and refresh tokens, plus a seeded demo account whose credentials are visible on the login screen.

**Blocked by:** 05 — Database schema + repositories

**Status:** complete

- [x] Signup creates a user and skips email verification for the MVP
- [x] Login returns a JWT access token and refresh token
- [x] Refresh flow issues new tokens without a password
- [x] Basic per-IP rate limiting protects auth and LLM routes
- [x] Demo account `demo@ascent.app` / `demo1234` is seeded with Yousuf's profile data (LV 27, 8,420 XP, attributes)
- [x] Mobile login/signup screen works end to end and shows the demo credentials
