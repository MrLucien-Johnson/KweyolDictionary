import Link from "next/link";
import {
  countNativeAudioProgress,
  listFeaturedNeedingNativeAudio,
} from "@/lib/audio/native-priority";

type NativeAudioPriorityProps = {
  limit?: number;
  variant?: "panel" | "compact";
};

export function NativeAudioPriority({
  limit = 12,
  variant = "panel",
}: NativeAudioPriorityProps) {
  const priority = listFeaturedNeedingNativeAudio(limit);
  const progress = countNativeAudioProgress();

  if (!priority.length && progress.recorded === progress.total) {
    return (
      <section className="native-audio-priority" aria-labelledby="native-audio-title">
        <h2 id="native-audio-title" className="section-title">
          Native Dominican audio
        </h2>
        <p className="section-lead">
          Every public entry currently has a community or reviewed recording in
          place of synthetic practice audio. Thank you.
        </p>
      </section>
    );
  }

  return (
    <section
      className={
        variant === "compact"
          ? "native-audio-priority native-audio-priority--compact"
          : "native-audio-priority"
      }
      aria-labelledby="native-audio-title"
    >
      <h2 id="native-audio-title" className="section-title">
        Help record native audio
      </h2>
      <p className="section-lead">
        All dictionary playback today uses synthetic practice TTS (a French
        neural approximation). It is <strong>not</strong> native Dominican
        Kwéyòl. Speakers can record priority words below; editors review every
        upload before it replaces TTS.
      </p>
      <p className="native-audio-priority__stats">
        {progress.recorded} community recording
        {progress.recorded === 1 ? "" : "s"} live · {progress.synthetic} still
        on practice TTS · {progress.featuredNeedingNative} featured words waiting
      </p>
      {priority.length ? (
        <ul className="native-audio-priority__list">
          {priority.map((item) => (
            <li key={item.slug}>
              <div>
                <Link href={`/dictionary/${item.slug}`}>{item.kweyolWord}</Link>
                <span className="native-audio-priority__english">
                  {" "}
                  — {item.englishTranslation}
                </span>
                {item.featured ? (
                  <span className="meta-pill">Featured priority</span>
                ) : null}
              </div>
              <Link
                href={item.contributeHref}
                className="btn btn--primary btn--sm"
              >
                Record this word
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="native-audio-priority__more">
        <Link href="/contribute?type=AUDIO">Open the verified speech flow</Link>
        {" · "}
        <Link href="/dictionary/">Browse all words</Link>
      </p>
    </section>
  );
}
