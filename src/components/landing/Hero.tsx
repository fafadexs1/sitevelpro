
"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Gauge, ChevronRight, Loader2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

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



  const renderContentSlide = (slide: HeroSlide, index: number) => (
    <div className="relative overflow-hidden border-b border-border bg-black text-white flex items-center hero-slide">
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

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      <div className="w-full max-w-7xl mx-auto grid items-center gap-6 py-10 md:gap-10 md:py-16 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6 md:space-y-8 px-4 sm:px-6 lg:px-8 max-w-3xl"
        >
          {slide.pre_title && (
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-medium text-primary backdrop-blur-sm">
              <Zap className="h-3 w-3 md:h-4 md:w-4" /> {slide.pre_title}
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl text-white leading-[1.1] drop-shadow-lg">
            {slide.title_regular?.replace('{cidade}', city || '')}{" "}
            {slide.title_highlighted && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400 text-glow">{slide.title_highlighted.replace('{cidade}', city || '')}</span>
            )}
          </h1>
          {slide.subtitle && (
            <p className="max-w-xl text-lg md:text-xl text-gray-200 leading-relaxed drop-shadow-md">
              {slide.subtitle.replace('{cidade}', city || '')}
            </p>
          )}
          <div className="flex flex-wrap gap-3 md:gap-4">
            {slide.button_primary_text && slide.button_primary_link && (
              <Button asChild size="lg" className="h-12 px-6 text-base md:h-14 md:px-8 md:text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all duration-300">
                <Link href={slide.button_primary_link}>{slide.button_primary_text} <ChevronRight className="ml-2 h-4 w-4 md:h-5 md:w-5" /></Link>
              </Button>
            )}
            {slide.button_secondary_text && slide.button_secondary_link && (
              <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base md:h-14 md:px-8 md:text-lg border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white transition-all duration-300">
                <Link href={slide.button_secondary_link}>{slide.button_secondary_text}</Link>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4 md:gap-6 pt-4 md:pt-6 text-xs md:text-sm font-medium text-white/80">
            {slide.feature_1_text && (
              <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/5"><ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-primary" />{slide.feature_1_text}</div>
            )}
            {slide.feature_2_text && (
              <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/5"><Gauge className="h-4 w-4 md:h-5 md:w-5 text-primary" />{slide.feature_2_text}</div>
            )}
          </div>
        </motion.div>
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
