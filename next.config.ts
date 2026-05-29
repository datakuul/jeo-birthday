import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats; AVIF first, then WebP.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Vercel Blob (uploaded gallery images)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    deviceSizes: [320, 420, 640, 768, 960, 1080, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 320],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Long cache for immutable optimized image assets.
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
