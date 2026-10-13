import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Avatares dos usuários vindos do GitHub
    remotePatterns: [new URL("https://avatars.githubusercontent.com/**")],
  },
};

export default nextConfig;
