# Audio contribution guide

## Goal

Add native Dominican Kwéyòl pronunciation, starting with featured words.

## Current state

- Recorded files are optional.
- If `public/audio/{slug}.mp3` exists, the static catalog includes it as `PLACEHOLDER`.
- Word pages also offer **browser speech practice**, clearly labelled as **not** native Dominican audio.
- Missing audio stays honest: “Native Dominican audio not recorded yet.”

## Add a recording

1. Record a clear MP3 of the headword (and optionally a short example later).
2. Save as `public/audio/{slug}.mp3` (see `public/audio/README.md`).
3. Run `npm run content:publish`.
4. Redeploy / merge to `main` for GitHub Pages.
5. Keep status provisional until a language reviewer confirms the recording.

## Featured priority list

Start with greetings, family, common nouns and culture terms marked `isFeatured` in the beginner curriculum (for example `bonjou`, `maman`, `dlo`, `Dominik`, `Kwéyòl`).
