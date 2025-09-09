
"use client"
import { ShieldCheck, Gauge, Zap, Rocket, Wifi, Phone } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

export function Advantages() {
  const isMobile = useIsMobile();
  const advantages = [
    { icon: <ShieldCheck className="h-5 w-5 text-primary" />, title: "Estabilidade", desc: "Rede de fibra com backbone redundante e QoS." },
    { icon: <Gauge className="h-5 w-5 text-primary" />, title: "Baixa latência", desc: "Jogos e chamadas sem travar, com pings baixíssimos." },
    { icon: <Zap className="h-5 w-5 text-primary" />, title: "Wi‑Fi 6", desc: "Mais alcance, mais dispositivos e menos interferência." },
    { icon: <Rocket className="h-5 w-5 text-primary" />, title: "Instalação express", desc: "Agendamento rápido e instalação sem complicação." },
    { icon: <Wifi className="h-5 w-5 text-primary" />, title: "Cobertura inteligente", desc: "Mesh opcional para casas e empresas maiores." },
    { icon: <Phone className="h-5 w-5 text-primary" />, title: "Suporte que resolve", desc: "Gente de verdade atendendo quando você precisa." },
  ];

  if (isMobile === undefined) {
    return <div className="h-[200px]" />; // Placeholder or loader
  }

  return (
    <section id="vantagens" className="border-t border-white/5 bg-neutral-950/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl lg:mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Por que Velpro?</h2>
          <p className="mt-2 text-white/70">Tecnologia de ponta, atendimento humano e performance real no seu dia a dia.</p>
        </div>
        {isMobile ? (
          <Carousel opts={{ loop: true }} className="w-full">
            <CarouselContent>
              {advantages.map((item) => (
                <CarouselItem key={item.title}>
                  <div className="p-1">
                    <Card className="rounded-2xl border-white/10 bg-neutral-900/60 p-6 h-full">
                      <CardContent className="flex flex-col items-start p-0 gap-3 justify-center">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15">
                          {item.icon}
                        </div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="mt-1 text-white/70">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-neutral-900/50 border-white/10 hover:bg-neutral-900" />
            <CarouselNext className="right-2 bg-neutral-900/50 border-white/10 hover:bg-neutral-900" />
          </Carousel>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6">
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/15">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
