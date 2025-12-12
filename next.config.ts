
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'velpro.net.br',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bqxdyinyzfxqghyuzsbs.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cmsassets.rgpub.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 't2.tudocdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '4kwallpapers.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'velpro.net.br',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gamtelecom.com.br',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.glbimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.claro.com.br',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
    ],
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
              "img-src 'self' data: https://*.google.com https://*.googleapis.com https://*.googletagmanager.com https://*.google-analytics.com https://*.googleadservices.com https://*.doubleclick.net https://*.facebook.com https://*.facebook.net https://*.twitter.com https://*.ads-twitter.com https://placehold.co https://picsum.photos https://velpro.net.br https://bqxdyinyzfxqghyuzsbs.supabase.co https://cmsassets.rgpub.io https://t2.tudocdn.net https://4kwallpapers.com https://i0.wp.com https://gamtelecom.com.br https://s3.glbimg.com https://www.claro.com.br https://upload.wikimedia.org https://image.tmdb.org;",
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
