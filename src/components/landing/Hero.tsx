
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

type HeroSlide = {
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

export function Hero({ city }: HeroProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error("Error fetching slides:", error);
      } else {
        setSlides(data);
      }
      setLoading(false);
    };
    fetchSlides();
  }, []);

  if (loading || slides.length === 0) {
    return (
      <section id="home" className="relative flex items-center justify-center overflow-hidden border-b border-border bg-background min-h-[600px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </section>
    );
  }

  const renderContentSlide = (slide: HeroSlide, index: number) => (
    <div className="relative overflow-hidden border-b border-border bg-black text-white min-h-[600px] flex items-center">
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
      
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      <div className="w-full max-w-7xl mx-auto grid items-center gap-10 py-16 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6 px-4 sm:px-6 lg:px-8"
        >
          {slide.pre_title && (
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" /> {slide.pre_title}
            </div>
          )}
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl text-white">
            {slide.title_regular?.replace('{cidade}', city || '')}{" "}
            {slide.title_highlighted && (
              <span className="text-primary">{slide.title_highlighted.replace('{cidade}', city || '')}</span>
            )}
          </h1>
          {slide.subtitle && (
            <p className="max-w-xl text-lg text-white/80">
              {slide.subtitle.replace('{cidade}', city || '')}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {slide.button_primary_text && slide.button_primary_link && (
              <Button asChild size="lg">
                <Link href={slide.button_primary_link}>{slide.button_primary_text} <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            )}
              {slide.button_secondary_text && slide.button_secondary_link && (
              <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/10 hover:bg-white/20 text-white">
                <Link href={slide.button_secondary_link}>{slide.button_secondary_text}</Link>
              </Button>
            )}
          </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-white/70">
            {slide.feature_1_text && (
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />{slide.feature_1_text}</div>
            )}
              {slide.feature_2_text && (
                <div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" />{slide.feature_2_text}</div>
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
        <div className="relative overflow-hidden border-b border-border bg-black text-white min-h-[600px] flex items-center">
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
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-card/80 border-border hover:bg-accent"/>
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-card/80 border-border hover:bg-accent" />
        </>
      )}
    </Carousel>
  );
}
