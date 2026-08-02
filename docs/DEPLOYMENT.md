# Deployment

## Recommended production setup

1. Host the Next.js app (Node 20.19+)
2. Use PostgreSQL instead of SQLite
3. Set strong values for:
   - `DATABASE_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
4. Run migrations and seed carefully (seed contains scaffolding vocabulary)

```bash
npm ci
npx prisma migrate deploy
npm run build
npm run start
```

## Backups

- Export dictionary JSON regularly from `/admin/import-export`
- Back up the PostgreSQL database on a schedule
- Keep media files (images/audio) in durable object storage with the same naming conventions

## Switching SQLite → PostgreSQL

1. Change `provider = "postgresql"` in `prisma/schema.prisma`
2. Install `@prisma/adapter-pg` and `pg`
3. Update `src/lib/db.ts` and `prisma/seed.ts` to use `PrismaPg`
4. Create a new migration against Postgres
5. Import reviewed content

## Security notes

- Never commit real admin passwords
- Keep `/admin` out of search indexes (`robots.ts` already disallows it)
- Prefer inviting editors through controlled credentials or a future Auth.js integration
