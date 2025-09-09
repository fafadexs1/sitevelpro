
import { createClient } from '@/utils/supabase/server';
import { MetadataRoute } from 'next'
 
async function getSiteUrl(): Promise<string> {
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
        // Garante que a URL não termine com uma barra
        return siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
    }
    // Fallback para localhost se nenhuma URL estiver definida
    return 'http://localhost:3000';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getSiteUrl();
  const supabase = createClient();

  // URLs estáticas
  const staticRoutes = [
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

  // URLs Dinâmicas
  const dynamicRoutes: MetadataRoute.Sitemap = [];
  
  // Busca todas as regras de SEO ativas
  const { data: rules } = await supabase
    .from('dynamic_seo_rules')
    .select('slug_pattern, allow_indexing')
    .eq('allow_indexing', true);

  if (rules) {
    // Busca todas as cidades uma única vez
    const { data: cities } = await supabase.from('cities').select('slug');

    for (const rule of rules) {
      const pattern = rule.slug_pattern;
      
      // Se a regra contém a variável {cidade}
      if (pattern.includes('{cidade}') && cities) {
        for (const city of cities) {
          dynamicRoutes.push({
            url: `${siteUrl}${pattern.replace('{cidade}', city.slug)}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      } 
      // Se for uma regra sem variáveis (URL estática)
      else if (!pattern.includes('{')) {
         dynamicRoutes.push({
            url: `${siteUrl}${pattern}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
      }
      // Adicione outras lógicas de variáveis aqui, como {plano}, etc.
    }
  }

  return [
    ...staticRoutes,
    ...dynamicRoutes
  ]
}
