/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    // Bunny CDN already serves images from edge nodes globally.
    // Next.js on-demand optimization adds cold-start latency (500ms–2s per image)
    // because it must fetch from CDN, convert, cache on the VPS — hurting real users.
    // All other perf gains (fonts, CSS animations, lazy loading, RAF throttle) are preserved.
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
export default nextConfig;


