
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Plans } from "@/components/landing/Plans";
import { TvGrid } from "@/components/landing/TvGrid";
import { Contact } from "@/components/landing/Contact";
import { CdnHighlight } from "@/components/landing/CdnHighlight";
import { Coverage } from "@/components/landing/Coverage";
import { Advantages } from "@/components/landing/Advantages";
import { Games } from "@/components/landing/Games";
import { Streaming } from "@/components/landing/Streaming";
import { Mesh } from "@/components/landing/Mesh";
import { Ceo } from "@/components/landing/Ceo";
import { Testimonials } from "@/components/landing/Testimonials";
import BlogSection from "@/components/landing/BlogSection"; // Default import? Check
import { Faq } from "@/components/landing/Faq";
import { DedicatedLinkCta } from "@/components/landing/DedicatedLinkCta";

import { getLayoutData } from "@/lib/data/get-layout-data";
import { tableExists } from "@/lib/db/table-exists";
import { db } from "@/db";
import { cities, hero_slides, plans, testimonials, faqs, games, tv_channels } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export default async function Home() {
  const { domainType, companyLogoUrl, seo: seoSettings } = await getLayoutData();

  // Fetch Headers/Slides
  const slidesData = await db.select().from(hero_slides).where(eq(hero_slides.is_active, true)).orderBy(asc(hero_slides.sort_order));
  const formattedSlides = slidesData.map(s => ({
    ...s,
    slide_type: (s.slide_type as 'content' | 'image_only') || 'content'
  }));

  // Fetch Cities
  const citiesData = await db.select({ name: cities.name, slug: cities.slug }).from(cities).orderBy(asc(cities.name));

  // Fetch Plans (All types)
  const plansData = await db.select().from(plans).orderBy(asc(plans.sort_order), asc(plans.price));
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

  // Using Header title/description if hero doesn't use slides? Hero uses slides prop.

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header domainType={domainType} companyLogoUrl={companyLogoUrl} />
      <main className="flex-grow">
        <Hero slides={formattedSlides} />
        <Plans city="Belo Horizonte" plans={formattedPlans} allChannels={allChannels} />
        <DedicatedLinkCta />
        <CdnHighlight />
        <Coverage cities={citiesData} />
        <Advantages />
        <Games games={gamesData} />
        <Streaming />
        <Mesh />
        <TvGrid channels={featuredChannels} />
        <Ceo />
        <Testimonials testimonials={testimonialsData} />
        <BlogSection />
        <Faq faqs={faqsData} />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
