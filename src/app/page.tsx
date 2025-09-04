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
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Top Glow Background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -left-10 top-1/3 h-40 w-40 -rotate-12 rounded-full bg-primary/10 blur-xl" />
      </div>

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
