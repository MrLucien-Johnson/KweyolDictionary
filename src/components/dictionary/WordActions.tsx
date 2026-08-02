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
      <button
        type="button"
        className="btn btn--soft btn--md"
        onClick={() => {
          const next = toggleFavouriteSlug(slug);
          setSaved(next.includes(slug));
          setStatus(next.includes(slug) ? "Saved to favourites" : "Removed from favourites");
        }}
        aria-pressed={saved}
      >
        {saved ? "Saved" : "Save to favourites"}
      </button>
      <button
        type="button"
        className="btn btn--soft btn--md"
        onClick={async () => {
          const text = `${kweyolWord} — ${englishTranslation}`;
          await navigator.clipboard.writeText(text);
          setStatus("Copied");
        }}
      >
        Copy word
      </button>
      <button
        type="button"
        className="btn btn--soft btn--md"
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
      <a className="btn btn--soft btn--md" href={`/contribute?entry=${slug}&type=CORRECTION`}>
        Report an error
      </a>
      <a
        className="btn btn--soft btn--md"
        href={`/contribute?entry=${slug}&type=AUDIO&word=${encodeURIComponent(kweyolWord)}&english=${encodeURIComponent(englishTranslation)}`}
      >
        Contribute speech
      </a>
      <button
        type="button"
        className="btn btn--soft btn--md"
        onClick={() => window.print()}
      >
        Print-friendly view
      </button>
      {status ? (
        <p className="word-actions__status" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
    </div>
  );
}
