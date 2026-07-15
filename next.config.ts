import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const assetPrefix = isGitHubPages ? "/pizza-ratto" : "";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  assetPrefix,
  trailingSlash: isGitHubPages,
  images: { unoptimized: isGitHubPages },
};

export default nextConfig;
