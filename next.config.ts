import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: '/marketplace',
        destination: '/search', // or /translators, search is a good general marketplace replacement
        permanent: true,
      },
      {
        source: '/auth/signup',
        destination: '/signup',
        permanent: true,
      },
      {
        source: '/help',
        destination: '/support',
        permanent: true,
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "appwrite.tranzlo.net",
      },
    ],
  },
};

export default nextConfig;
