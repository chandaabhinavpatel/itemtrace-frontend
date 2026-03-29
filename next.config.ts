import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config to acknowledge Turbopack is default in Next.js 16
  turbopack: {},
  // Fix constant recompilation on Windows/OneDrive when using webpack mode
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        // Use polling instead of native file watchers (fixes OneDrive/Windows issues)
        poll: 1000,
        // Reduce CPU usage by adding a delay before rebuilding
        aggregateTimeout: 300,
        // Ignore directories that trigger false recompilations
        ignored: ['**/node_modules/**', '**/.next/**', '**/.git/**'],
      };
    }
    return config;
  },
};

export default nextConfig;
