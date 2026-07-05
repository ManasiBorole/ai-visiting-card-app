# Architecture Overview

## High-level design

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js App │────▶│   Prisma    │
│  (PWA/SW)   │◀────│  App Router  │◀────│  SQLite/PG  │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────┴───────┐
                    │   Services   │
                    │  (business)  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         lib/ai/     lib/validations  storage/
         lib/ocr/                        uploads/
```

## Layers

### Presentation (`app/`, `components/`)

- **App Router** pages grouped by marketing, auth, and dashboard
- **Client components** for forms, search, upload, and interactive UI
- **Server components** for data fetching on dashboard pages

### API (`app/api/`)

Thin route handlers that:

1. Authenticate via `auth()`
2. Validate input with Zod
3. Delegate to services
4. Return consistent JSON responses via `lib/api/error-response.ts`

### Services (`services/`)

Business logic isolated from HTTP concerns:

- `visiting-card.service.ts` — CRUD
- `category.service.ts` — per-user categories
- `search.service.ts` — advanced search
- `ai.service.ts` — heuristic AI features
- `upload.service.ts` — private file storage
- `settings.service.ts` — profile, backup, account deletion

### Domain logic (`lib/`)

- `lib/ai/` — duplicate detection, category suggestion, smart search
- `lib/validations/` — Zod schemas shared by API and forms
- `lib/security/` — file magic-byte validation

## Authentication

Auth.js v5 with JWT sessions (`auth.config.ts`). Middleware protects dashboard page routes. API routes perform per-request session checks.

Providers:

- **Credentials** — bcrypt password verification
- **Google OAuth** — optional when env vars are set

## Data model

| Model | Scope | Notes |
|-------|-------|-------|
| User | Global | Owns cards, categories, activity logs |
| Category | Per user | Unique name per user |
| VisitingCard | Per user | Optional category, JSON tags |
| ActivityLog | Per user | Audit trail |

## File storage

Images saved to `storage/uploads/cards/{userId}/` with magic-byte validation. Served via authenticated `/api/uploads/cards/[userId]/[filename]`. Legacy public paths are redirected in the client via `lib/images.ts`.

## PWA

Serwist generates `public/sw.js` at build time. Service worker caches static assets and provides offline fallback at `/offline`. Manifest at `/manifest.webmanifest`.

## Performance patterns

- Dynamic import of Recharts on dashboard
- Debounced AI analysis hook
- Parallel Prisma queries in dashboard stats
- OCR loaded via dynamic import in client

## Known limitations

- In-memory rate limiting (single-instance only)
- SQLite for development (not for production multi-instance)
- AI features are rule-based heuristics, not external LLM calls
- Duplicate scan is O(n²) — acceptable for typical contact libraries

## Extension points

| Need | Where to extend |
|------|-----------------|
| External LLM | Replace `lib/ai/` functions or add API calls in `ai.service.ts` |
| S3 uploads | Update `upload.service.ts` |
| Redis rate limits | Replace `lib/api/rate-limit.ts` |
| Email verification | Use `emailVerified` field + verification flow |
| Multi-tenant admin | Add role field to User model |
