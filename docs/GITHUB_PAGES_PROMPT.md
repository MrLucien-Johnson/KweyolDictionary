# Prompt: Deploy Kwéyòl Dictionary to GitHub Pages

Follow this prompt exactly.

## Goal

Publish the Dominican Kwéyòl–English Dictionary as a fast, polished, secure-enough, scalable **static site** on GitHub Pages at:

`https://mrlucien-johnson.github.io/KweyolDictionary/`

## Constraints (must respect)

GitHub Pages is **static hosting only**:

- No Node server at runtime
- No Prisma / SQLite / Postgres at runtime
- No Next.js Route Handlers (`app/api/*`) in the Pages build
- No cookie-based admin auth on Pages
- Project site requires `basePath` `/KweyolDictionary`

## Product requirements on Pages

### Must work on Pages
1. Homepage with Adult / Children’s choice, search entry, Word of the Day
2. Adult dictionary browse, search, filters, A–Z, word detail pages
3. Favourites via `localStorage`
4. Children’s categories, word cards, activities, local progress/rewards
5. Grammar lessons + flashcards + quizzes
6. Contribute path that does **not** require a server API (GitHub Issue link)
7. About / language policy
8. Strong UI/UX, mobile-first, accessible focus states, reduced motion
9. Good performance: static HTML/CSS/JS, compressed assets, minimal client JS for search
10. SEO: titles, descriptions, sitemap where practical under basePath

### Must not claim on Pages
- Live admin CMS
- Server-side quiz answer secrecy (static bundles can be inspected)
- Live moderated submissions inbox

Admin remains available for **local / future Node hosting** only. On Pages, show a clear “editorial tools run locally” note.

## Architecture to implement

1. **Build-time content pipeline**
   - Generate `src/data/published/*.json` from seed/approved content
   - Public pages read this static store (no runtime DB)

2. **Static export mode**
   - `GITHUB_PAGES=true` → `output: 'export'`, `basePath`, `assetPrefix`, `images.unoptimized`
   - Exclude `app/api` and `app/admin` from the Pages build
   - `generateStaticParams` for all word/lesson/activity/category slugs

3. **Client dictionary UX**
   - Keep generous spacing, brand-first homepage, Nature Island visual system
   - Search/filter work client-side over published JSON for snappy UX
   - Preserve empty/loading/unavailable audio states

4. **Security where needed**
   - No secrets in client bundles
   - Admin credentials never used in Pages build
   - Contribute via GitHub Issues (no open write API on static host)
   - Quiz answer keys not rendered on informational pages
   - Dependabot-friendly lockfile; no committed `.env`

5. **Performance**
   - Static HTML per word page
   - Small published JSON; lazy client search module
   - SVG placeholders already compressed
   - Cache-friendly hashed assets from Next export

6. **Scalability**
   - Content store interface that can later swap to remote API/Postgres without rewriting UI
   - CI builds from source of truth each deploy
   - Document path to move off Pages to Node+Postgres when editorial scale requires it

## Delivery checklist

- [x] Static content export script
- [x] Query layer supports static store
- [x] Pages next.config + prepare/restore scripts excluding API/admin
- [x] Client-ready dictionary/favourites/contribute
- [x] `generateStaticParams` for dynamic routes
- [x] GitHub Actions → GitHub Pages deploy
- [x] Docs: setup URL, basePath, limitations, local admin still works
- [x] `npm run build:pages` succeeds
- [x] Validate lint/typecheck/unit tests still pass
- [ ] Commit, push, open/update PR
- [ ] Repo owner switches Pages source to **GitHub Actions**

## Success criteria

A visitor on GitHub Pages can complete Adult and Child learning journeys with excellent UI/UX, without server APIs, while the repo remains ready to scale to a database-backed host later.
