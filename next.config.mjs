/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "blueprint.cyberlogitec.com.vn",
      },
    ],
  },
};

export default nextConfig;
