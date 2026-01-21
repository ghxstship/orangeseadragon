/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Pre-existing lint errors should be fixed separately.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
