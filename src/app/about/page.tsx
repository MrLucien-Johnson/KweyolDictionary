import type { Metadata } from "next";
import {
  DOMINICA_ONLY_POLICY,
  LANGUAGE_VARIATION_NOTE,
  MISSION_STATEMENT,
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
        Editorial note
      </h2>
      <p>{LANGUAGE_VARIATION_NOTE}</p>
    </div>
  );
}
