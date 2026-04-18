import type { NextConfig } from "next";

const isStatic = process.env.NEXT_STATIC === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Mode "démo GitHub Pages" — export HTML/CSS/JS statiques
  ...(isStatic && {
    output: "export",
    basePath: "/Testglcuisine",
    assetPrefix: "/Testglcuisine",
    images: { unoptimized: true },
    trailingSlash: true,
  }),
};

export default nextConfig;
