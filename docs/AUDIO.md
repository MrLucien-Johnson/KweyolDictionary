# Audio contribution guide

## Goal

Learners should hear every word. Prefer native Dominican Kwéyòl recordings. Until those exist, the site can ship **synthetic practice audio** for all entries.

## Current state

1. **Synthetic TTS (shipped for density)**  
   - Generator: `npm run content:tts` (`scripts/generate-tts-audio.py`)  
   - Engine: Microsoft Edge neural TTS via `edge-tts`  
   - Voice: `fr-FR-DeniseNeural` (French approximation — **no Dominican Kwéyòl voice exists**)  
   - Files: `public/audio/{slug}.mp3`  
   - Manifest: `public/audio/tts-manifest.json`  
   - Catalog marks these as `source: "SYNTHETIC_TTS"` and status `PLACEHOLDER`  
   - UI labels them clearly as **not native Dominican Kwéyòl**

2. **Native / recorded audio (preferred)**  
   - Save as `public/audio/{slug}.mp3`  
   - Remove that slug from `tts-manifest.json` (or regenerate TTS only for missing slugs later)  
   - Run `npm run content:publish`  
   - Keep status provisional until a reviewer confirms native pronunciation

3. **Browser speech** remains a last-resort practice aid on word pages.

## Regenerate all synthetic audio

```bash
pip3 install --user edge-tts
npm run content:audio
```

This republishes the catalog, synthesises MP3s for every entry, then republishes so audio metadata is included.

## Important policy

- Synthetic audio is a **learning aid**, not linguistic authority.
- Do **not** mark synthetic files as `CONFIRMED` native audio.
- Community recordings should replace synthetic files over time, starting with featured words.
