/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Bunny CDN — primary image storage
      {
        protocol: "https",
        hostname: "thefrogs.b-cdn.net",
      },
      // Bunny CDN wildcard for any zone subdomains
      {
        protocol: "https",
        hostname: "*.b-cdn.net",
      },
      // Bunny Storage direct
      {
        protocol: "https",
        hostname: "storage.bunnycdn.com",
      },
      // UploadThing (fallback, if any older assets exist)
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
export default nextConfig;

