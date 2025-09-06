import { createClient } from '@/utils/supabase/server';
import { MetadataRoute } from 'next';

export default async function robots(): Promise<MetadataRoute.Robots> {
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
