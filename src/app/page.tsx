
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Plans } from "@/components/landing/Plans";
import dynamic from 'next/dynamic';
import { createClient } from "@/utils/supabase/server";

const CdnHighlight = dynamic(() => import('@/components/landing/CdnHighlight').then(mod => mod.CdnHighlight));
const Coverage = dynamic(() => import('@/components/landing/Coverage').then(mod => mod.Coverage));
const Advantages = dynamic(() => import('@/components/landing/Advantages').then(mod => mod.Advantages));
const Games = dynamic(() => import('@/components/landing/Games').then(mod => mod.Games));
const Streaming = dynamic(() => import('@/components/landing/Streaming').then(mod => mod.Streaming));
const Mesh = dynamic(() => import('@/components/landing/Mesh').then(mod => mod.Mesh));
const TvSection = dynamic(() => import('@/components/landing/TvSection').then(mod => mod.TvSection));
const Ceo = dynamic(() => import('@/components/landing/Ceo').then(mod => mod.Ceo));
const Testimonials = dynamic(() => import('@/components/landing/Testimonials').then(mod => mod.Testimonials));
const BlogSection = dynamic(() => import('@/components/landing/BlogSection').then(mod => mod.BlogSection));
const Faq = dynamic(() => import('@/components/landing/Faq').then(mod => mod.Faq));
const Contact = dynamic(() => import('@/components/landing/Contact').then(mod => mod.Contact));
const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => mod.Footer));


export default async function Home() {
  const supabase = createClient();
  const { data: cities } = await supabase.from('cities').select('name, slug').order('name');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Plans />
        <CdnHighlight />
        <Coverage cities={cities || []} />
        <Advantages />
        <Games />
        <Streaming />
        <Mesh />
        <TvSection />
        <Ceo />
        <Testimonials />
        <BlogSection />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
