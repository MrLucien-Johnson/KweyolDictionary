# Content approval tiers and liability stance

## Product decision

Keep the full beginner curriculum **public for learning density**, while labelling it as **provisional** and open to correction. Do not present it as a final linguistic authority.

## Liability / teaching-use stance

- The public site is a **community learning aid**, provided **as-is**.
- Visitors are told not to rely on it as sole or authoritative teaching, assessment, official translation or certified curriculum.
- A dedicated **Content disclaimer** page (`/disclaimer`) states the as-is / no-warranty position.
- Site-wide and page-level notices link to that disclaimer.
- Contributions are encouraged so errors can be corrected.

This is product transparency wording, not a substitute for legal advice in a specific jurisdiction. Project owners who need formal legal review should consult a qualified lawyer.

## Approval tiers (editorial)

| Tier | Status intent | Public? | Examples |
|------|---------------|---------|----------|
| A – Core trust | Keep strong public entries; prioritize audio/review | Yes | Featured greetings/family with real examples |
| B – Beginner curriculum | Public provisional density | Yes | Most of the 300+ seed set |
| C – Needs language check | Prefer human pass soon; may later move to `NEEDS_REVIEW` if risk is high | Yes for now (labelled) | Homonyms, thin/sensitive categories |
| D – Not ready | Fix before treating as trusted meaning | No / draft | Invented or unverified glosses found in review |

## Public visibility rule

Only `APPROVED` entries appear in the published static catalog today. For this product-density phase, curriculum rows are marked `APPROVED` **for product use** while remaining open to correction. Future work may introduce a separate “provisional public” flag without changing density overnight.

## Review priority

1. Homonym groups (`li`, `sé`, `maché`, `wi`, `non`, `pwason`, `jaden`, `bwa`, `jwé`) — examples + related-sense links shipped; still welcome native-speaker confirmation
2. Featured-word native audio (`public/audio/{slug}.mp3`; see `docs/AUDIO.md`)
3. Example-sentence quality pass beyond POS defaults
4. Greetings and everyday conversation
5. Family, numbers, colours, body, food
6. Verbs, school, animals
7. Culture, festivals, religion, proverbs

## Editor rule going forward

Do not mark newly invented content as `APPROVED` without review. Prefer `DRAFT` / `NEEDS_REVIEW` for imports until checked. See `EDITOR_GUIDE.md` and `LANGUAGE_POLICY.md`.

## Admin role enforcement (local Node)

Admin APIs gate writes by session role:

| Action | Allowed roles |
|--------|----------------|
| Edit entries / accept text submissions (as draft) | Owner, Administrator, Editor, Language reviewer |
| Set `APPROVED` / import as approved | Owner, Administrator, Language reviewer |
| Accept audio submissions | Owner, Administrator, Language reviewer, Audio reviewer |

Configure users with `ADMIN_USERS_JSON` (email, password, role) or the legacy single `ADMIN_EMAIL` / `ADMIN_PASSWORD` pair (optional `ADMIN_ROLE`, default `ADMINISTRATOR`).

Accepted **NEW_WORD** / **CORRECTION** / related text submissions apply into the SQLite dictionary as `NEEDS_REVIEW` — never public until an approver sets `APPROVED` and content is published for Pages.
