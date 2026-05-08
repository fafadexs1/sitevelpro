
"use client";

import { Zap, Gauge, ChevronRight, Router, Gamepad2, Headphones } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { HeroNetworkScene } from "./HeroNetworkScene";

export type HeroSlide = {
  id: string;
  slide_type: 'content' | 'image_only';
  pre_title?: string | null;
  title_regular?: string | null;
  title_highlighted?: string | null;
  subtitle?: string | null;
  image_url?: string | null;
  image_url_mobile?: string | null;
  image_opacity?: number | null;
  button_primary_text?: string | null;
  button_primary_link?: string | null;
  button_secondary_text?: string | null;
  button_secondary_link?: string | null;
  feature_1_text?: string | null;
  feature_2_text?: string | null;
};

interface HeroProps {
  city?: string | null;
}

export function Hero({ city, slides }: HeroProps & { slides: HeroSlide[] }) {
  // const [slides, setSlides] = useState<HeroSlide[]>([]); // Removed state
  // const [loading, setLoading] = useState(true); // Removed loading state

  // useEffect(() => { ... }, []); // Removed useEffect

  if (!slides || slides.length === 0) {
    return (
      <section id="home" className="relative flex items-center justify-center overflow-hidden border-b border-border bg-background min-h-[600px]">
        {/* Placeholder or empty state if needed, though server-side fetching should prevent this usually */}
      </section>
    );
  }



  const proofItems = [
    { icon: Router, label: "100% fibra FTTH" },
    { icon: Gauge, label: "Até 1000 Mega" },
    { icon: Gamepad2, label: "Baixa latência" },
    { icon: Headphones, label: "Suporte local" },
  ];

  const renderContentSlide = (slide: HeroSlide, index: number) => (
    <div className="relative overflow-hidden border-b border-[#03BF03]/10 bg-[#07100d] text-white flex items-center hero-slide">
      <picture>
        {slide.image_url_mobile && (
          <source media="(max-width: 768px)" srcSet={slide.image_url_mobile} />
        )}
        {slide.image_url && (
          <source media="(min-width: 769px)" srcSet={slide.image_url} />
        )}
        {slide.image_url && (
          <Image
            src={slide.image_url}
            alt={slide.title_regular || "Imagem de fundo"}
            fill
            priority={index === 0}
            className="object-cover"
            style={{ opacity: (slide.image_opacity ?? 30) / 100 }}
          />
        )}
      </picture>

      <HeroNetworkScene />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(34,211,238,0.2),transparent_32%),linear-gradient(90deg,rgba(3,7,18,0.96),rgba(3,7,18,0.78)_42%,rgba(3,7,18,0.36)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07100d] via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#03BF03]/50 to-transparent" />

      <div className="w-full max-w-7xl mx-auto grid items-center gap-6 py-10 md:gap-10 md:py-16 z-10">
        <div className="space-y-6 md:space-y-8 px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#03BF03]/30 bg-[#03BF03]/10 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-medium text-[#03BF03] backdrop-blur-sm">
            <Zap className="h-3 w-3 md:h-4 md:w-4" />
            {city ? `Fibra óptica em ${city}` : slide.pre_title || "Velpro Telecom"}
          </div>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl leading-[1.02]">
            {city ? (
              <>Internet fibra em {city}</>
            ) : (
              <>
                Internet fibra de alta performance
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#03BF03] via-cyan-200 to-amber-200 text-glow"> para sua casa e empresa</span>
              </>
            )}
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-slate-200 leading-relaxed drop-shadow-md">
            {city
              ? `Planos de até 1000 Mega, Wi-Fi de alto alcance e atendimento próximo para quem precisa de internet estável em ${city}.`
              : "Planos estáveis, baixa latência, Wi-Fi moderno e suporte que resolve. A Velpro conecta o Entorno com uma rede feita para streaming, jogos, home office e empresas."}
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            {slide.button_primary_text && slide.button_primary_link && (
              <Button asChild size="lg" className="h-12 rounded-lg bg-[#03BF03] px-6 text-base font-bold text-slate-950 shadow-[0_0_28px_rgba(3,191,3,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#029E02] md:h-14 md:px-8 md:text-lg">
                <Link href={city ? "#planos" : slide.button_primary_link}>{city ? "Ver planos disponíveis" : slide.button_primary_text} <ChevronRight className="ml-2 h-4 w-4 md:h-5 md:w-5" /></Link>
              </Button>
            )}
            {slide.button_secondary_text && slide.button_secondary_link && (
              <Button asChild variant="outline" size="lg" className="h-12 rounded-lg border-white/20 bg-white/10 px-6 text-base text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/15 md:h-14 md:px-8 md:text-lg">
                <Link href={city ? "#cobertura" : slide.button_secondary_link}>{city ? "Consultar cobertura" : slide.button_secondary_text}</Link>
              </Button>
            )}
          </div>
          <div className="grid max-w-3xl grid-cols-2 gap-3 pt-2 text-xs font-semibold text-white/85 sm:grid-cols-4 md:text-sm">
            {proofItems.map((item) => (
              <div key={item.label} className="flex min-h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-md">
                <item.icon className="h-4 w-4 shrink-0 text-[#03BF03] md:h-5 md:w-5" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderImageOnlySlide = (slide: HeroSlide, index: number) => {
    const link = slide.button_primary_link || '#';
    const content = (
      <picture className="w-full h-full">
        {slide.image_url_mobile && (
          <source media="(max-width: 768px)" srcSet={slide.image_url_mobile} />
        )}
        {slide.image_url && (
          <source media="(min-width: 769px)" srcSet={slide.image_url} />
        )}
        {slide.image_url && (
          <Image
            src={slide.image_url}
            alt={slide.title_regular || "Imagem de destaque"}
            fill
            priority={index === 0}
            className="object-cover"
          />
        )}
      </picture>
    );

    return (
      <div className="relative overflow-hidden border-b border-border bg-black text-white flex items-center hero-slide">
        {link === '#' ? content : <Link href={link} className="w-full h-full block">{content}</Link>}
      </div>
    );
  };

  return (
    <Carousel
      opts={{ loop: slides.length > 1, align: "start" }}
      className="relative w-full"
      id="home"
    >
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem key={slide.id}>
            {slide.slide_type === 'image_only'
              ? renderImageOnlySlide(slide, index)
              : renderContentSlide(slide, index)}
          </CarouselItem>
        ))}
      </CarouselContent>
      {slides.length > 1 && (
        <>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-card/80 border-border hover:bg-accent" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-card/80 border-border hover:bg-accent" />
        </>
      )}
    </Carousel>
  );
}
