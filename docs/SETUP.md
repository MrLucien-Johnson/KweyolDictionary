# Local setup

## Requirements

- Node.js 20.19+ (22 recommended)
- npm 10+

## Quick start

```bash
cp .env.example .env
npm ci
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example`.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite file URL for local demo, or PostgreSQL URL in production |
| `NEXT_PUBLIC_SITE_URL` | Canonical site origin for SEO metadata |

## Database

Phase 2 uses **SQLite** locally via Prisma + `@prisma/adapter-better-sqlite3`.

Production should use **PostgreSQL**:

1. Change `provider = "postgresql"` in `prisma/schema.prisma`
2. Install `@prisma/adapter-pg` and `pg`
3. Update `src/lib/db.ts` to use the PostgreSQL adapter
4. Set `DATABASE_URL` to your Postgres connection string
5. Run migrations

## Useful commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run db:validate
npm run db:seed
npm run content:report
npm run validate
```

## Admin (local)

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in `.env`, then visit `/admin/login`.

## Image naming convention

`{category}-{kweyol-slug}-{audienceTag}-{entryShortId}.webp`

Example: `animals-chat-kid-0042.webp`

## Audio naming convention

Preferred static Pages path:

`public/audio/{entry-slug}.mp3`

Example: `public/audio/bonjou.mp3`

Legacy/admin style:

`{kweyol-slug}-{audienceTag}-{entryShortId}.mp3`

Example: `bonjou-kid-0042.mp3`

Do not label audio as verified native pronunciation unless it has been reviewed. See `docs/AUDIO.md`.
