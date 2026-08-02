import type { Metadata } from "next";
import Link from "next/link";
import {
  CONTENT_ACCURACY_DISCLAIMER,
  CONTENT_DENSITY_NOTE,
  DOMINICA_ONLY_POLICY,
  LANGUAGE_VARIATION_NOTE,
  MISSION_STATEMENT,
  NO_PROFESSIONAL_ADVICE_NOTE,
  PROJECT_NAME,
} from "@/lib/content/editorial";

export const metadata: Metadata = {
  title: "About & language policy",
  description: "About the Dominican Kwéyòl–English Dictionary Project.",
};

export default function AboutPage() {
  return (
    <div className="placeholder-page">
      <h1>About {PROJECT_NAME}</h1>
      <p>{MISSION_STATEMENT}</p>

      <h2 className="section-title" style={{ marginTop: "2rem" }}>
        Language policy
      </h2>
      <p>{DOMINICA_ONLY_POLICY}</p>

      <h2 className="section-title" style={{ marginTop: "2rem" }}>
        Provisional beginner curriculum
      </h2>
      <p>{CONTENT_DENSITY_NOTE}</p>
      <p style={{ marginTop: "1rem" }}>{LANGUAGE_VARIATION_NOTE}</p>

      <h2 className="section-title" style={{ marginTop: "2rem" }}>
        Accuracy, teaching use and liability
      </h2>
      <p>{CONTENT_ACCURACY_DISCLAIMER}</p>
      <p style={{ marginTop: "1rem" }}>{NO_PROFESSIONAL_ADVICE_NOTE}</p>
      <p style={{ marginTop: "1rem" }}>
        Full wording: <Link href="/disclaimer">Content disclaimer</Link>.
        Corrections: <Link href="/contribute">Suggest a contribution</Link>.
      </p>
    </div>
  );
}
