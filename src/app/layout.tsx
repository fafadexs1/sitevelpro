
// app/layout.tsx (ou app/(site)/layout.tsx)
import type { Metadata, ResolvingMetadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { CanvasBackground } from '@/components/landing/CanvasBackground';
import { Inter } from 'next/font/google';
import { createClient } from '@/utils/supabase/server';
import { ConversionTracker } from '@/components/analytics/ConversionTracker';
import React from 'react';
import Script from 'next/script';

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
    const { data } = await supabase
      .from('seo_settings')
      .select('site_title, site_description, og_image_url, favicon_url')
      .single();
    return data as {
      site_title?: string | null;
      site_description?: string | null;
      og_image_url?: string | null;
      favicon_url?: string | null;
    } | null;
  } catch {
    console.error("Could not fetch SEO settings, maybe the table does not exist or is empty.");
    return null;
  }
}

async function getTrackingTags(): Promise<TrackingTag[]> {
  try {
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
  const faviconUrl = settings?.favicon_url || '/favicon.ico';

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    icons: {
      icon: faviconUrl,
    },
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

// --- Helper: render tracking scripts with next/script ---
function TrackingScripts({
  tags,
  position,
}: {
  tags: TrackingTag[];
  position: 'head_start' | 'body_start' | 'body_end';
}) {
  // Estratégias:
  // - head_start / body_start: beforeInteractive (carrega antes da hidratação)
  // - body_end: afterInteractive (após hidratação)
  return (
    <>
      {tags
        .filter(t => t.placement === position)
        .map((tag) => {
          const id = `tracking-tag-${position}-${tag.id}`;
          const strategy = position === 'body_end' ? 'afterInteractive' : 'beforeInteractive';
          return (
            <Script
              id={id}
              key={id}
              strategy={strategy as any}
              dangerouslySetInnerHTML={{ __html: tag.script_content }}
            />
          );
        })}
    </>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const tags = await getTrackingTags();
  const headScripts = tags.filter(t => t.placement === 'head_start');
  const bodyStartScripts = tags.filter(t => t.placement === 'body_start');
  const bodyEndScripts = tags.filter(t => t.placement === 'body_end');

  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        {/* Fontes via next/font */}
        {/* Tracking no início do head */}
        <TrackingScripts tags={headScripts} position="head_start" />
      </head>
      {/* Algumas extensões/sdks injetam atributos no body antes do React -> silenciamos diferenças */}
      <body className="font-body antialiased" suppressHydrationWarning>
        {/* Tracking logo no início do body, antes da hidratação */}
        <TrackingScripts tags={bodyStartScripts} position="body_start" />

        {/* Seus componentes cliente. Certifique-se de que efeitos/Date.now()/Math.random()
            só rodem dentro de useEffect ou usando refs para evitar conteúdo não determinístico no SSR */}
        <ConversionTracker />
        <CanvasBackground />

        {children}
        <Toaster />

        {/* Tracking no final do body, após a hidratação */}
        <TrackingScripts tags={bodyEndScripts} position="body_end" />
      </body>
    </html>
  );
}
