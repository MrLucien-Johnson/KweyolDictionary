# Native audio review checklist

Community speech can replace synthetic practice TTS **only after** submitter pre-verification and maintainer re-testing.

## Public contribute flow

1. Contributor opens `/contribute?type=AUDIO&entry={slug}`
2. Records or uploads audio
3. Browser pre-checks:
   - allowed format
   - size under 5 MB
   - duration roughly 0.35–12 seconds
   - playback completed
   - all consent / authenticity checkboxes ticked
4. On GitHub Pages: file downloads + moderated GitHub Issue opens (attach file)
5. On local Node: file is stored under `storage/community-audio/` and queued as `CommunitySubmission` (`AUDIO`, `PENDING`)

Nothing from this flow publishes directly to the live dictionary.

## Maintainer meticulous review

Before accepting a recording:

- [ ] Open the attached / stored file and listen end-to-end
- [ ] Confirm it matches the intended entry slug and sense (especially homonyms)
- [ ] Confirm it sounds like natural Dominican Kwéyòl, not French TTS / AI / browser speech
- [ ] Check clarity: noise, clipping, rushed speech, wrong word
- [ ] Confirm submitter checklist / consent looks complete
- [ ] Prefer a second listener for featured words when possible

## Install after review

### Local admin (preferred)

1. Open `/admin/submissions`
2. Confirm you listened (checkbox)
3. **Accept** — installs `public/audio/{slug}.mp3`, removes the slug from `tts-manifest.json`, upserts a `PLACEHOLDER` `AudioAsset`
4. Run `npm run content:publish`
5. Deploy / merge only after the meticulous review checklist passes

### CLI

```bash
npm run content:accept-audio -- --slug bonjou --file ./path/to/recording.webm
npm run content:publish
```

This:

- writes `public/audio/{slug}.mp3`
- removes the slug from `tts-manifest.json` so catalog source becomes `RECORDED`
- does **not** auto-mark native confirmation

Then redeploy Pages / merge to `main`.

## Status rules

| State | Meaning |
|-------|---------|
| Synthetic TTS | Practice only; labelled not native |
| Recorded + `PLACEHOLDER` | Community/reviewed file installed; still provisional |
| `CONFIRMED` / verified native | Only after explicit human verification policy is applied later |

Reject and ask for a re-record when unsure. Prefer no replacement over a bad replacement.
