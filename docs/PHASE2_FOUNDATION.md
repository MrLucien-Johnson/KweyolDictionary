# Phase 2: Project foundation

**Status:** Complete  
**Stack (confirmed):** Next.js App Router, TypeScript, React, Tailwind CSS, Prisma, SQLite (local) / PostgreSQL (production path), Zod, Vitest, Playwright, ESLint

## Completed in this phase

- Application scaffold with App Router + `src/`
- Design system tokens and homepage composition
- Clear Adult Dictionary / Children’s Dictionary choice (no quiz gate)
- Prisma data model for entries, adult/child presentations, media, quizzes, activities, roles, submissions, audit trail
- Review status constants and public-visibility rules
- Zod validation for dictionary entries and community submissions
- Search normalization helpers (accents / apostrophes)
- Seed script with categories + clearly labelled **DRAFT** demo entries
- Unit tests and Playwright smoke tests
- Setup + language policy documentation

## Files created (high level)

- `src/app/*` — routes, layout, SEO robots/sitemap
- `src/components/*` — header, footer, homepage chooser/search
- `src/lib/*` — db, constants, validation, search helpers
- `prisma/schema.prisma`, `prisma/seed.ts`
- `tests/unit/*`, `tests/e2e/*`
- `docs/SETUP.md`, `docs/LANGUAGE_POLICY.md`, `docs/PHASE2_FOUNDATION.md`

## Validation

Run:

```bash
npm run validate
npm run test:e2e
```

## Known limitations

- Adult dictionary search/browse/word pages are placeholders (Phase 3)
- Grammar, quizzes and flashcards not implemented (Phase 4)
- Children’s illustrated experience not implemented (Phase 5–6)
- Admin auth/RBAC UI not implemented (Phase 7)
- Demo seed entries are **DRAFT** and must not be shown as approved vocabulary
- No verified native audio or final illustrations yet

## Recommended next phase

**Phase 3: Adult dictionary core** — search, A–Z browse, filters, word detail pages, favourites, word of the day using approved (or clearly gated) data.
