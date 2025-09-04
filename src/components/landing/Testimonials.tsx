"use client";

import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

export function Testimonials() {
  const isMobile = useIsMobile();
  const testimonials = [
    { name: "Ana • Criadora", text: "Upload rápido e live sem travar. Suporte me atendeu em minutos!", stars: 5 },
    { name: "Marcos • Gamer", text: "Ping baixíssimo nos servers. Mudou meu competitivo.", stars: 5 },
    { name: "Luciana • Home Office", text: "Chamadas perfeitas e redundância bem configurada.", stars: 5 },
  ];

  return (
    <section className="border-t border-white/5 bg-neutral-950/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl lg:mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Clientes que sentem a diferença</h2>
          <p className="mt-2 text-white/70">Histórias reais de quem depende da internet todos os dias.</p>
        </div>
        {isMobile ? (
           <Carousel opts={{ loop: true }} className="w-full">
            <CarouselContent>
              {testimonials.map((t) => (
                <CarouselItem key={t.name}>
                  <div className="p-1">
                    <Card className="rounded-2xl border-white/10 bg-neutral-900/60 p-6 h-full">
                      <CardContent className="flex flex-col items-start p-0 gap-3 justify-center">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: t.stars }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                        <p className="text-white/80">{t.text}</p>
                        <p className="mt-4 text-sm text-white/60">{t.name}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6">
                <div className="mb-3 flex items-center gap-1">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-white/80">{t.text}</p>
                <p className="mt-4 text-sm text-white/60">{t.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
