
// app/layout.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import { createClient } from '@/utils/supabase/server';
import React from 'react';
import Script from 'next/script';
import { ConditionalLayoutElements } from '@/components/ConditionalLayoutElements';
import { ChristmasTheme } from '@/components/themes/ChristmasTheme';
import { cn } from '@/lib/utils';

export const revalidate = 0;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// --- Data loaders (server) ---
async function getThemeAndSeoSettings() {
  try {
    const supabase = await createClient();

    // Busca as configurações de SEO globais
    const { data: seoData, error: seoError } = await supabase
      .from('seo_settings')
      .select('site_title, site_description, og_image_url, favicon_url, allow_indexing, updated_at')
      .single();

    if (seoError && seoError.code !== 'PGRST116') {
      console.error('Erro ao buscar seo_settings do Supabase:', seoError);
    }

    // Busca as configurações de tema
    const { data: themeData, error: themeError } = await supabase
      .from('system_settings')
      .select('key, value')
      .eq('key', 'commemorative_theme_enabled');

    if (themeError) {
      console.error('Erro ao buscar theme_settings do Supabase:', themeError);
    }

    const seo = {
      site_title: seoData?.site_title || 'Velpro Telecom',
      site_description: seoData?.site_description || 'Internet ultrarrápida para tudo que importa.',
      og_image_url: seoData?.og_image_url || null,
      favicon_url: seoData?.favicon_url || null,
      allow_indexing: seoData?.allow_indexing ?? true,
      favicon_updated_at: seoData?.updated_at ?? new Date().toISOString(),
    };

    const theme = {
      commemorative_enabled: themeData?.[0]?.value === 'true'
    };

    return { seo, theme };
  } catch (e) {
    console.error("[LOG] Exceção crítica na função getThemeAndSeoSettings:", e);
    return { seo: null, theme: null };
  }
}


// --- Metadata ---
export async function generateMetadata(
  { params }: { params: any },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { seo: settings } = await getThemeAndSeoSettings();
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
  const { seo: settings, theme } = await getThemeAndSeoSettings();

  // Construção da URL do Favicon com cache-busting
  const faviconUrl = settings?.favicon_url
    ? `${settings.favicon_url}?v=${new Date(settings.favicon_updated_at).getTime()}`
    : null;

  return (
    <html lang="pt-BR" className={cn(inter.variable)} suppressHydrationWarning>
      <head>
        {faviconUrl && <link rel="icon" href={faviconUrl} type="image/png" sizes="any" />}
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
        {theme?.commemorative_enabled && <ChristmasTheme />}
        {children}

        <Toaster />
        <ConditionalLayoutElements />
      </body>
    </html>
  );
}
