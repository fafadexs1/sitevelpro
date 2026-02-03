
// app/layout.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import React from 'react';
import Script from 'next/script';
import { ConditionalLayoutElements } from '@/components/ConditionalLayoutElements';
import { ChristmasTheme } from '@/components/themes/ChristmasTheme';
import { cn } from '@/lib/utils';
import { getLayoutData } from '@/lib/data/get-layout-data';

export const revalidate = 0;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// --- Metadata ---
export async function generateMetadata(
  { params }: { params: any },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { seo: settings } = await getLayoutData();
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
  const { seo: settings, commemorativeThemeEnabled, tags, domainType, popups, conversionEvents } = await getLayoutData();

  // Construção da URL do Favicon com cache-busting
  const faviconUrl = settings?.favicon_url
    ? `${settings.favicon_url}?v=${settings.updated_at ? new Date(settings.updated_at).getTime() : new Date().getTime()}`
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
        {commemorativeThemeEnabled && <ChristmasTheme />}
        {children}

        <Toaster />
        <ConditionalLayoutElements domainType={domainType} tags={tags} popups={popups} conversionEvents={conversionEvents} />
      </body>
    </html>
  );
}
