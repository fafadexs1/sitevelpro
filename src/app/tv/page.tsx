
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { TVGuide } from "@/components/landing/TvGuide";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        <TVGuide />
      </main>
      <Footer />
    </div>
  );
}
