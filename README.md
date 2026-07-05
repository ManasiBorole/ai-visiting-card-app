# Visiting Card AI

Premium AI-powered visiting card management platform built with Next.js 15, React 19, Prisma, and SQLite/PostgreSQL.

## Features

- **Contact CRM** — store, search, categorize, and manage visiting cards
- **OCR upload** — scan cards with Tesseract.js and review extracted fields
- **AI assistant** — duplicate detection, category suggestions, smart search, OCR corrections
- **Import / export** — CSV, Excel, JSON backup, PDF reports
- **PWA** — installable app with offline support and Android APK readiness
- **Auth** — email/password and optional Google OAuth

## Quick start

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
git clone <repository-url>
cd ai-visiting-card-app
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo accounts

| Email | Password |
|-------|----------|
| `demo@visitingcard.ai` | `Password123` |
| `admin@visitingcard.ai` | `Password123` |

## Environment variables

See [`.env.example`](.env.example). Required in production:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite or PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for Auth.js sessions |
| `NEXT_PUBLIC_APP_URL` | Public HTTPS URL of the deployed app |

Optional:

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build with PWA service worker |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run pwa:icons` | Regenerate PWA icons |

## Project structure

```
app/                 Next.js App Router pages and API routes
components/          React UI components
services/            Business logic layer
lib/                 Validations, AI helpers, utilities
database/            Prisma client
prisma/              Schema, migrations, seed
public/              Static assets and PWA icons
storage/             Private uploaded card images (gitignored)
docs/                Extended documentation
```

## Documentation

- [Deployment guide](docs/DEPLOYMENT.md)
- [API reference](docs/API.md)
- [PWA & Android APK](docs/PWA.md)
- [Architecture overview](docs/ARCHITECTURE.md)

## Production checklist

- [ ] Set `AUTH_SECRET` and `NEXT_PUBLIC_APP_URL`
- [ ] Switch `DATABASE_URL` to PostgreSQL
- [ ] Deploy over HTTPS
- [ ] Configure Google OAuth redirect URIs (if used)
- [ ] Run `npm run build && npm start`
- [ ] Set up persistent storage for `storage/uploads/`
- [ ] Update `public/.well-known/assetlinks.json` for Android TWA

## Tech stack

- **Framework:** Next.js 15, React 19, TypeScript
- **UI:** Tailwind CSS v4, shadcn/ui
- **Database:** Prisma 7, SQLite (dev) / PostgreSQL (prod)
- **Auth:** Auth.js (NextAuth v5)
- **PWA:** Serwist
- **OCR:** Tesseract.js
- **Charts:** Recharts

## License

Private — all rights reserved.
