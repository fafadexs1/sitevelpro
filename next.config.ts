
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['embla-carousel-react', 'recharts'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.googleapis.com https://*.googletagmanager.com https://*.google-analytics.com https://*.googleadservices.com https://*.doubleclick.net https://*.facebook.net https://*.facebook.com https://*.twitter.com https://*.ads-twitter.com;",
              "style-src 'self' 'unsafe-inline' https://*.googleapis.com;",
              "img-src 'self' data: blob: https: http:;",
              "connect-src 'self' https://*.google.com https://*.googleapis.com https://*.googletagmanager.com https://*.google-analytics.com https://*.googleadservices.com https://*.doubleclick.net https://*.facebook.com https://*.facebook.net https://*.twitter.com https://*.ads-twitter.com https://bqxdyinyzfxqghyuzsbs.supabase.co wss://bqxdyinyzfxqghyuzsbs.supabase.co;",
              "frame-src 'self' https://*.google.com https://*.googletagmanager.com https://*.facebook.com https://*.facebook.net https://*.twitter.com mobile.twitter.com;",
              "font-src 'self' data: https://*.gstatic.com;"
            ].join(' ').replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  }
};

export default nextConfig;
