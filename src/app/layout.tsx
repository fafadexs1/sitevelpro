

import type { Metadata, ResolvingMetadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { CanvasBackground } from '@/components/landing/CanvasBackground';
import { Inter } from 'next/font/google';
import { createClient } from '@/utils/supabase/server';
import Script from 'next/script';
import { ConversionTracker } from '@/components/analytics/ConversionTracker';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// This function fetches SEO data from Supabase
async function getSeoSettings() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('seo_settings')
      .select('site_title, site_description, og_image_url, favicon_url')
      .single();
    return data;
  } catch (error) {
    console.error("Could not fetch SEO settings, maybe the table does not exist or is empty.");
    return null;
  }
}

async function getTrackingTags() {
    try {
        const supabase = createClient();
        const { data } = await supabase
            .from('tracking_tags')
            .select('script_content, placement')
            .eq('is_active', true);
        return data || [];
    } catch (error) {
        console.error("Could not fetch tracking tags.");
        return [];
    }
}


export async function generateMetadata(
  { params }: { params: any },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const settings = await getSeoSettings();
  const previousImages = (await parent).openGraph?.images || [];

  const title = settings?.site_title || 'Velpro Telecom';
  const description = settings?.site_description || 'Internet ultrarrápida para tudo que importa.';
  const ogImage = settings?.og_image_url || null;
  const faviconUrl = settings?.favicon_url || '/favicon.ico';

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description: description,
    icons: {
        icon: faviconUrl,
    },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tags = await getTrackingTags();
  const headScripts = tags.filter(t => t.placement === 'head_start').map(t => t.script_content);
  const bodyStartScripts = tags.filter(t => t.placement === 'body_start').map(t => t.script_content);
  const bodyEndScripts = tags.filter(t => t.placement === 'body_end').map(t => t.script_content);

  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        {/* Font links are handled by next/font now */}
        {headScripts.map((script, index) => (
            <Script id={`tracking-tag-head-${index}`} strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: script }} />
        ))}
      </head>
      <body className="font-body antialiased">
         {bodyStartScripts.map((script, index) => (
            <Script id={`tracking-tag-body-start-${index}`} strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: script }} />
        ))}
        <ConversionTracker />
        <CanvasBackground />
        {children}
        <Toaster />
         {bodyEndScripts.map((script, index) => (
            <Script id={`tracking-tag-body-end-${index}`} strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: script }} />
        ))}
      </body>
    </html>
  );
}
