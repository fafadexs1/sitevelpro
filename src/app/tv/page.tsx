
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { TvPage } from "@/components/landing/TvPage";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        <TvPage />
      </main>
      <Footer />
    </div>
  );
}
