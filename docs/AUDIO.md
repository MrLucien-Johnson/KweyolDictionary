# Audio contribution guide

## Goal

Learners should hear every word. Prefer native Dominican Kwéyòl recordings. Until those exist, the site ships **synthetic practice audio** for all entries.

## Current state

1. **Synthetic TTS (default practice set)**  
   - Generator: `npm run content:tts`  
   - Voice: French neural approximation (`fr-FR-DeniseNeural`)  
   - Labelled clearly as **not native Dominican Kwéyòl**

2. **Community verified speech (preferred replacement path)**  
   - Public flow: `/contribute?type=AUDIO&entry={slug}`  
   - Browser **pre-verifies** format, size, duration, playback, and consent checklist  
   - GitHub Pages: download recording + open moderated Issue (attach file)  
   - Local Node: `POST /api/submissions/audio` stores file under `storage/community-audio/`  
   - Maintainers follow `docs/AUDIO_REVIEW.md` before replacing TTS

3. **Browser speech** remains a last-resort practice aid on word pages.

## Replace synthetic audio after meticulous review

```bash
node scripts/accept-community-audio.mjs --slug bonjou --file ./reviewed-recording.webm
npm run content:publish
```

## Regenerate synthetic audio

```bash
pip3 install --user edge-tts
npm run content:audio
```

## Important policy

- Synthetic audio is a learning aid, not linguistic authority.
- Community uploads never go live automatically.
- Do not mark recordings as confirmed native until review is complete.
