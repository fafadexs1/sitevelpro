
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Timeline } from "@/components/landing/Timeline";
import { BookHeart } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nossa História',
  description: 'De um link de 64kbps à fibra de 1 GIGA, conheça a jornada de inovação e compromisso da Velpro Telecom.',
};

import { getLayoutData } from "@/lib/data/get-layout-data";

export default async function HistoriaPage() {
  const { domainType, companyLogoUrl } = await getLayoutData();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header domainType={domainType} companyLogoUrl={companyLogoUrl} />
      <main className="flex-grow">
        <div className="bg-secondary border-b border-border py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <BookHeart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Nossa História</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Uma jornada de pioneirismo, inovação e compromisso com a conexão.
            </p>
          </div>
        </div>

        <Timeline />

      </main>
      <Footer />
    </div>
  );
}
