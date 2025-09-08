
import { createClient } from '@/utils/supabase/server';
import { MetadataRoute } from 'next';
import { cookies } from 'next/headers';

async function getSiteUrl(): Promise<string> {
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
        return siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
    }
    // Fallback se a variável de ambiente não estiver definida
    return 'http://localhost:3000';
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  // A chamada a cookies() força a renderização dinâmica, desabilitando o cache.
  cookies();
  const supabase = createClient();
  const { data } = await supabase
    .from('seo_settings')
    .select('allow_indexing')
    .single();

  const allowIndexing = data?.allow_indexing ?? true;

  if (!allowIndexing) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  const siteUrl = await getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

