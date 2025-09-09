
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
  
  // Busca regras que contenham a variável {cidade}
  const { data: cityRules } = await supabase
    .from('dynamic_seo_rules')
    .select('slug_pattern')
    .eq('allow_indexing', true)
    .like('slug_pattern', '%{cidade}%');

  // Se existirem regras de cidade, busca as cidades
  if (cityRules && cityRules.length > 0) {
    const { data: cities } = await supabase.from('cities').select('slug');
    
    if (cities) {
      for (const rule of cityRules) {
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

  // Você pode adicionar mais lógicas aqui para outras variáveis como {plano}, etc.

  return [
    ...staticRoutes,
    ...dynamicRoutes
  ]
}
