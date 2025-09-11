import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Turbopack configuration (updated for Next.js 15)
  turbopack: {
    resolveAlias: {
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    },
  },

  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Production optimizations
    if (!dev) {
      // Enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Optimize chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    // Server-side fallbacks and client-side code handling
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        // Prevent client-side globals from being used on server
        'serviceworker': false,
      };
    }

    // Handle client-side specific modules
    config.resolve.alias = {
      ...config.resolve.alias,
      // Prevent server-side execution of client-only modules
      '@/lib/push-notifications': isServer ? false : '@/lib/push-notifications',
    };

    // Configure web-push and paystack for server-side usage
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'web-push': 'commonjs web-push',
        '@paystack/inline-js': 'commonjs @paystack/inline-js',
      });
      
      // Add webpack plugin to define global variables for server builds
      const webpack = require('webpack');
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.DefinePlugin({
          'typeof self': JSON.stringify('undefined'),
          'typeof window': JSON.stringify('undefined'),
          'typeof global': JSON.stringify('undefined'),
          'self': 'undefined',
          'window': 'undefined',
        })
      );
    }

    return config;
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // External packages for server components
  serverExternalPackages: ['sharp'],
  
  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
