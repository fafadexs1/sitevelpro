
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
import { createBrowserClient } from "@supabase/ssr";
import type { Metadata } from 'next';

// Gera metadados dinâmicos com base nas regras de SEO cadastradas
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const supabase = createClient();
  const path = `/${params.slug}`;

  const { data: rules } = await supabase
    .from('dynamic_seo_rules')
    .select('slug_pattern, meta_title, meta_description, canonical_url')
    .eq('allow_indexing', true);

  if (!rules) return {};

  let title: string | undefined;
  let description: string | undefined;
  let canonical: string | undefined;

  for (const rule of rules) {
    if (rule.slug_pattern.includes('{cidade}')) {
      const regex = new RegExp('^' + rule.slug_pattern.replace('{cidade}', '([a-z0-9-]+)') + '$');
      const match = path.match(regex);
      if (match) {
        const citySlug = match[1];
        const { data: city } = await supabase
          .from('cities')
          .select('name')
          .eq('slug', citySlug)
          .single();
        const cityName = city?.name ?? citySlug;
        title = rule.meta_title.replace('{cidade}', cityName);
        description = rule.meta_description?.replace('{cidade}', cityName);
        canonical = rule.canonical_url
          ? rule.canonical_url.replace('{cidade}', citySlug)
          : undefined;
        break;
      }
    } else if (rule.slug_pattern === path) {
      title = rule.meta_title;
      description = rule.meta_description ?? undefined;
      canonical = rule.canonical_url ?? undefined;
      break;
    }
  }

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

// Esta função informa ao Next.js quais páginas dinâmicas gerar no momento da compilação.
// Ela busca os slugs de todas as regras dinâmicas que não são padrões (não contêm '{')
// e também processa as que são padrões (contêm '{cidade}')
export async function generateStaticParams() {
  try {
    // Para generateStaticParams, precisamos de um cliente que não dependa de cookies.
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: rules, error: rulesError } = await supabase.from('dynamic_seo_rules').select('slug_pattern').eq('allow_indexing', true);
    if (rulesError) throw rulesError;

    const params: { slug: string }[] = [];

    // Processa regras que são caminhos estáticos (sem variáveis)
    const staticRules = rules.filter(r => !r.slug_pattern.includes('{'));
    staticRules.forEach(r => params.push({ slug: r.slug_pattern.replace('/', '') }));

    // Processa regras que usam a variável {cidade}
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

// Esta página renderiza o conteúdo da página inicial para qualquer rota dinâmica.
// Isso permite ter URLs específicas para SEO, como /cidade-ocidental,
// enquanto exibe o conteúdo principal do site.
export default function DynamicPage() {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <Header />
      <main>
        <Hero />
        <Plans />
        <Coverage />
        <Advantages />
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
