# Dominican Kwéyòl–English Dictionary Project

**Learn, preserve and celebrate the Kwéyòl language of Dominica.**

Public GitHub Pages site:

**https://mrlucien-johnson.github.io/KweyolDictionary/**

## Quick start (local)

```bash
cp .env.example .env
npm ci
npx prisma migrate deploy
npm run db:seed
npm run content:publish
npm run dev
```

## GitHub Pages

```bash
npm run build:pages
npm run start:pages
# http://localhost:3000/KweyolDictionary/
```

Deployment is automated by `.github/workflows/deploy-github-pages.yml` on `main`.

Set Pages source to **GitHub Actions** in repository settings.

Details: [docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md) · Prompt: [docs/GITHUB_PAGES_PROMPT.md](docs/GITHUB_PAGES_PROMPT.md)

## Validation

```bash
npm run validate
npm run test:e2e
```

## Documentation

- [docs/SETUP.md](docs/SETUP.md)
- [docs/EDITOR_GUIDE.md](docs/EDITOR_GUIDE.md)
- [docs/LANGUAGE_POLICY.md](docs/LANGUAGE_POLICY.md)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md)

## Notes

- Dominica’s Kwéyòl only
- Public Pages build is static (no runtime admin/API)
- Local Node mode still includes admin tools for editors
- Beginner curriculum currently publishes **300+ approved entries** for product density; still open to community correction
- See [docs/CONTENT_EXPANSION.md](docs/CONTENT_EXPANSION.md) and [docs/CONTENT_COVERAGE.md](docs/CONTENT_COVERAGE.md)
