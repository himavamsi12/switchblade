import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Dev-only: lets the dev server's HMR/webpack-hmr requests through when the app is opened via
  // 127.0.0.1 instead of localhost (needed on this machine since another project's dev server
  // binds the IPv6 loopback (::1) on the same port 3000, so "localhost" can resolve to THAT
  // server instead of this one — 127.0.0.1 sidesteps that, but Next's dev server otherwise blocks
  // cross-origin dev requests from any host other than literally "localhost"). No effect in
  // production builds.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  // Payload's media route serves uploads with an ETag but NO Cache-Control at all (verified
  // against the running server). With no caching policy the browser refetches every image in full
  // on every visit — measured as a non-zero transferSize on all ~50 classics images, several of
  // them 1-2MB, which is what made the classics loading screen sit there for 8-10s on EVERY load
  // rather than just the first.
  //
  // Two policies, split on whether the URL carries the ?v= cache buster that
  // lib/payload/syncClassicsCard.ts appends:
  //
  //   with ?v=    The url is version-addressed — v is the media doc's updatedAt, so ANY edit
  //               (including a crop, which rewrites the file at its existing storage key and would
  //               otherwise be invisible) produces a different url. Content behind a given url can
  //               therefore never change, which is exactly what `immutable` promises: cached for a
  //               year with no revalidation request at all.
  //
  //   without ?v= Older rows, synced before that param existed. The same url CAN change content
  //               here, so it can't be immutable — but stale-while-revalidate still makes repeat
  //               visits instant: the cached copy is served immediately for a day while a
  //               revalidation happens in the background, so an edit lands on the following visit.
  //               These upgrade themselves to the immutable policy the moment anything re-syncs
  //               the card.
  async headers() {
    return [
      {
        source: "/api/media/file/:path*",
        has: [{ type: "query", key: "v" }],
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/api/media/file/:path*",
        missing: [{ type: "query", key: "v" }],
        headers: [{ key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default withPayload(nextConfig);
