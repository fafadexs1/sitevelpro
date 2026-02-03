
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

import { type InferSelectModel } from 'drizzle-orm';
import { testimonials as testimonialsSchema } from '@/db/schema';

type Testimonial = InferSelectModel<typeof testimonialsSchema>;

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const isMobile = useIsMobile();

  if (isMobile === undefined) {
    return <div className="h-[200px]" />; // Placeholder or loader
  }

  return (
    <section className="border-t border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl lg:mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Clientes que sentem a diferença</h2>
          <p className="mt-2 text-muted-foreground">Histórias reais de quem depende da internet todos os dias.</p>
        </div>
        {isMobile ? (
          <Carousel opts={{ loop: true }} className="w-full">
            <CarouselContent>
              {testimonials.map((t) => (
                <CarouselItem key={t.id}>
                  <div className="p-1">
                    <Card className="rounded-2xl bg-card p-6 h-full">
                      <CardContent className="flex flex-col items-start p-0 gap-3 justify-center">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: t.stars }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                        <p className="text-card-foreground/80">{t.text}</p>
                        <p className="mt-4 text-sm text-muted-foreground">{t.name} • {t.role}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-background/50 border-border hover:bg-accent" />
            <CarouselNext className="right-2 bg-background/50 border-border hover:bg-accent" />
          </Carousel>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 flex items-center gap-1">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-card-foreground/80">{t.text}</p>
                <p className="mt-4 text-sm text-muted-foreground">{t.name} • {t.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
