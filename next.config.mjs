/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["blueprint.cyberlogitec.com.vn"],
    remotePatterns: [
      {
        hostname: "blueprint.cyberlogitec.com.vn",
      },
    ],
  },
};

export default nextConfig;
