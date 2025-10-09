
import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default function robots(): MetadataRoute.Robots {
  const headersList = headers();
  const host = headersList.get('host');
  // Em um ambiente de produção, x-forwarded-proto será 'https'. Em desenvolvimento, pode ser nulo.
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';
  const siteUrl = `${protocol}://${host}`;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/cliente/', '/admin/', '/colaborador/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
