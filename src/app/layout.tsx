// app/layout.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import { createClient } from '@/utils/supabase/server';
import { ConversionTracker } from '@/components/analytics/ConversionTracker';
import React from 'react';
import Script from 'next/script';
import { cookies } from 'next/headers';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';
import { VisitTracker } from '@/components/analytics/VisitTracker';
import { EventTracker } from '@/components/analytics/EventTracker';
import { FloatingWhatsApp } from '@/components/landing/FloatingWhatsApp';

export const revalidate = 0;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

type TrackingTag = {
  id: string | number;
  script_content: string;
  placement: 'head_start' | 'body_start' | 'body_end';
};

// --- Data loaders (server) ---
async function getSeoSettings() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('seo_settings')
      .select('site_title, site_description, og_image_url, favicon_url, updated_at')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
        console.error('Erro ao buscar SEO settings do Supabase:', error);
        return null;
    }
    
    return data;
  } catch(e) {
    console.error("[LOG] Exceção crítica na função getSeoSettings:", e);
    return null;
  }
}

async function getTrackingTags(): Promise<TrackingTag[]> {
  try {
    cookies();
    const supabase = createClient();
    const { data } = await supabase
      .from('tracking_tags')
      .select('id, script_content, placement')
      .eq('is_active', true);
    return (data ?? []) as TrackingTag[];
  } catch {
    console.error("Could not fetch tracking tags.");
    return [];
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
  };
}

// Helper para sanitizar o conteúdo de scripts para o next/script
const sanitizeScriptContent = (content: string): string => {
    // Remove <script> e </script> tags, mas mantém o conteúdo
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    return scriptMatch ? scriptMatch[1] : '';
};

// Helper para renderizar noscript tags de forma segura
const TrackingNoScript = ({ tags }: { tags: TrackingTag[] }) => {
    return (
        <>
            {tags.map((tag, index) => {
                const noScriptMatch = tag.script_content.match(/<noscript>([\s\S]*?)<\/noscript>/);
                if (!noScriptMatch) return null;
                return (
                 <noscript
                    key={`noscript-${tag.id}-${index}`}
                    dangerouslySetInnerHTML={{ __html: noScriptMatch[1] }}
                 />
                )
            })}
        </>
    );
};


// Helper para renderizar scripts com next/script
function TrackingScripts({
  tags,
  position,
}: {
  tags: TrackingTag[];
  position: 'head_start' | 'body_end';
}) {
  const strategy = position === 'body_end' ? 'afterInteractive' : 'beforeInteractive';
  
  return (
    <>
      {tags
        .filter(t => t.placement === position)
        .map((tag, index) => (
            <Script
              id={`tracking-tag-${position}-${tag.id}-${index}`}
              key={`script-${position}-${tag.id}-${index}`}
              strategy={strategy}
              dangerouslySetInnerHTML={{ __html: sanitizeScriptContent(tag.script_content) }}
            />
        ))}
    </>
  );
}


export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const allTags = await getTrackingTags();
  const settings = await getSeoSettings();

  const headScripts = allTags.filter(t => t.placement === 'head_start');
  const bodyStartNoScripts = allTags.filter(t => t.placement === 'body_start');
  const bodyEndScripts = allTags.filter(t => t.placement === 'body_end');

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
        {/* Fontes via next/font */}
        <TrackingScripts tags={headScripts} position="head_start" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <TrackingNoScript tags={bodyStartNoScripts} />
        
        {children}
        <FloatingWhatsApp />

        <Toaster />
        <ConsentBanner />
        <VisitTracker />
        <EventTracker />
        <ConversionTracker />
        <TrackingScripts tags={bodyEndScripts} position="body_end" />
      </body>
    </html>
  );
}
