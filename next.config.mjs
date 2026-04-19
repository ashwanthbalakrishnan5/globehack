/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/hydra-bridge/:path*",
        destination: "http://54.241.236.53:8080/:path*",
      },
    ];
  },
};

export default nextConfig;
