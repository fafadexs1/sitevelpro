import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

async function getSiteUrl(): Promise<string> {
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  }
  return 'http://localhost:3000';
}

// Helper para escapar caracteres XML
function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

export async function GET() {
  const siteUrl = await getSiteUrl();
  const supabase = createClient();

  const routes: { url: string; lastModified: Date; priority: number }[] = [];

  // 1. Rotas Estáticas
  [
    '/',
    '/assinar',
    '/cliente',
    '/politica-de-privacidade',
    '/termos-de-uso',
    '/status',
    '/tv'
  ].forEach(route => {
    routes.push({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      priority: route === '/' ? 1 : 0.8,
    });
  });

  // 2. Rotas Dinâmicas
  try {
    const { data: allRules, error: rulesError } = await supabase
        .from('dynamic_seo_rules')
        .select('slug_pattern, allow_indexing')
        .eq('allow_indexing', true);

    if (rulesError) throw rulesError;

    if (allRules) {
        const rulesWithVariable = allRules.filter(rule => rule.slug_pattern.includes('{cidade}'));
        const rulesWithoutVariable = allRules.filter(rule => !rule.slug_pattern.includes('{'));

        if (rulesWithVariable.length > 0) {
            const { data: cities, error: citiesError } = await supabase.from('cities').select('slug');
            if (citiesError) throw citiesError;

            if (cities) {
                for (const rule of rulesWithVariable) {
                    for (const city of cities) {
                        routes.push({
                            url: `${siteUrl}${rule.slug_pattern.replace('{cidade}', city.slug)}`,
                            lastModified: new Date(),
                            priority: 0.7,
                        });
                    }
                }
            }
        }
        
        for (const rule of rulesWithoutVariable) {
             routes.push({
                url: `${siteUrl}${rule.slug_pattern}`,
                lastModified: new Date(),
                priority: 0.6,
            });
        }
    }
  } catch (error) {
     console.error("Sitemap: Erro ao processar regras de SEO dinâmicas:", error);
  }

  // 3. Construir o XML
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  ${routes.map(route => `
    <url>
      <loc>${escapeXml(route.url)}</loc>
      <lastmod>${route.lastModified.toISOString().split('T')[0]}</lastmod>
      <priority>${route.priority}</priority>
    </url>
  `).join('')}
</urlset>`;

  // 4. Retornar a resposta XML
  return new NextResponse(sitemapXml.trim(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
