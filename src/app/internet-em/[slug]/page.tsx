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

// Esta função informa ao Next.js quais páginas dinâmicas gerar no momento da compilação.
// Sem ela, o Next.js não sabe quais slugs de cidade existem e retorna um erro 404.
export async function generateStaticParams() {
  try {
    const supabase = createClient();
    const { data: cities, error } = await supabase.from('cities').select('slug');

    if (error) {
      console.error('Error fetching city slugs for static generation:', error);
      return [];
    }

    if (!cities) {
        return [];
    }

    return cities.map((city) => ({
      slug: city.slug,
    }));
  } catch (error) {
    console.error('Exception in generateStaticParams:', error);
    return [];
  }
}

// Esta página renderiza o conteúdo da página inicial para as rotas dinâmicas de cidade.
// Isso permite ter URLs específicas para SEO, como /internet-em/cidade-ocidental,
// enquanto exibe o conteúdo principal do site.

export default function DynamicCityPage() {
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
