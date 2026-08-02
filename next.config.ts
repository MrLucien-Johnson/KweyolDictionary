import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.GITHUB_PAGES_REPO ?? "KweyolDictionary";
const basePath = isGitHubPages ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: `${basePath}/`,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
