
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
const TvGrid = dynamic(() => import('@/components/landing/TvGrid').then(mod => mod.TvGrid));
const Ceo = dynamic(() => import('@/components/landing/Ceo').then(mod => mod.Ceo));
const Testimonials = dynamic(() => import('@/components/landing/Testimonials').then(mod => mod.Testimonials));
const BlogSection = dynamic(() => import('@/components/landing/BlogSection'));
const Faq = dynamic(() => import('@/components/landing/Faq').then(mod => mod.Faq));
const Contact = dynamic(() => import('@/components/landing/Contact').then(mod => mod.Contact));
const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => mod.Footer));
const DedicatedLinkCta = dynamic(() => import('@/components/landing/DedicatedLinkCta').then(mod => mod.DedicatedLinkCta));


export default async function Home() {
  const supabase = await createClient();
  const { data: cities } = await supabase.from('cities').select('name, slug').order('name');

  const { data: slides } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('price', { ascending: true });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero slides={slides || []} />
        <Plans plans={plans || []} />
        <DedicatedLinkCta />
        <CdnHighlight />
        <Coverage cities={cities || []} />
        <Advantages />
        <Games />
        <Streaming />
        <Mesh />
        <TvGrid />
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
