# Content expansion — beginner product density

## Decision

Publish a larger **APPROVED beginner curriculum** now so Adult and Children’s journeys feel useful on GitHub Pages.

## Policy

- Focus remains **Dominica’s Kwéyòl**
- Entries are open to community/linguist correction
- Not presented as a final linguistic authority
- Homonyms use distinct slugs (for example `li-bed`, `li-read`)
- Public site carries provisional / as-is notices and a Content disclaimer page
- See `docs/CONTENT_APPROVAL.md` for approval tiers and liability stance

## Current density

Run:

```bash
npm run content:publish
npm run content:report
```

Expect roughly **300+** approved public entries after this expansion.

## How to grow further

1. Add rows to `src/data/beginner-curriculum.ts`
2. `npm run content:publish`
3. Optionally `npm run db:seed` for local admin
4. Merge to `main` to redeploy GitHub Pages
