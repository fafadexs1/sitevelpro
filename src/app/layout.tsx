
import type { Metadata, ResolvingMetadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { CanvasBackground } from '@/components/landing/CanvasBackground';
import { Inter } from 'next/font/google';
import { createClient } from '@/utils/supabase/server';
import Script from 'next/script';

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

async function getGoogleAdsSettings() {
    try {
        const supabase = createClient();
        const { data } = await supabase
            .from('google_ads_settings')
            .select('gads_tracking_id, gtm_container_id')
            .single();
        return data;
    } catch (error) {
        console.error("Could not fetch Google Ads settings.");
        return null;
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
  const adsSettings = await getGoogleAdsSettings();

  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        {/* Font links are handled by next/font now */}
        {adsSettings?.gtm_container_id && (
            <Script id="google-tag-manager" strategy="afterInteractive">
                {`
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','${adsSettings.gtm_container_id}');
                `}
            </Script>
        )}
        {adsSettings?.gads_tracking_id && (
            <Script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${adsSettings.gads_tracking_id}`}
                strategy="afterInteractive"
            />
        )}
        {adsSettings?.gads_tracking_id && (
            <Script id="google-ads-init" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${adsSettings.gads_tracking_id}');
                `}
            </Script>
        )}
      </head>
      <body className="font-body antialiased">
        {adsSettings?.gtm_container_id && (
            <noscript>
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${adsSettings.gtm_container_id}`}
                    height="0"
                    width="0"
                    style={{ display: 'none', visibility: 'hidden' }}
                ></iframe>
            </noscript>
        )}
        <CanvasBackground />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
