
import type {NextConfig} from 'next';

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

};

export default nextConfig;
