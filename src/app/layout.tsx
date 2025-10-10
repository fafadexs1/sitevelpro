
// app/layout.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import { createClient } from '@/utils/supabase/server';
import React from 'react';
import Script from 'next/script';
import { ConditionalLayoutElements } from '@/components/ConditionalLayoutElements';

export const revalidate = 0;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// --- Data loaders (server) ---
async function getSeoSettings() {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('seo_settings')
            .select('site_title, site_description, og_image_url, favicon_url, updated_at, allow_indexing')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Erro ao buscar SEO settings do Supabase:', error);
            return null;
        }
        return data;
    } catch (e) {
        console.error("[LOG] Exceção crítica na função getSeoSettings:", e);
        return null;
    }
}

// --- Metadata ---
export async function generateMetadata(
  { params }: { params: any },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const settings = await getSeoSettings();
  const previousImages = (await parent).openGraph?.images || [];

  const title = settings?.site_title || 'Velpro Telecom';
  const description = settings?.site_description || 'Internet ultrarrápida para tudo que importa.';
  const ogImage = settings?.og_image_url || null;
  const allowIndexing = settings?.allow_indexing ?? true;

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
     robots: {
      index: allowIndexing,
      follow: allowIndexing,
      googleBot: {
        index: allowIndexing,
        follow: allowIndexing,
      },
    },
  };
}


export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSeoSettings();

  // Construção da URL do Favicon com cache-busting
  const faviconUrl = settings?.favicon_url 
    ? `${settings.favicon_url}?v=${new Date(settings.updated_at ?? Date.now()).getTime()}` 
    : null; // Se não houver favicon no DB, não renderiza nada.

  return (
    <html lang="pt-BR" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        {faviconUrl && <link rel="icon" href={faviconUrl} type="image/png" />}
        <Script id="google-consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'analytics_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'wait_for_update': 500
            });
          `}
        </Script>
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        {children}

        <Toaster />
        <ConditionalLayoutElements />
      </body>
    </html>
  );
}
