
import { db } from "@/db";
import { cities, dynamic_seo_rules, posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'http';
  const host = request.headers.get('host');
  const siteUrl = `${protocol}://${host}`;

  // const supabase = await createClient(); // Removed

  const routes: { url: string; lastModified: Date; priority: number }[] = [];

  // 1. Rotas Estáticas
  [
    '/',
    '/assinar',
    '/politica-de-privacidade',
    '/termos-de-uso',
    '/status',
    '/tv',
    '/blog'
  ].forEach(route => {
    routes.push({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      priority: route === '/' ? 1 : 0.8,
    });
  });

  // 2. Rotas Dinâmicas de SEO
  try {
    const allRules = await db.select().from(dynamic_seo_rules).where(eq(dynamic_seo_rules.allow_indexing, true));

    if (allRules && allRules.length > 0) {
      const rulesWithVariable = allRules.filter(rule => rule.slug_pattern && rule.slug_pattern.includes('{cidade}'));
      const rulesWithoutVariable = allRules.filter(rule => rule.slug_pattern && !rule.slug_pattern.includes('{'));

      if (rulesWithVariable.length > 0) {
        const citiesList = await db.select({ slug: cities.slug }).from(cities);

        if (citiesList) {
          for (const rule of rulesWithVariable) {
            for (const city of citiesList) {
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

  // 3. Rotas de Blog
  try {
    const blogPosts = await db.select({ slug: posts.slug, published_at: posts.published_at })
      .from(posts)
      .where(eq(posts.is_published, true));

    blogPosts.forEach(post => {
      routes.push({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: post.published_at ? new Date(post.published_at) : new Date(),
        priority: 0.7,
      });
    });
  } catch (error) {
    console.error("Sitemap: Erro ao processar posts do blog:", error);
  }

  // 4. Construir o XML
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

  // 5. Retornar a resposta XML
  return new NextResponse(sitemapXml.trim(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
