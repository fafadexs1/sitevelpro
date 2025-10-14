
// app/layout.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import { createClient } from '@/utils/supabase/server';
import React from 'react';
import Script from 'next/script';
import { ConditionalLayoutElements } from '@/components/ConditionalLayoutElements';
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
        const supabase = createClient();
        const { data, error } = await supabase
            .from('system_settings')
            .select('key, value, updated_at');

        if (error) {
            console.error('Erro ao buscar configurações de SEO/Tema do Supabase:', error);
            return { seo: null, theme: null };
        }
        
        const settingsMap = new Map(data?.map(item => [item.key, { value: item.value, updatedAt: item.updated_at }]));

        const getSetting = (key: string) => settingsMap.get(key);

        const seo = {
            site_title: getSetting('site_title')?.value || 'Velpro Telecom',
            site_description: getSetting('site_description')?.value || 'Internet ultrarrápida para tudo que importa.',
            og_image_url: getSetting('og_image_url')?.value || null,
            favicon_url: getSetting('favicon_url')?.value || null,
            allow_indexing: getSetting('allow_indexing')?.value !== 'false',
            favicon_updated_at: getSetting('favicon_url')?.updatedAt ?? new Date().toISOString(),
        };

        const theme = {
            commemorative_enabled: getSetting('commemorative_theme_enabled')?.value === 'true'
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
    <html lang="pt-BR" className={cn(inter.variable, theme?.commemorative_enabled && "theme-halloween")} suppressHydrationWarning>
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
