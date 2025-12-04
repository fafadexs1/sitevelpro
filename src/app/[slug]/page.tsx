
import { Header } from "@/components/landing/Header";
import { Hero, type HeroSlide } from "@/components/landing/Hero";
import { Plans, type Plan } from "@/components/landing/Plans";
import { Coverage } from "@/components/landing/Coverage";
import { Advantages } from "@/components/landing/Advantages";
import { Mesh } from "@/components/landing/Mesh";
import { Testimonials } from "@/components/landing/Testimonials";
import { Faq } from "@/components/landing/Faq";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from "next/dynamic";
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const CdnHighlight = dynamic(() => import('@/components/landing/CdnHighlight').then(mod => mod.CdnHighlight));
const Games = dynamic(() => import('@/components/landing/Games').then(mod => mod.Games));
const Streaming = dynamic(() => import('@/components/landing/Streaming').then(mod => mod.Streaming));
const TvGrid = dynamic(() => import('@/components/landing/TvGrid').then(mod => mod.TvGrid));
const Ceo = dynamic(() => import('@/components/landing/Ceo').then(mod => mod.Ceo));


type PageProps = {
  params: Promise<{ slug: string }>;
};

type PageData = {
  cityName: string | null;
  meta: {
    title: string;
    description?: string;
    canonical?: string;
  } | null;
  schemaType: 'LocalBusiness' | 'Product' | 'Offer' | 'FAQ' | 'Article' | 'None';
}

// --- Helper Functions ---
async function getPageData(slug: string): Promise<PageData> {
  const supabase = await createClient();
  const path = `/${slug}`;
  let cityName: string | null = null;
  let meta = null;
  let schemaType: PageData['schemaType'] = 'None';

  const { data: rules } = await supabase
    .from('dynamic_seo_rules')
    .select('name, slug_pattern, meta_title, meta_description, canonical_url, schema_type')
    .eq('allow_indexing', true);

  if (!rules) return { cityName, meta: null, schemaType: 'None' };

  // Tenta encontrar uma correspondência exata primeiro
  const staticMatch = rules.find(rule => rule.slug_pattern.replace('/', '') === slug);

  if (staticMatch) {
    // Usa o nome da própria regra como o nome da cidade para exibição
    cityName = staticMatch.name;
    meta = {
      title: staticMatch.meta_title.replace('{cidade}', cityName),
      description: staticMatch.meta_description?.replace('{cidade}', cityName),
      canonical: staticMatch.canonical_url?.replace('{cidade}', slug),
    };
    schemaType = staticMatch.schema_type as PageData['schemaType'];
  } else {
    // Se não houver correspondência estática, tenta as regras dinâmicas com {cidade}
    for (const rule of rules) {
      if (rule.slug_pattern.includes('{cidade}')) {
        const regex = new RegExp('^' + rule.slug_pattern.replace('{cidade}', '([a-z0-9-]+)') + '$');
        const match = path.match(regex);
        if (match) {
          const citySlug = match[1];
          const { data: city } = await supabase.from('cities').select('name').eq('slug', citySlug).single();

          if (city) {
            cityName = city.name;
            meta = {
              title: rule.meta_title.replace('{cidade}', cityName),
              description: rule.meta_description?.replace('{cidade}', cityName),
              canonical: rule.canonical_url?.replace('{cidade}', citySlug),
            };
            schemaType = rule.schema_type as PageData['schemaType'];
          }
          break;
        }
      }
    }
  }

  if (!meta) {
    const { data: staticPage } = await supabase
      .from('dynamic_seo_rules')
      .select('meta_title, meta_description, canonical_url, schema_type')
      .eq('slug_pattern', path)
      .single();

    if (staticPage) {
      meta = {
        title: staticPage.meta_title,
        description: staticPage.meta_description ?? undefined,
        canonical: staticPage.canonical_url ?? undefined,
      };
      schemaType = staticPage.schema_type as PageData['schemaType'];
    }
  }

  // Se nenhuma regra correspondeu, a página não deve ser encontrada.
  if (!meta) {
    // notFound();
  }

  return { cityName, meta, schemaType };
}

function getLocalBusinessJsonLd(cityName: string, slug: string) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Velpro Telecom",
    "telephone": "0800 381 0404",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "SQ 13 QUADRA 01 LOTE 11 SALA 101 CENTRO",
      "addressLocality": "Cidade Ocidental",
      "addressRegion": "GO",
      "postalCode": "72880-000",
      "addressCountry": "BR"
    },
    "url": `https://velpro.net.br/internet-em-${slug}`,
    "@id": `https://velpro.net.br/internet-em-${slug}#LocalBusiness`,
    "areaServed": {
      "@type": "City",
      "name": cityName
    },
    "priceRange": "$$",
    "image": "https://velpro.net.br/logo.png"
  };
  return JSON.stringify(jsonLd);
}


// --- Metadata Generation ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { cityName, meta, schemaType } = await getPageData(resolvedParams.slug);

  const metadata: Metadata = {
    title: meta?.title,
    description: meta?.description,
    alternates: meta?.canonical ? { canonical: meta.canonical } : undefined,
    openGraph: { title: meta?.title, description: meta?.description },
    twitter: { title: meta?.title, description: meta?.description },
  };

  if (schemaType === 'LocalBusiness' && cityName) {
    metadata.other = {
      'application/ld+json': getLocalBusinessJsonLd(cityName, resolvedParams.slug)
    }
  }

  return metadata;
}

// --- Static Path Generation ---
export async function generateStaticParams() {
  try {
    // Create a Supabase client that doesn't rely on cookies for build-time data fetching.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return undefined;
          },
          set(name: string, value: string, options: CookieOptions) { },
          remove(name: string, options: CookieOptions) { },
        },
      }
    );

    const { data: rules, error: rulesError } = await supabase.from('dynamic_seo_rules').select('slug_pattern').eq('allow_indexing', true);
    if (rulesError) throw rulesError;

    const params: { slug: string }[] = [];
    if (!rules) return [];

    const staticRules = rules.filter(r => !r.slug_pattern.includes('{'));
    staticRules.forEach(r => params.push({ slug: r.slug_pattern.replace('/', '') }));

    const cityRules = rules.filter(r => r.slug_pattern.includes('{cidade}'));
    if (cityRules.length > 0) {
      const { data: cities, error: citiesError } = await supabase.from('cities').select('slug');
      if (citiesError) throw citiesError;
      if (cities) {
        cities.forEach(city => {
          cityRules.forEach(rule => {
            params.push({ slug: rule.slug_pattern.replace('{cidade}', city.slug).replace('/', '') });
          })
        });
      }
    }

    return params;
  } catch (error) {
    console.error('Exception in generateStaticParams for [slug]:', error);
    return [];
  }
}

// --- Page Component ---
export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { cityName } = await getPageData(resolvedParams.slug);
  const supabase = await createClient();

  const { data: cities } = await supabase.from('cities').select('name, slug').order('name');
  const { data: slides } = await supabase.from('hero_slides').select('*').order('created_at');
  const { data: plans } = await supabase.from('plans').select('*').order('price');

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <Hero city={cityName} slides={slides as HeroSlide[] || []} />
          <Plans city={cityName} plans={plans as Plan[] || []} />
          <CdnHighlight />
          <Coverage city={cityName} cities={cities || []} />
          <Advantages />
          <Games />
          <Streaming />
          <Mesh />
          <TvGrid />
          <Ceo />
          <Testimonials />
          <Faq />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}

