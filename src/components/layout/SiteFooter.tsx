import Link from "next/link";
import {
  CONTENT_ACCURACY_SHORT,
  DOMINICA_ONLY_POLICY,
  LANGUAGE_VARIATION_NOTE,
  PROJECT_NAME,
} from "@/lib/content/editorial";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <p className="site-footer__title">{PROJECT_NAME}</p>
          <p className="site-footer__note">{LANGUAGE_VARIATION_NOTE}</p>
          <p className="site-footer__note">{CONTENT_ACCURACY_SHORT}</p>
        </div>
        <nav className="site-footer__nav" aria-label="Footer">
          <Link href="/dictionary">Adult Dictionary</Link>
          <Link href="/children">Children’s Dictionary</Link>
          <Link href="/learn">Grammar & learning</Link>
          <Link href="/contribute">Suggest a word</Link>
          <Link href="/about">About & language policy</Link>
          <Link href="/disclaimer">Content disclaimer</Link>
        </nav>
        <p className="site-footer__policy">{DOMINICA_ONLY_POLICY}</p>
        <p className="site-footer__policy">
          Public learning site is optimised for GitHub Pages. Editorial admin
          tools run in the local Node environment, not on the static host.
          Content is provided as-is for community learning; see the disclaimer.
        </p>
      </div>
    </footer>
  );
}
