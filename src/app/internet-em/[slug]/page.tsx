
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
