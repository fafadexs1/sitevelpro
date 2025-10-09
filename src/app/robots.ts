
import { createClient } from '@/utils/supabase/server';
import { MetadataRoute } from 'next';
import { cookies, headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
  // A chamada a cookies() força a renderização dinâmica, desabilitando o cache.
  cookies();
  const supabase = createClient();
  const { data } = await supabase
    .from('seo_settings')
    .select('allow_indexing')
    .single();

  const allowIndexing = data?.allow_indexing ?? true;

  const baseRules = {
    userAgent: '*',
    disallow: ['/cliente/', '/admin/', '/colaborador/'],
  };

  if (!allowIndexing) {
    return {
      rules: [
        baseRules,
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }
  
  const headersList = headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';
  const siteUrl = `${protocol}://${host}`;

  return {
    rules: [
      baseRules,
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
