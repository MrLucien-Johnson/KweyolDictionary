# Dominican Kwéyòl–English Dictionary Project

**Learn, preserve and celebrate the Kwéyòl language of Dominica.**

A professional educational platform with:

1. **Adult Dictionary** — search, browse, word pages, grammar, flashcards and quizzes  
2. **Children’s Dictionary** — illustrated categories, listen controls, activities and local rewards  
3. **Admin area** — entry management, media reports, moderation, import/export  

Content is limited to **Dominica’s Kwéyòl** only. See [docs/LANGUAGE_POLICY.md](docs/LANGUAGE_POLICY.md).

## Quick start

```bash
cp .env.example .env
npm ci
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Default local admin (change before sharing):

- URL: `/admin/login`
- Email / password from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)

## Validation

```bash
npm run validate
npm run test:e2e
npm run content:report
```

## Documentation

- [docs/SETUP.md](docs/SETUP.md)
- [docs/EDITOR_GUIDE.md](docs/EDITOR_GUIDE.md)
- [docs/LANGUAGE_POLICY.md](docs/LANGUAGE_POLICY.md)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [docs/CONTENT_COVERAGE.md](docs/CONTENT_COVERAGE.md)
- [docs/PHASES_3_TO_10.md](docs/PHASES_3_TO_10.md)

## Important content rule

Scaffolding vocabulary exists for product journeys and is open to community correction. Draft entries stay hidden from the public dictionary. Do not treat the seed set as a complete linguistic authority.
