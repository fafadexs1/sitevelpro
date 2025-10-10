
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { TvPage } from "@/components/landing/TvPage";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col h-screen overflow-hidden">
      <Header />
      <main className="flex-grow flex flex-col overflow-hidden">
        <TvPage />
      </main>
      <Footer />
    </div>
  );
}
