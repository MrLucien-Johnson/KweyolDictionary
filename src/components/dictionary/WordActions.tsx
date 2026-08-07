"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getFavouriteSlugs,
  toggleFavouriteSlug,
} from "@/lib/favourites/storage";

type WordActionsProps = {
  slug: string;
  kweyolWord: string;
  englishTranslation: string;
  needsNativeAudio?: boolean;
};

export function WordActions({
  slug,
  kweyolWord,
  englishTranslation,
  needsNativeAudio = false,
}: WordActionsProps) {
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSaved(getFavouriteSlugs().includes(slug));
    });
    return () => cancelAnimationFrame(frame);
  }, [slug]);

  return (
    <div className="word-actions">
      <div className="word-actions__primary">
        {needsNativeAudio ? (
          <a
            className="btn btn--primary btn--md"
            href={`/contribute?entry=${slug}&type=AUDIO&word=${encodeURIComponent(kweyolWord)}&english=${encodeURIComponent(englishTranslation)}`}
          >
            Record native audio
          </a>
        ) : null}
        <button
          type="button"
          className={
            needsNativeAudio ? "btn btn--soft btn--md" : "btn btn--primary btn--md"
          }
          onClick={() => {
            const next = toggleFavouriteSlug(slug);
            const isSaved = next.includes(slug);
            setSaved(isSaved);
            setStatus(
              isSaved ? "Saved to favourites" : "Removed from favourites",
            );
          }}
          aria-pressed={saved}
        >
          {saved ? "Saved to favourites" : "Save to favourites"}
        </button>
        {!needsNativeAudio ? (
          <a
            className="btn btn--soft btn--md"
            href={`/contribute?entry=${slug}&type=AUDIO&word=${encodeURIComponent(kweyolWord)}&english=${encodeURIComponent(englishTranslation)}`}
          >
            Contribute speech
          </a>
        ) : null}
      </div>
      {saved ? (
        <p className="word-actions__hint">
          <Link href="/dictionary/favourites">Open favourites</Link>
          {" · "}
          <Link href="/learn/flashcards?deck=favourites">Study flashcards</Link>
        </p>
      ) : null}
      <div className="word-actions__secondary" aria-label="More actions">
        <button
          type="button"
          className="btn btn--soft btn--sm"
          onClick={async () => {
            const text = `${kweyolWord} — ${englishTranslation}`;
            try {
              await navigator.clipboard.writeText(text);
              setStatus("Copied");
            } catch {
              setStatus("Could not copy — try selecting the text instead");
            }
          }}
        >
          Copy
        </button>
        <button
          type="button"
          className="btn btn--soft btn--sm"
          onClick={async () => {
            const url = window.location.href;
            try {
              if (navigator.share) {
                await navigator.share({
                  title: kweyolWord,
                  text: `${kweyolWord} — ${englishTranslation}`,
                  url,
                });
                setStatus("Shared");
                return;
              }
              await navigator.clipboard.writeText(url);
              setStatus("Link copied");
            } catch (error) {
              if (error instanceof DOMException && error.name === "AbortError") {
                setStatus(null);
                return;
              }
              try {
                await navigator.clipboard.writeText(url);
                setStatus("Link copied");
              } catch {
                setStatus("Could not share from this browser");
              }
            }
          }}
        >
          Share
        </button>
        <button
          type="button"
          className="btn btn--soft btn--sm"
          onClick={() => window.print()}
        >
          Print
        </button>
        <a
          className="btn btn--soft btn--sm"
          href={`/contribute?entry=${slug}&type=CORRECTION`}
        >
          Report error
        </a>
      </div>
      {status ? (
        <p className="word-actions__status" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
    </div>
  );
}
