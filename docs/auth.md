# Auth

- Passwords are hashed with bcryptjs (salt rounds 10) — plaintext comparison is gone, seed data rehashed
- Auth is stateless JWT in an httpOnly, SameSite=Lax cookie (30-day expiry, configurable via JWT_EXPIRY_DAYS)
- CSRF protection via csrf-csrf (double-submit cookie), wired globally with a bootstrap endpoint the client calls at boot
- Rate limiting on login (10/15min) and signup (5/hr)
- Password hashes never leave the server in API responses
- helmet, env-driven CORS, .env-based secrets (with fail-fast in production)
