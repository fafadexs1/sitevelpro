
import { createClient } from '@/utils/supabase/server';
import { MetadataRoute } from 'next'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Prioriza a variável de ambiente, mas usa o BD como fallback
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    console.warn("NEXT_PUBLIC_SITE_URL não está definido. Tentando buscar do banco de dados.");
    const supabase = createClient();
    // Esta é uma suposição de como você pode ter a URL do site armazenada.
    // Se a estrutura for diferente, ajuste a query.
    // Por exemplo, pode estar em uma tabela 'settings' com uma chave 'site_url'.
    // Aqui, vamos assumir que não está no BD e usar um fallback final.
    siteUrl = 'http://localhost:3000'; // Fallback final se tudo falhar
    console.log(`Usando a URL de fallback para o sitemap: ${siteUrl}`);
  }

  // URLs estáticas
  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${siteUrl}/assinar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/cliente`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
        url: `${siteUrl}/politica-de-privacidade`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
    },
    {
        url: `${siteUrl}/termos-de-uso`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
    },
    {
        url: `${siteUrl}/status`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.7,
    },
    {
        url: `${siteUrl}/tv`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    }
  ];

  // Exemplo de como você poderia adicionar rotas dinâmicas (ex: planos)
  // const supabase = createClient();
  // const { data: plans } = await supabase.from('plans').select('speed, type');
  // const planRoutes = plans?.map(plan => ({
  //   url: `${siteUrl}/${plan.type}/${plan.speed}`,
  //   lastModified: new Date(),
  // })) ?? [];

  return [
    ...staticRoutes,
    // ...planRoutes,
  ]
}
