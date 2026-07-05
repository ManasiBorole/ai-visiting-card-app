import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const revision =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
  process.env.npm_package_version ??
  "v1";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [
    { url: "/offline", revision },
    { url: "/login", revision },
    { url: "/dashboard", revision },
  ],
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(self), microphone=(), geolocation=()",
        },
      ],
    },
  ],
};

export default withSerwist(nextConfig);
