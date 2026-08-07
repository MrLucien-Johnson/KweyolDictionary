import type { Metadata } from "next";
import { Suspense } from "react";
import { NativeAudioPriority } from "@/components/audio/NativeAudioPriority";
import { ContributeFormClient } from "@/components/contribute/ContributeFormClient";
import { ContentAccuracyNotice } from "@/components/layout/ContentAccuracyNotice";
import {
  CONTENT_ACCURACY_SHORT,
  LANGUAGE_VARIATION_NOTE,
} from "@/lib/content/editorial";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Suggest Dominican Kwéyòl words, corrections, native audio and cultural notes for review.",
};

export default function ContributePage() {
  const issuesUrl =
    process.env.NEXT_PUBLIC_CONTRIBUTE_ISSUES_URL ??
    "https://github.com/MrLucien-Johnson/KweyolDictionary/issues/new";

  return (
    <div className="placeholder-page">
      <h1>Contribute</h1>
      <p>
        The highest priority is <strong>native Dominican Kwéyòl recordings</strong>{" "}
        to replace synthetic practice TTS. You can also suggest new words,
        corrections, examples and cultural notes. Speech uses a verified-audio
        flow: your browser pre-checks the recording, you must listen first, and
        editors re-test meticulously before it can replace practice audio.
      </p>
      <ContentAccuracyNotice variant="panel" />
      <NativeAudioPriority limit={16} />
      <p>{LANGUAGE_VARIATION_NOTE}</p>
      <p>{CONTENT_ACCURACY_SHORT}</p>
      <Suspense fallback={<p className="loading-line">Loading form…</p>}>
        <ContributeFormClient issuesUrl={issuesUrl} />
      </Suspense>
    </div>
  );
}
