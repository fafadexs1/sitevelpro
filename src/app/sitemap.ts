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

  // 2. Rotas Dinâmicas de Cidades (Lógica dedicada e robusta)
  const cityRoutes: MetadataRoute.Sitemap = [];
  const { data: cities, error: citiesError } = await supabase.from('cities').select('slug');

  if (citiesError) {
    console.error("Sitemap: Erro ao buscar cidades", citiesError.message);
  } else if (cities) {
    for (const city of cities) {
      cityRoutes.push({
        url: `${siteUrl}/internet-em/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // 3. Rotas de SEO cadastradas manualmente que NÃO são de cidades
  const manualSeoRoutes: MetadataRoute.Sitemap = [];
  const { data: rules, error: rulesError } = await supabase
    .from('dynamic_seo_rules')
    .select('slug_pattern, allow_indexing')
    .eq('allow_indexing', true);

  if (rulesError) {
      console.error("Sitemap: Erro ao buscar regras de SEO", rulesError.message);
  } else if (rules) {
      for (const rule of rules) {
          // Apenas adiciona regras que não são o padrão de cidade, para não duplicar.
          if (!rule.slug_pattern.includes('{cidade}')) {
              manualSeoRoutes.push({
                  url: `${siteUrl}${rule.slug_pattern}`,
                  lastModified: new Date(),
                  changeFrequency: 'weekly',
                  priority: 0.6,
              })
          }
      }
  }
  
  return [
    ...staticRoutes,
    ...cityRoutes,
    ...manualSeoRoutes,
  ];
}
