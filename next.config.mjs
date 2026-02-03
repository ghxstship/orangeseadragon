import { generateNextRedirects } from './src/lib/navigation/redirects.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Pre-existing lint errors should be fixed separately.
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      ...generateNextRedirects(),
      // Any additional redirects
    ];
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/api/v1/:path*",
          destination: "/api/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
