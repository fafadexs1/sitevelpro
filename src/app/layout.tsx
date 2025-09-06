import type { Metadata, ResolvingMetadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { CanvasBackground } from '@/components/landing/CanvasBackground';
import { Inter } from 'next/font/google';
import { createClient } from '@/utils/supabase/server';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// This function fetches SEO data from Supabase
async function getSeoSettings() {
  const supabase = createClient();
  const { data } = await supabase
    .from('seo_settings')
    .select('site_title, site_description, og_image_url')
    .single();
  return data;
}

export async function generateMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const settings = await getSeoSettings();
  const previousImages = (await parent).openGraph?.images || [];

  const title = settings?.site_title || 'Velpro Telecom';
  const description = settings?.site_description || 'Internet ultrarrápida para tudo que importa.';
  const ogImage = settings?.og_image_url || null;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        {/* Font links are handled by next/font now */}
      </head>
      <body className="font-body antialiased">
        <CanvasBackground />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
