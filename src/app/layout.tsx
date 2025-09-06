
// app/layout.tsx
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

// --- Helper: Sanitize GTM script content for Next/Script ---
const sanitizeScriptContent = (content: string): string => {
    // Remove <script> and </script> tags, but keep the content
    return content.replace(/<script[^>]*>|<\/script>/g, '');
};

// --- Helper: Render noscript tags safely ---
const TrackingNoScript = ({ tags }: { tags: TrackingTag[] }) => {
    return (
        <>
            {tags.map((tag, index) => (
                 <noscript
                    key={`noscript-${tag.id}-${index}`}
                    dangerouslySetInnerHTML={{ __html: tag.script_content }}
                 />
            ))}
        </>
    );
};

// --- Helper: Render standard scripts with next/script ---
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
  
  const headScripts = allTags.filter(t => t.placement === 'head_start');
  const bodyStartNoScripts = allTags.filter(t => t.placement === 'body_start');
  const bodyEndScripts = allTags.filter(t => t.placement === 'body_end');

  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        {/* Fontes via next/font */}
        <TrackingScripts tags={headScripts} position="head_start" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <TrackingNoScript tags={bodyStartNoScripts} />
        
        <ConversionTracker />
        <CanvasBackground />

        {children}
        <Toaster />

        <TrackingScripts tags={bodyEndScripts} position="body_end" />
      </body>
    </html>
  );
}
