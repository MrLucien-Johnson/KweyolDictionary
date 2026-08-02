# GitHub Pages deployment

Live URL (project Pages):

`https://mrlucien-johnson.github.io/KweyolDictionary/`

## Prompt followed

See [GITHUB_PAGES_PROMPT.md](./GITHUB_PAGES_PROMPT.md).

## How it works

1. `npm run content:publish` writes approved learning content to `src/data/published/catalog.json`
2. Public pages read that catalog (no runtime database)
3. `npm run build:pages` temporarily excludes `app/api` + `app/admin`, then exports static HTML to `out/`
4. GitHub Actions uploads `out/` to GitHub Pages

## One-time GitHub setting

In the repository **Settings → Pages**:

1. Build and deployment source: **GitHub Actions** (not “Deploy from a branch”)
2. After the workflow runs on `main`, the site is published automatically

## Local preview of the Pages build

```bash
npm run build:pages
npm run start:pages
```

Open `http://localhost:3000/KweyolDictionary/`.

## Security & scalability notes

| Topic | Pages behaviour |
|-------|-----------------|
| Admin CMS | Not deployed to Pages (local/Node only) |
| Secrets | Not embedded in the static bundle |
| Contributions | Open a GitHub Issue for moderation |
| Quiz answers | Not shown on info pages; static scoring can still be inspected in JS |
| Scale | Rebuild publishes new catalog JSON; migrate to Node+Postgres when live editing is required |

## Performance

- Pre-rendered word/lesson/category pages
- Client-side dictionary filters over a compact JSON catalog
- `trailingSlash` + hashed assets for cache-friendly hosting
- Lazy-loaded images via `PublicImage`
