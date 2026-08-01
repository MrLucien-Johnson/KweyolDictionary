# Dominican Kwéyòl–English Dictionary Project

**Learn, preserve and celebrate the Kwéyòl language of Dominica.**

This platform will host:

1. An **Adult Dictionary** for learners, speakers, teachers and researchers  
2. A **Children’s Dictionary** with illustrations, audio and age-appropriate activities  

Content is limited to **Dominica’s Kwéyòl** only. See [docs/LANGUAGE_POLICY.md](docs/LANGUAGE_POLICY.md).

## Current status

**Phase 2 (Project foundation) is in progress on this branch.**

Confirmed stack:

- Next.js (App Router) + TypeScript + React  
- Tailwind CSS  
- Prisma + SQLite (local) / PostgreSQL (production path)  
- Zod validation  
- Vitest + Playwright + ESLint  

## Quick start

```bash
cp .env.example .env
npm ci
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run db:validate
npm run build
npm run validate
npm run test:e2e
```

## Documentation

- [docs/SETUP.md](docs/SETUP.md) — local setup and conventions  
- [docs/LANGUAGE_POLICY.md](docs/LANGUAGE_POLICY.md) — Dominica-only policy  
- [docs/PHASE2_FOUNDATION.md](docs/PHASE2_FOUNDATION.md) — Phase 2 summary  
- [docs/PHASE1_REPOSITORY_REVIEW.md](docs/PHASE1_REPOSITORY_REVIEW.md) — Phase 1 assessment (if present)

## Important content rule

Do **not** invent a full dictionary. Demonstration seed entries are marked `DRAFT` and are not approved vocabulary.
