import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Avatares dos usuários vindos do GitHub (ex.: /u/123?v=4).
      // `search` omitido de propósito: o GitHub sempre adiciona ?v=N na URL.
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
    ],
  },
};

export default nextConfig;
