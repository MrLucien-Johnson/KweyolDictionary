import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "soft";
  size?: "md" | "lg";
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`btn btn--${variant} btn--${size}`}
    >
      {children}
    </Link>
  );
}
