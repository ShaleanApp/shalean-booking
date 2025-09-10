import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // Configure Turbopack to be more stable
      resolveAlias: {
        // Ensure proper module resolution
        'react': require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
      },
    },
  },
  // Ensure proper module resolution
  resolve: {
    alias: {
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    },
  },
  // Add webpack configuration for better compatibility
  webpack: (config, { isServer, dev }) => {
    if (isServer && dev) {
      // Add fallback for missing runtime modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
