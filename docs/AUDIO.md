# Audio contribution guide

## Goal

Learners should hear every word. Prefer native Dominican Kwéyòl recordings. Until those exist, the site ships **synthetic practice audio** for all entries.

## Current state

Today the public catalog still uses **synthetic TTS** for every entry (French neural approximation). There are **no** confirmed native Dominican recordings in the published set yet. The product path below collects, reviews, and prefers community speech as it arrives.

1. **Synthetic TTS (default practice set)**  
   - Generator: `npm run content:tts`  
   - Voice: French neural approximation (`fr-FR-DeniseNeural`)  
   - Labelled clearly as **not native Dominican Kwéyòl**  
   - Regeneration **skips** MP3s that are not listed in `public/audio/tts-manifest.json` so community installs are never overwritten

2. **Community verified speech (preferred replacement path)**  
   - Public flow: `/contribute?type=AUDIO&entry={slug}`  
   - Browser **pre-verifies** format, size, duration, playback, and consent checklist  
   - GitHub Pages: download recording + open moderated Issue (attach file)  
   - Local Node: `POST /api/submissions/audio` stores file under `storage/community-audio/`  
   - Maintainers follow `docs/AUDIO_REVIEW.md` before replacing TTS  
   - Home and Contribute pages list **featured priority words** still waiting for native audio

3. **Playback preference**  
   - Runtime helpers in `src/lib/audio/pick.ts` prefer `RECORDED` over `SYNTHETIC_TTS`  
   - Word cards and pronunciation UI label practice TTS vs community audio honestly

4. **Browser speech** remains a last-resort practice aid on word pages.

## Featured recording priority

Featured dictionary words without a community recording appear first on:

- Home → “Help record native audio”
- Contribute → same priority list (longer)

Speakers should start there; editors still review every upload.

## Replace synthetic audio after meticulous review

```bash
npm run content:accept-audio -- --slug bonjou --file ./reviewed-recording.webm
npm run content:publish
```

Accepting an AUDIO submission in `/admin/submissions` (after the listened checkbox) runs the same install path. Accepted audio:

- writes `public/audio/{slug}.mp3`
- removes the slug from `tts-manifest.json`
- publishes as source `RECORDED` with status `PLACEHOLDER` (provisional — not `CONFIRMED` native)

## Regenerate synthetic audio

```bash
pip3 install --user edge-tts
npm run content:audio
```

Community/recorded files (absent from the TTS manifest) are left untouched.

## Important policy

- Synthetic audio is a learning aid, not linguistic authority.
- Community uploads never go live automatically.
- Do not mark recordings as confirmed native until review is complete.
- Do not invent or fabricate “native” audio files in the repository.
