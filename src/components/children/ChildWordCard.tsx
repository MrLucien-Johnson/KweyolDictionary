"use client";

import Link from "next/link";
import { AudioButton } from "@/components/dictionary/AudioButton";
import { PublicImage } from "@/components/ui/PublicImage";
import {
  loadChildProgress,
  markListened,
  saveChildProgress,
} from "@/lib/progress/child-progress";

type ChildWordCardProps = {
  slug: string;
  kweyolWord: string;
  meaning: string;
  imageSrc?: string | null;
  imageStatus?: string | null;
  audioSrc?: string | null;
  audioIsSynthetic?: boolean;
};

export function ChildWordCard({
  slug,
  kweyolWord,
  meaning,
  imageSrc,
  imageStatus,
  audioSrc,
  audioIsSynthetic = false,
}: ChildWordCardProps) {
  return (
    <article className="child-word-card">
      <Link href={`/children/words/${slug}`} className="child-word-card__media">
        <PublicImage
          src={imageSrc ?? "/images/placeholders/default.svg"}
          alt={
            imageStatus === "CONFIRMED"
              ? `Illustration for ${kweyolWord}`
              : `Placeholder illustration for ${kweyolWord}`
          }
          width={220}
          height={220}
        />
        {imageStatus === "PLACEHOLDER" ? (
          <span className="media-flag">Placeholder image</span>
        ) : null}
        {imageStatus === "MISSING" || !imageSrc ? (
          <span className="media-flag">Image coming soon</span>
        ) : null}
      </Link>
      <h3>
        <Link href={`/children/words/${slug}`}>{kweyolWord}</Link>
      </h3>
      <p>{meaning}</p>
      <AudioButton
        src={audioSrc}
        label={audioIsSynthetic ? "Practice sound" : "Listen"}
        large
        onPlay={() => {
          const next = markListened(loadChildProgress(), slug);
          saveChildProgress(next);
        }}
      />
      {audioSrc && audioIsSynthetic ? (
        <p className="child-word-card__audio-note">
          Practice sound only — not native Kwéyòl yet.
        </p>
      ) : null}
    </article>
  );
}
