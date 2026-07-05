# Deployment Guide

## Recommended production stack

| Component | Recommendation |
|-----------|----------------|
| Hosting | Vercel, Railway, Fly.io, or Docker on VPS |
| Database | PostgreSQL 15+ |
| File storage | Persistent volume for `storage/uploads/` or S3-compatible object storage |
| TLS | Required for PWA install and OAuth |

## Environment setup

1. Copy `.env.example` to `.env.production` (or platform env vars).
2. Generate `AUTH_SECRET`:

   ```bash
   openssl rand -base64 32
   ```

3. Set production values:

   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/visitingcard"
   AUTH_SECRET="your-generated-secret"
   NEXT_PUBLIC_APP_URL="https://your-domain.com"
   ```

4. For Google OAuth, add authorized redirect URI:
   `https://your-domain.com/api/auth/callback/google`

## Database migration

### SQLite → PostgreSQL

1. Update `prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```

2. Update `database/client.ts` to use `@prisma/adapter-pg` instead of SQLite adapter.
3. Run migrations:

   ```bash
   npm run db:migrate
   npm run db:seed   # optional, dev/demo only
   ```

## Build and run

```bash
npm ci
npm run build
npm start
```

The app listens on port 3000 by default. Set `PORT` if your platform requires it.

## File uploads

Card images are stored in `storage/uploads/cards/{userId}/` (not publicly accessible). They are served through authenticated API routes at `/api/uploads/cards/{userId}/{filename}`.

Ensure the `storage/` directory is on persistent disk. For horizontal scaling, migrate to object storage and update `services/upload.service.ts`.

## Security headers

Security headers are configured in `next.config.ts`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` for camera (OCR upload)

## Rate limiting

Registration is rate-limited to 5 attempts per IP per 15 minutes (`lib/api/rate-limit.ts`). For production at scale, replace the in-memory limiter with Redis.

## Monitoring

Recommended additions for production:

- Error tracking (Sentry)
- Uptime monitoring
- Database backups
- Log aggregation

## Docker (optional)

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

Mount volumes for:

- `/app/storage/uploads`
- PostgreSQL data (external service recommended)

## Vercel notes

- SQLite is not suitable for Vercel serverless — use PostgreSQL (Neon, Supabase, etc.)
- Upload storage must use external blob storage or a mounted volume on a Node server
- Set all env vars in the Vercel dashboard

## Post-deploy verification

1. Login with demo or new account
2. Upload a card image — confirm it loads on contact detail
3. Check `/manifest.webmanifest` returns valid JSON
4. Run production build locally and verify service worker registers
5. Test backup/export from Settings
