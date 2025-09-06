
import type { Metadata, ResolvingMetadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { CanvasBackground } from '@/components/landing/CanvasBackground';
import { Inter } from 'next/font/google';
import { createClient } from '@/utils/supabase/server';
import { ConversionTracker } from '@/components/analytics/ConversionTracker';
import React from 'react';

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
            .select('id, script_content, placement')
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

const RenderRawHTML = ({ html, ...props }: { html: string } & React.HTMLAttributes<any>) => {
  // Este componente não renderiza um `div` extra. Ele injeta o HTML diretamente.
  // É crucial que o HTML injetado seja válido para a posição em que é inserido.
  // `suppressHydrationWarning` é usado aqui para evitar avisos em casos onde
  // o script injetado modifica o DOM, o que é comum.
  return <React.Fragment {...props} dangerouslySetInnerHTML={{ __html: html }} />;
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tags = await getTrackingTags();
  const headScripts = tags.filter(t => t.placement === 'head_start');
  const bodyStartScripts = tags.filter(t => t.placement === 'body_start');
  const bodyEndScripts = tags.filter(t => t.placement === 'body_end');

  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        {/* Font links are handled by next/font now */}
        {headScripts.map((tag, index) => (
            // A key é importante para o React. Usamos um Fragment para não adicionar nós extras.
            <RenderRawHTML key={`tracking-tag-head-${tag.id}-${index}`} html={tag.script_content} />
        ))}
      </head>
      <body className="font-body antialiased">
         {bodyStartScripts.map((tag, index) => (
            <RenderRawHTML key={`tracking-tag-body-start-${tag.id}-${index}`} html={tag.script_content} />
        ))}
        <ConversionTracker />
        <CanvasBackground />
        {children}
        <Toaster />
         {bodyEndScripts.map((tag, index) => (
            <RenderRawHTML key={`tracking-tag-body-end-${tag.id}-${index}`} html={tag.script_content} />
        ))}
      </body>
    </html>
  );
}
