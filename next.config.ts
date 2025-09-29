
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
      }
    ],
  },
  transpilePackages: ['embla-carousel-react', 'recharts'],
  // Desabilitar o prefetching globalmente
  // O prefetch ainda ocorrerá no hover
  prefetch: false,
};

export default nextConfig;
