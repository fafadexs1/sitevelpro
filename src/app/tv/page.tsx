
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { TvPage } from "@/components/landing/TvPage";
import { db } from "@/db";
import { tv_channels, tv_packages, tv_package_channels } from "@/db/schema";
import { asc } from "drizzle-orm";
import { getLayoutData } from "@/lib/data/get-layout-data";

export const metadata = {
  title: 'Pacotes de TV | Velpro',
  description: 'Confira nossos pacotes de TV com a melhor programação para sua família.',
}

export default async function Page() {
  const { domainType, companyLogoUrl } = await getLayoutData();
  const allChannels = (await db.select().from(tv_channels).orderBy(asc(tv_channels.name))).filter(
    (channel): channel is typeof channel & { logo_url: string } => Boolean(channel.logo_url)
  );
  const packages = await db.select().from(tv_packages).orderBy(asc(tv_packages.name));
  const packageChannels = await db.select().from(tv_package_channels);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col h-screen overflow-hidden">
      <Header domainType={domainType} companyLogoUrl={companyLogoUrl} />
      <main className="flex-grow flex flex-col overflow-hidden">
        <TvPage
          initialChannels={allChannels}
          initialPackages={packages}
          initialPackageChannels={packageChannels}
        />
      </main>
      <Footer />
    </div>
  );
}
