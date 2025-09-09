import { createClient } from '@/utils/supabase/server';
import { MetadataRoute } from 'next';

async function getSiteUrl(): Promise<string> {
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  }
  return 'http://localhost:3000';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getSiteUrl();
  const supabase = createClient();

  // 1. Rotas Estáticas
  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/assinar',
    '/cliente',
    '/politica-de-privacidade',
    '/termos-de-uso',
    '/status',
    '/tv'
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    priority: route === '/' ? 1 : 0.8,
  }));

  // 2. Rotas Dinâmicas (Cidades)
  const cityRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: cities, error: citiesError } = await supabase.from('cities').select('slug');
    if (citiesError) throw citiesError;

    const { data: cityRules, error: cityRulesError } = await supabase
      .from('dynamic_seo_rules')
      .select('slug_pattern')
      .eq('allow_indexing', true)
      .like('slug_pattern', '%{cidade}%');
    if (cityRulesError) throw cityRulesError;

    if (cities && cityRules) {
      for (const rule of cityRules) {
        for (const city of cities) {
          const url = `${siteUrl}${rule.slug_pattern.replace('{cidade}', city.slug)}`;
          cityRoutes.push({
            url: url,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    }
  } catch (error) {
    console.error("Sitemap: Erro ao buscar rotas de cidades:", error);
  }


  // 3. Rotas de SEO cadastradas manualmente que NÃO são de cidades
  const manualSeoRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: manualRules, error: manualRulesError } = await supabase
        .from('dynamic_seo_rules')
        .select('slug_pattern')
        .eq('allow_indexing', true)
        .not('slug_pattern', 'like', '%{cidade}%');

    if (manualRulesError) throw manualRulesError;

    if (manualRules) {
        for (const rule of manualRules) {
            manualSeoRoutes.push({
                url: `${siteUrl}${rule.slug_pattern}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.6,
            });
        }
    }
  } catch (error) {
     console.error("Sitemap: Erro ao buscar regras de SEO manuais:", error);
  }
  
  return [
    ...staticRoutes,
    ...cityRoutes,
    ...manualSeoRoutes,
  ];
}
