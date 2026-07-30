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
};

export default withPayload(nextConfig);
