import type { Metadata } from "next";
import Link from "next/link";
import {
  CHILDREN_LEARNING_CAVEAT,
  CONTENT_ACCURACY_DISCLAIMER,
  CONTENT_DENSITY_NOTE,
  DOMINICA_ONLY_POLICY,
  LANGUAGE_VARIATION_NOTE,
  NO_PROFESSIONAL_ADVICE_NOTE,
  PROJECT_NAME,
} from "@/lib/content/editorial";

export const metadata: Metadata = {
  title: "Content disclaimer",
  description:
    "As-is learning disclaimer for the Dominican Kwéyòl–English Dictionary.",
};

export default function DisclaimerPage() {
  return (
    <div className="placeholder-page">
      <h1>Content disclaimer</h1>
      <p>
        This page limits reliance on {PROJECT_NAME} so visitors understand the
        material is a provisional community learning aid, not guaranteed
        teaching content.
      </p>

      <h2 className="section-title" style={{ marginTop: "2rem" }}>
        Accuracy and liability
      </h2>
      <p>{CONTENT_ACCURACY_DISCLAIMER}</p>
      <p style={{ marginTop: "1rem" }}>{NO_PROFESSIONAL_ADVICE_NOTE}</p>

      <h2 className="section-title" style={{ marginTop: "2rem" }}>
        Provisional beginner curriculum
      </h2>
      <p>{CONTENT_DENSITY_NOTE}</p>
      <p style={{ marginTop: "1rem" }}>{LANGUAGE_VARIATION_NOTE}</p>

      <h2 className="section-title" style={{ marginTop: "2rem" }}>
        Dominica-only focus
      </h2>
      <p>{DOMINICA_ONLY_POLICY}</p>

      <h2 className="section-title" style={{ marginTop: "2rem" }}>
        Children’s materials
      </h2>
      <p>{CHILDREN_LEARNING_CAVEAT}</p>

      <h2 className="section-title" style={{ marginTop: "2rem" }}>
        How to help correct content
      </h2>
      <p>
        Use{" "}
        <Link href="/contribute">Suggest a contribution</Link> to propose
        corrections, better examples or cultural notes. See also{" "}
        <Link href="/about">About & language policy</Link>.
      </p>

      <p className="section-lead" style={{ marginTop: "2rem" }}>
        This disclaimer is provided for transparency. It is not a substitute for
        advice from a qualified lawyer in your jurisdiction.
      </p>
    </div>
  );
}
