
import { createClient } from '@/utils/supabase/server';
import { MetadataRoute } from 'next'
 
async function getSiteUrl(): Promise<string> {
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
        // Garante que a URL não termine com uma barra
        return siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
    }

    console.warn("NEXT_PUBLIC_SITE_URL não está definido. Buscando do banco de dados como fallback.");
    const supabase = createClient();
    // Esta é uma suposição de que a URL do site pode ser inferida de alguma configuração,
    // como a URL canônica de uma regra de SEO. Ajuste se necessário.
    const { data } = await supabase.from('seo_settings').select('site_title').single(); // Apenas uma query para exemplo

    // Se nenhuma configuração for encontrada, use um fallback.
    // Em um cenário real, isso poderia ser a URL do primeiro redirecionamento ou outra lógica.
    siteUrl = 'http://localhost:3000';
    console.log(`Usando a URL de fallback para o sitemap: ${siteUrl}`);
    return siteUrl;
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
  const { data: rules } = await supabase.from('dynamic_seo_rules').select('slug_pattern').eq('allow_indexing', true);
  const dynamicRoutes: MetadataRoute.Sitemap = [];

  if (rules) {
    // Este é um placeholder. Para gerar as rotas dinâmicas, precisaríamos
    // de uma fonte de dados para substituir as variáveis (ex: {cidade}).
    // Por exemplo, se tivéssemos uma tabela 'cidades', faríamos uma busca nela.
    // Como não temos, esta parte não gerará rotas, mas o código está pronto.
    for (const rule of rules) {
        // Exemplo: se o padrão for /internet-em-{cidade}
        if (rule.slug_pattern.includes('{cidade}')) {
            // const { data: cidades } = await supabase.from('cidades').select('slug');
            // cidades?.forEach(cidade => {
            //     dynamicRoutes.push({
            //         url: `${siteUrl}${rule.slug_pattern.replace('{cidade}', cidade.slug)}`,
            //         lastModified: new Date(),
            //         changeFrequency: 'weekly',
            //         priority: 0.7
            //     });
            // });
        }
    }
  }


  return [
    ...staticRoutes,
    ...dynamicRoutes
  ]
}

