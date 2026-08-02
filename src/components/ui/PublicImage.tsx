"use client";

type PublicImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
};

/** Prefixes static asset paths with NEXT_PUBLIC_BASE_PATH for GitHub Pages. */
export function PublicImage({
  src,
  alt,
  width,
  height,
  className,
}: PublicImageProps) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const resolved =
    src.startsWith("http") || src.startsWith(base) || !src.startsWith("/")
      ? src
      : `${base}${src}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
