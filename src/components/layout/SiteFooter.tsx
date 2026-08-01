import Link from "next/link";
import {
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
        </div>
        <nav className="site-footer__nav" aria-label="Footer">
          <Link href="/dictionary">Adult Dictionary</Link>
          <Link href="/children">Children’s Dictionary</Link>
          <Link href="/learn">Grammar & learning</Link>
          <Link href="/contribute">Suggest a word</Link>
          <Link href="/about">About & language policy</Link>
        </nav>
        <p className="site-footer__policy">{DOMINICA_ONLY_POLICY}</p>
      </div>
    </footer>
  );
}
