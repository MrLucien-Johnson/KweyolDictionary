import Link from "next/link";

export default function NotFound() {
  return (
    <div className="placeholder-page not-found-page">
      <p className="not-found-page__eyebrow">Page not found</p>
      <h1>We could not find that page</h1>
      <p className="section-lead">
        The link may be outdated, or the word may not be in the beginner
        curriculum yet. Try search, browse the dictionary, or return home.
      </p>
      <div className="not-found-page__actions">
        <Link href="/dictionary/" className="btn btn--primary btn--md">
          Adult dictionary
        </Link>
        <Link href="/children/" className="btn btn--soft btn--md">
          Children’s dictionary
        </Link>
        <Link href="/practice/" className="btn btn--soft btn--md">
          Practice games
        </Link>
        <Link href="/" className="btn btn--soft btn--md">
          Home
        </Link>
      </div>
    </div>
  );
}
