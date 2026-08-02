#!/usr/bin/env python3
"""Generate provisional synthetic TTS audio for every published dictionary entry.

IMPORTANT: There is no Dominican Kwéyòl neural voice available. This uses a
French neural voice as a rough practice approximation only. It must never be
labelled as verified native Dominican audio.
"""

from __future__ import annotations

import asyncio
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import edge_tts
except ImportError:
    print("edge-tts is required. Install with: pip3 install --user edge-tts", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "src" / "data" / "published" / "catalog.json"
OUT_DIR = ROOT / "public" / "audio"
MANIFEST = OUT_DIR / "tts-manifest.json"

# Closest widely available neural voice for French-lexifier Creole practice.
VOICE = "fr-FR-DeniseNeural"
RATE = "-10%"
MAX_CONCURRENCY = 6


async def synthesize_one(
    sem: asyncio.Semaphore,
    slug: str,
    text: str,
    out_path: Path,
) -> tuple[str, bool, str]:
    async with sem:
        try:
            communicate = edge_tts.Communicate(text=text, voice=VOICE, rate=RATE)
            await communicate.save(str(out_path))
            return slug, True, "ok"
        except Exception as exc:  # noqa: BLE001 - batch job should continue
            return slug, False, str(exc)


async def main() -> int:
    if not CATALOG.exists():
        print(f"Missing catalog: {CATALOG}. Run npm run content:publish first.", file=sys.stderr)
        return 1

    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    entries = catalog.get("entries") or []
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    jobs: list[tuple[str, str, Path]] = []
    for entry in entries:
        slug = entry["slug"]
        text = (entry.get("kweyolWord") or "").strip()
        if not text:
            continue
        jobs.append((slug, text, OUT_DIR / f"{slug}.mp3"))

    print(f"Generating synthetic TTS for {len(jobs)} entries with {VOICE}…")
    sem = asyncio.Semaphore(MAX_CONCURRENCY)
    results = await asyncio.gather(
        *[synthesize_one(sem, slug, text, path) for slug, text, path in jobs]
    )

    files: dict[str, dict[str, object]] = {}
    failures: list[str] = []
    for slug, ok, detail in results:
        text = next(t for s, t, _ in jobs if s == slug)
        path = OUT_DIR / f"{slug}.mp3"
        if ok and path.exists() and path.stat().st_size > 0:
            files[slug] = {
                "text": text,
                "file": f"{slug}.mp3",
                "bytes": path.stat().st_size,
            }
        else:
            failures.append(f"{slug}: {detail}")

    # Retry failures once, serially.
    if failures:
        print(f"Retrying {len(failures)} failures…")
        still_failed: list[str] = []
        for item in failures:
            slug = item.split(":", 1)[0]
            text = next(t for s, t, _ in jobs if s == slug)
            path = OUT_DIR / f"{slug}.mp3"
            _, ok, detail = await synthesize_one(asyncio.Semaphore(1), slug, text, path)
            if ok and path.exists() and path.stat().st_size > 0:
                files[slug] = {
                    "text": text,
                    "file": f"{slug}.mp3",
                    "bytes": path.stat().st_size,
                }
            else:
                still_failed.append(f"{slug}: {detail}")
        failures = still_failed

    manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "generator": "edge-tts",
        "voice": VOICE,
        "rate": RATE,
        "status": "SYNTHETIC",
        "disclaimer": (
            "Synthetic practice audio using a French neural voice. "
            "Not verified native Dominican Kwéyòl pronunciation."
        ),
        "entryCount": len(files),
        "files": files,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    total_bytes = sum(int(item["bytes"]) for item in files.values())
    print(f"Wrote {len(files)} files to {OUT_DIR} ({total_bytes / 1024:.1f} KiB)")
    print(f"Manifest: {MANIFEST}")
    if failures:
        print("Failures:", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
