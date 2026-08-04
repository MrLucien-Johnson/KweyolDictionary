import Link from "next/link";
import { PROJECT_NAME } from "@/lib/content/editorial";

const navItems = [
  { href: "/dictionary", label: "Adult Dictionary" },
  { href: "/children", label: "Children’s Dictionary" },
  { href: "/practice", label: "Practice" },
  { href: "/learn", label: "Learn" },
  { href: "/contribute", label: "Contribute" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-brand">
          <span className="site-brand__mark" aria-hidden="true" />
          <span className="site-brand__text">{PROJECT_NAME}</span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="site-nav__link">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
