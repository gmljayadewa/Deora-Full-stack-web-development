import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/blogs", destination: "/blog", permanent: false },
      {
        source: "/blogs/:path*",
        destination: "/blog/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
