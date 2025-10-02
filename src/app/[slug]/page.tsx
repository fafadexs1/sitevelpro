
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Plans } from "@/components/landing/Plans";
import { Coverage } from "@/components/landing/Coverage";
import { Advantages } from "@/components/landing/Advantages";
import { Mesh } from "@/components/landing/Mesh";
import { TvSection } from "@/components/landing/Tv";
import { Ceo } from "@/components/landing/Ceo";
import { Testimonials } from "@/components/landing/Testimonials";
import { Faq } from "@/components/landing/Faq";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from "next/dynamic";

const CdnHighlight = dynamic(() => import('@/components/landing/CdnHighlight').then(mod => mod.CdnHighlight));
const Games = dynamic(() => import('@/components/landing/Games').then(mod => mod.Games));
const Streaming = dynamic(() => import('@/components/landing/Streaming').then(mod => mod.Streaming));


type PageProps = {
    params: { slug: string };
};

// --- Helper Functions ---
async function getPageData(slug: string) {
    const supabase = createClient();
    const path = `/${slug}`;
    let cityName: string | null = null;
    let isDynamicCityPage = false;

    const { data: rules } = await supabase
        .from('dynamic_seo_rules')
        .select('slug_pattern, meta_title, meta_description, canonical_url')
        .eq('allow_indexing', true);

    if (!rules) return { cityName, isDynamicCityPage, meta: null };
    
    let meta = null;

    for (const rule of rules) {
        if (rule.slug_pattern.includes('{cidade}')) {
            const regex = new RegExp('^' + rule.slug_pattern.replace('{cidade}', '([a-z0-9-]+)') + '$');
            const match = path.match(regex);
            if (match) {
                isDynamicCityPage = true;
                const citySlug = match[1];
                const { data: city } = await supabase.from('cities').select('name').eq('slug', citySlug).single();
                
                if (city) {
                    cityName = city.name;
                    meta = {
                        title: rule.meta_title.replace('{cidade}', cityName),
                        description: rule.meta_description?.replace('{cidade}', cityName),
                        canonical: rule.canonical_url?.replace('{cidade}', citySlug),
                    };
                }
                break;
            }
        } else if (rule.slug_pattern === path) {
            meta = {
                title: rule.meta_title,
                description: rule.meta_description ?? undefined,
                canonical: rule.canonical_url ?? undefined,
            };
            break;
        }
    }
    
    // Se nenhuma regra de SEO correspondeu, mas é um slug, pode ser uma página não configurada.
    // Você pode querer retornar um 404 aqui.
    if (!meta) {
        // notFound();
    }

    return { cityName, isDynamicCityPage, meta };
}


// --- Metadata Generation ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { meta } = await getPageData(params.slug);

    return {
        title: meta?.title,
        description: meta?.description,
        alternates: meta?.canonical ? { canonical: meta.canonical } : undefined,
        openGraph: { title: meta?.title, description: meta?.description },
        twitter: { title: meta?.title, description: meta?.description },
    };
}

// --- Static Path Generation ---
export async function generateStaticParams() {
  try {
    const supabase = createClient();
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
  const { cityName, isDynamicCityPage } = await getPageData(params.slug);
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero city={cityName} />
        <Plans city={cityName} />
        <CdnHighlight />
        <Coverage city={cityName} />
        <Advantages />
        <Games />
        <Streaming />
        <Mesh />
        <TvSection />
        <Ceo />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
