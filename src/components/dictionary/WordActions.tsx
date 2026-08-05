"use client";

import { useEffect, useState } from "react";
import {
  getFavouriteSlugs,
  toggleFavouriteSlug,
} from "@/lib/favourites/storage";

type WordActionsProps = {
  slug: string;
  kweyolWord: string;
  englishTranslation: string;
};

export function WordActions({
  slug,
  kweyolWord,
  englishTranslation,
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
        <button
          type="button"
          className="btn btn--primary btn--md"
          onClick={() => {
            const next = toggleFavouriteSlug(slug);
            setSaved(next.includes(slug));
            setStatus(
              next.includes(slug)
                ? "Saved to favourites"
                : "Removed from favourites",
            );
          }}
          aria-pressed={saved}
        >
          {saved ? "Saved to favourites" : "Save to favourites"}
        </button>
        <a
          className="btn btn--soft btn--md"
          href={`/contribute?entry=${slug}&type=AUDIO&word=${encodeURIComponent(kweyolWord)}&english=${encodeURIComponent(englishTranslation)}`}
        >
          Contribute speech
        </a>
      </div>
      <div className="word-actions__secondary" aria-label="More actions">
        <button
          type="button"
          className="btn btn--soft btn--sm"
          onClick={async () => {
            const text = `${kweyolWord} — ${englishTranslation}`;
            await navigator.clipboard.writeText(text);
            setStatus("Copied");
          }}
        >
          Copy
        </button>
        <button
          type="button"
          className="btn btn--soft btn--sm"
          onClick={async () => {
            const url = window.location.href;
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
