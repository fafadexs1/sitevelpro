import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { TvPage } from "@/components/landing/TvPage";
import { db } from "@/db";
import { tv_channels, tv_package_channels, tv_packages } from "@/db/schema";
import { getLayoutData } from "@/lib/data/get-layout-data";
import { asc } from "drizzle-orm";

export const metadata = {
  title: "Pacotes de TV | Velpro",
  description: "Confira nossos pacotes de TV com a melhor programação para sua família.",
};

export default async function Page() {
  const { domainType, companyLogoUrl } = await getLayoutData();
  const allChannels = (await db.select().from(tv_channels).orderBy(asc(tv_channels.name))).filter(
    (channel): channel is typeof channel & { logo_url: string } => Boolean(channel.logo_url),
  );
  const packages = await db.select().from(tv_packages).orderBy(asc(tv_packages.name));
  const packageChannels = await db.select().from(tv_package_channels);

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground flex flex-col">
      <Header domainType={domainType} companyLogoUrl={companyLogoUrl} />
      <main className="flex-grow flex flex-col">
        <TvPage
          initialChannels={allChannels}
          initialPackages={packages}
          initialPackageChannels={packageChannels}
        />
      </main>
      <Footer className="border-white/10 bg-neutral-950 text-neutral-400" />
    </div>
  );
}
