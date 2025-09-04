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
import { ChatWidget } from "@/components/landing/ChatWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Removemos os glows fixos pois o canvas cuidará do fundo */}

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
      <ChatWidget />
    </div>
  );
}
