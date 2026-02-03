
import { db } from "@/db";
import { cities, dynamic_seo_rules, hero_slides, plans, testimonials, faqs, games, tv_channels } from "@/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from "next/dynamic";
import { Header } from "@/components/landing/Header";
import { Hero, type HeroSlide } from "@/components/landing/Hero";
import { Plans } from "@/components/landing/Plans";
import { type Plan } from "@/components/shared/PlanDetailsSheet";
import { getLayoutData } from "@/lib/data/get-layout-data";
import { tableExists } from "@/lib/db/table-exists";

const CdnHighlight = dynamic(() => import('@/components/landing/CdnHighlight').then(mod => mod.CdnHighlight));
const Coverage = dynamic(() => import('@/components/landing/Coverage').then(mod => mod.Coverage));
const Advantages = dynamic(() => import('@/components/landing/Advantages').then(mod => mod.Advantages));
const Games = dynamic(() => import('@/components/landing/Games').then(mod => mod.Games));
const Streaming = dynamic(() => import('@/components/landing/Streaming').then(mod => mod.Streaming));
const Mesh = dynamic(() => import('@/components/landing/Mesh').then(mod => mod.Mesh));
const TvGrid = dynamic(() => import('@/components/landing/TvGrid').then(mod => mod.TvGrid));
const Ceo = dynamic(() => import('@/components/landing/Ceo').then(mod => mod.Ceo));
const Testimonials = dynamic(() => import('@/components/landing/Testimonials').then(mod => mod.Testimonials));
const BlogSection = dynamic(() => import('@/components/landing/BlogSection'));
const Faq = dynamic(() => import('@/components/landing/Faq').then(mod => mod.Faq));
const Contact = dynamic(() => import('@/components/landing/Contact').then(mod => mod.Contact));
const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => mod.Footer));
const DedicatedLinkCta = dynamic(() => import('@/components/landing/DedicatedLinkCta').then(mod => mod.DedicatedLinkCta));


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
  const path = `/${slug}`;
  let cityName: string | null = null;
  let meta = null;
  let schemaType: PageData['schemaType'] = 'None';

  const rules = await db.select().from(dynamic_seo_rules).where(eq(dynamic_seo_rules.allow_indexing, true));

  if (!rules || rules.length === 0) return { cityName, meta: null, schemaType: 'None' };

  // Tenta encontrar uma correspondência exata primeiro
  const staticMatch = rules.find(rule => rule.slug_pattern?.replace('/', '') === slug);

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
      if (rule.slug_pattern?.includes('{cidade}')) {
        const regex = new RegExp('^' + rule.slug_pattern.replace('{cidade}', '([a-z0-9-]+)') + '$');
        const match = path.match(regex);
        if (match) {
          const citySlug = match[1];
          const [city] = await db.select({ name: cities.name }).from(cities).where(eq(cities.slug, citySlug)).limit(1);

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
    const [staticPage] = await db.select().from(dynamic_seo_rules).where(eq(dynamic_seo_rules.slug_pattern, path)).limit(1);

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
  // Use Drizzle to fetch data for static paths
  try {
    const rules = await db.select({ slug_pattern: dynamic_seo_rules.slug_pattern }).from(dynamic_seo_rules).where(eq(dynamic_seo_rules.allow_indexing, true));

    const params: { slug: string }[] = [];
    if (!rules || rules.length === 0) return [];

    const staticRules = rules.filter(r => r.slug_pattern && !r.slug_pattern.includes('{'));
    staticRules.forEach(r => params.push({ slug: r.slug_pattern.replace('/', '') }));

    const cityRules = rules.filter(r => r.slug_pattern && r.slug_pattern.includes('{cidade}'));
    if (cityRules.length > 0) {
      const cityList = await db.select({ slug: cities.slug }).from(cities);
      if (cityList) {
        cityList.forEach(city => {
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
  const { domainType, companyLogoUrl } = await getLayoutData();

  const citiesData = await db.select({ name: cities.name, slug: cities.slug }).from(cities).orderBy(asc(cities.name));
  const slidesData = await db.select().from(hero_slides).where(eq(hero_slides.is_active, true)).orderBy(asc(hero_slides.sort_order));
  const plansData = await db.select().from(plans).orderBy(asc(plans.sort_order), asc(plans.price));

  // Fetch Channels
  const allChannels = (await db.select().from(tv_channels)).filter(
    (channel): channel is typeof channel & { logo_url: string } => Boolean(channel.logo_url)
  );
  const featuredChannels = allChannels.filter(c => c.is_featured).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8);

  // Fetch Testimonials
  let testimonialsData: typeof testimonials.$inferSelect[] = [];
  if (await tableExists("testimonials")) {
    try {
      testimonialsData = await db.select().from(testimonials).orderBy(asc(testimonials.created_at));
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    }
  }

  // Fetch FAQ
  let faqsData: typeof faqs.$inferSelect[] = [];
  if (await tableExists("faqs")) {
    try {
      faqsData = await db.select().from(faqs).orderBy(asc(faqs.sort_order));
    } catch (error) {
      console.error("Error fetching faqs:", error);
    }
  }

  // Fetch Games
  let gamesData: typeof games.$inferSelect[] = [];
  if (await tableExists("games")) {
    try {
      gamesData = await db.select().from(games).orderBy(asc(games.sort_order));
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  }

  const formattedPlans = plansData
    .filter((plan): plan is typeof plansData[number] & { speed: string; price: string | number; type: string } =>
      Boolean(plan.speed) && Boolean(plan.type) && plan.price !== null
    )
    .map(p => ({
      ...p,
      type: p.type as "residencial" | "empresarial",
      price: Number(p.price),
      original_price: p.original_price !== null ? Number(p.original_price) : null,
      first_month_price: p.first_month_price !== null ? Number(p.first_month_price) : null,
      highlight: p.highlight ?? false,
      has_tv: p.has_tv ?? false,
    }));

  const formattedSlides = slidesData.map(s => ({
    ...s,
    slide_type: (s.slide_type as 'content' | 'image_only') || 'content'
  }));

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <Header domainType={domainType} companyLogoUrl={companyLogoUrl} />
        <main>
          <Hero city={cityName} slides={formattedSlides} />
          <Plans city={cityName} plans={formattedPlans} allChannels={allChannels} />
          <CdnHighlight />
          <Coverage city={cityName} cities={citiesData} />
          <Advantages />
          <Games games={gamesData} />
          <Streaming />
          <Mesh />
          <TvGrid channels={featuredChannels} />
          <Ceo />
          <Testimonials testimonials={testimonialsData} />
          <Faq faqs={faqsData} />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}

