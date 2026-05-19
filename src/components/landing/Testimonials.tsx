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
import { type InferSelectModel } from "drizzle-orm";
import { testimonials as testimonialsSchema } from "@/db/schema";

type Testimonial = InferSelectModel<typeof testimonialsSchema>;

const googleReviewTestimonials: Testimonial[] = [
  {
    id: "google-review-1",
    name: "Cliente Google",
    role: "Avaliação 5 estrelas",
    text: "Os serviços são confiáveis, ótimos planos, com diversidade de valores e a equipe de atendimento ao cliente como um todo é excelente.",
    stars: 5,
    avatar_url: null,
    created_at: "2023-03-29T00:00:00.000Z",
  },
  {
    id: "google-review-2",
    name: "Cliente Google",
    role: "Avaliação 5 estrelas",
    text: "Melhor internet que já utilizei. Faço alto consumo de dados e uso vários aparelhos simultâneos sem problemas.",
    stars: 5,
    avatar_url: null,
    created_at: "2023-03-27T00:00:00.000Z",
  },
  {
    id: "google-review-3",
    name: "Cliente Google",
    role: "Avaliação 5 estrelas",
    text: "A melhor equipe de atendimento. A internet é fantástica, já são anos com a Velpro e sempre fui muito bem atendido. A qualidade nunca mudou.",
    stars: 5,
    avatar_url: null,
    created_at: "2023-09-19T00:00:00.000Z",
  },
  {
    id: "google-review-4",
    name: "Cliente Google",
    role: "Avaliação 5 estrelas",
    text: "Ótima internet, ping muito baixo e latência excelente. Consigo jogar sem problemas mesmo em servidores no exterior. Netflix também responde muito bem.",
    stars: 5,
    avatar_url: null,
    created_at: "2023-03-28T00:00:00.000Z",
  },
];

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const isMobile = useIsMobile();
  const displayedTestimonials = testimonials.length > 0 ? testimonials : googleReviewTestimonials;

  if (isMobile === undefined) {
    return <div className="h-[200px]" />;
  }

  return (
    <section className="border-t border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl lg:mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Clientes que sentem a diferença</h2>
          <p className="mt-2 text-muted-foreground">Avaliações reais de clientes no Google.</p>
        </div>
        {isMobile ? (
          <Carousel opts={{ loop: true }} className="w-full">
            <CarouselContent>
              {displayedTestimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id}>
                  <div className="p-1">
                    <Card className="h-full rounded-2xl bg-card p-6">
                      <CardContent className="flex flex-col items-start justify-center gap-3 p-0">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: testimonial.stars }).map((_, index) => (
                            <Star key={index} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                        <p className="text-card-foreground/80">{testimonial.text}</p>
                        <p className="mt-4 text-sm text-muted-foreground">{testimonial.role}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 border-border bg-background/50 hover:bg-accent" />
            <CarouselNext className="right-2 border-border bg-background/50 hover:bg-accent" />
          </Carousel>
        ) : (
          <div className="grid gap-6 md:grid-cols-4">
            {displayedTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 flex items-center gap-1">
                  {Array.from({ length: testimonial.stars }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-card-foreground/80">{testimonial.text}</p>
                <p className="mt-4 text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
