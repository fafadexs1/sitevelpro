
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
  pre_title?: string | null;
  title_regular?: string | null;
  title_highlighted?: string | null;
  subtitle?: string | null;
  image_url?: string | null;
  button_primary_text?: string | null;
  button_primary_link?: string | null;
  button_secondary_text?: string | null;
  button_secondary_link?: string | null;
  feature_1_text?: string | null;
  feature_2_text?: string | null;
};

export function Hero() {
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

  if (loading) {
    return (
      <section id="home" className="relative flex items-center justify-center overflow-hidden border-b border-border bg-background min-h-[600px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </section>
    );
  }
  
  if(slides.length === 0) {
    // Render a default static hero if no slides are configured
    return (
       <section id="home" className="relative overflow-hidden border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" /> Nova geração: Wi‑Fi 6 + Fibra 100%
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Internet{" "}
              <span className="text-primary">
                ultrarrápida
              </span>{" "}
              para tudo que importa
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Planos estáveis, latência baixíssima e suporte que resolve de verdade.
              Conecte-se com a Velpro e sinta a diferença.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild id="hero-cta-planos">
                <Link href="#planos" >Conhecer planos <ChevronRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild id="hero-cta-vantagens" variant="outline">
                <Link href="#vantagens">Ver vantagens</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Garantia de satisfação</div>
              <div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> Latência baixíssima</div>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <Carousel
      opts={{ loop: true, align: "start" }}
      className="relative w-full"
      id="home"
    >
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            <div className="relative overflow-hidden border-b border-border bg-background min-h-[600px] flex items-center">
              {slide.image_url && (
                <Image
                  src={slide.image_url}
                  alt={slide.title_regular || "Imagem de fundo"}
                  fill
                  className="object-cover opacity-10"
                />
              )}
               <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
               <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />

              <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24 z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  {slide.pre_title && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Zap className="h-3.5 w-3.5" /> {slide.pre_title}
                    </div>
                  )}
                  <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                    {slide.title_regular}{" "}
                    {slide.title_highlighted && (
                      <span className="text-primary">{slide.title_highlighted}</span>
                    )}
                  </h1>
                  {slide.subtitle && (
                    <p className="max-w-xl text-lg text-muted-foreground">
                      {slide.subtitle}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {slide.button_primary_text && slide.button_primary_link && (
                      <Button asChild>
                        <Link href={slide.button_primary_link}>{slide.button_primary_text} <ChevronRight className="h-4 w-4" /></Link>
                      </Button>
                    )}
                     {slide.button_secondary_text && slide.button_secondary_link && (
                      <Button asChild variant="outline">
                        <Link href={slide.button_secondary_link}>{slide.button_secondary_text}</Link>
                      </Button>
                    )}
                  </div>
                   <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
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
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-card/80 border-border hover:bg-accent"/>
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-card/80 border-border hover:bg-accent" />
    </Carousel>
  );
}
