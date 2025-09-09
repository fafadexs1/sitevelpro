import { createClient } from '@/utils/supabase/server';
import { MetadataRoute } from 'next'
 
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

  // 2. Rotas Dinâmicas de Cidades
  const cityRoutes: MetadataRoute.Sitemap = [];
  const { data: cities, error: citiesError } = await supabase.from('cities').select('slug');

  if (citiesError) {
    console.error("Sitemap: Erro ao buscar cidades", citiesError.message);
  } else if (cities) {
    const { data: cityRules, error: cityRulesError } = await supabase
        .from('dynamic_seo_rules')
        .select('slug_pattern')
        .eq('allow_indexing', true)
        .like('slug_pattern', '%{cidade}%');

    if (cityRulesError) {
        console.error("Sitemap: Erro ao buscar regras de SEO para cidades", cityRulesError.message);
    } else if (cityRules) {
        for (const rule of cityRules) {
            for (const city of cities) {
                const url = rule.slug_pattern.replace('{cidade}', city.slug);
                cityRoutes.push({
                    url: `${siteUrl}${url}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
            }
        }
    }
  }

  // 3. Rotas de SEO cadastradas manualmente que NÃO são de cidades
  const manualSeoRoutes: MetadataRoute.Sitemap = [];
  const { data: rules, error: rulesError } = await supabase
    .from('dynamic_seo_rules')
    .select('slug_pattern')
    .eq('allow_indexing', true)
    .not('slug_pattern', 'like', '%{cidade}%');

  if (rulesError) {
      console.error("Sitemap: Erro ao buscar regras de SEO manuais", rulesError.message);
  } else if (rules) {
      for (const rule of rules) {
        manualSeoRoutes.push({
            url: `${siteUrl}${rule.slug_pattern}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        })
      }
  }
  
  return [
    ...staticRoutes,
    ...cityRoutes,
    ...manualSeoRoutes,
  ];
}
