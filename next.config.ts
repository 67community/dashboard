import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  allowedDevOrigins: ["*.loca.lt", "*.ngrok.io", "*.ngrok-free.app"],
};

export default nextConfig;
