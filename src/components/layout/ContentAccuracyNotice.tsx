import Link from "next/link";
import {
  CHILDREN_LEARNING_CAVEAT,
  CONTENT_ACCURACY_SHORT,
  PROVISIONAL_CURRICULUM_BANNER,
} from "@/lib/content/editorial";

type ContentAccuracyNoticeProps = {
  /** Use a shorter children’s caveat on kids’ journeys. */
  audience?: "general" | "children";
  /** Compact single-line strip under the header. */
  variant?: "banner" | "panel";
};

export function ContentAccuracyNotice({
  audience = "general",
  variant = "banner",
}: ContentAccuracyNoticeProps) {
  const lead =
    audience === "children"
      ? CHILDREN_LEARNING_CAVEAT
      : PROVISIONAL_CURRICULUM_BANNER;
  const detail =
    audience === "children" ? CHILDREN_LEARNING_CAVEAT : CONTENT_ACCURACY_SHORT;

  if (variant === "banner") {
    return (
      <aside className="content-notice content-notice--banner" role="note">
        <p>
          <span className="content-notice__label">Please note</span>
          {lead}{" "}
          <Link href="/disclaimer">Content disclaimer</Link>
        </p>
      </aside>
    );
  }

  return (
    <aside className="content-notice content-notice--panel" role="note">
      <p>
        <span className="content-notice__label">Learning aid · as-is</span>
        {detail}{" "}
        <Link href="/disclaimer">Read the full disclaimer</Link>
      </p>
    </aside>
  );
}
