/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Allows the build to succeed even with TypeScript errors
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
