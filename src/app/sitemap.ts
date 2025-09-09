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

  const dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const { data: allRules, error: rulesError } = await supabase
        .from('dynamic_seo_rules')
        .select('slug_pattern, allow_indexing')
        .eq('allow_indexing', true);

    if (rulesError) throw rulesError;

    if (allRules) {
        const rulesWithVariable = allRules.filter(rule => rule.slug_pattern.includes('{cidade}'));
        const rulesWithoutVariable = allRules.filter(rule => !rule.slug_pattern.includes('{'));

        // Processa regras que dependem da tabela de cidades
        if (rulesWithVariable.length > 0) {
            const { data: cities, error: citiesError } = await supabase.from('cities').select('slug');
            if (citiesError) throw citiesError;

            if (cities) {
                for (const rule of rulesWithVariable) {
                    for (const city of cities) {
                        dynamicRoutes.push({
                            url: `${siteUrl}${rule.slug_pattern.replace('{cidade}', city.slug)}`,
                            lastModified: new Date(),
                            changeFrequency: 'weekly',
                            priority: 0.7,
                        });
                    }
                }
            }
        }
        
        // Processa regras que são caminhos estáticos
        for (const rule of rulesWithoutVariable) {
             dynamicRoutes.push({
                url: `${siteUrl}${rule.slug_pattern}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.6,
            });
        }
    }
  } catch (error) {
     console.error("Sitemap: Erro ao processar regras de SEO dinâmicas:", error);
  }
  
  return [
    ...staticRoutes,
    ...dynamicRoutes,
  ];
}
