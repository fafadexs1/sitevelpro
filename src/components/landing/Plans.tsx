

"use client";

import { useState } from "react";
import { Wifi, Upload, Download, Tv, Smartphone, Check, Loader2, PlusCircle, Gauge, X, Star, ArrowRight, Server, Globe, Shield, Phone } from "lucide-react";
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
  CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ChannelLogos } from "./ChannelLogos";
import { Skeleton } from "@/components/ui/skeleton";
import { Plan, PlanDetailsSheet } from "@/components/shared/PlanDetailsSheet";


interface PlansProps {
  city?: string | null;
}

// Mapeamento de nomes de ícones para componentes de ícone
const ICONS: { [key: string]: React.ElementType } = {
  check: Check,
  wifi: Wifi,
  upload: Upload,
  download: Download,
  tv: Tv,
  smartphone: Smartphone,
};

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const generatePlanSlug = (plan: Pick<Plan, 'type' | 'speed'>) => {
  return `${plan.type}-${plan.speed.replace(/\s+/g, '-').toLowerCase()}`;
}

const getFeatureIcon = (feature: string) => {
  const parts = feature.split(':');
  const iconName = parts.length > 1 ? parts[0].trim().toLowerCase() : 'check';
  const IconComponent = ICONS[iconName] || Check;
  const text = parts.length > 1 ? parts.slice(1).join(':').trim() : feature;

  return {
    Icon: IconComponent,
    text: text,
  };
};

export function Plans({ city, plans, allChannels }: PlansProps & { plans: Plan[], allChannels: any[] }) {
  const [planType, setPlanType] = useState<"residencial" | "empresarial">("residencial");
  const [api, setApi] = useState<CarouselApi>()

  // Filter plans based on selected type
  const currentPlans = plans.filter(p => p.type === planType);

  const PlanCard = ({ plan, index }: { plan: Plan, index: number }) => {
    const slug = generatePlanSlug(plan);
    const planName = `${plan.speed}`;
    const priceBRL = formatBRL(plan.price);
    const firstMonthPriceBRL = plan.first_month_price ? formatBRL(plan.first_month_price) : null;
    const whatsappMessage = plan.whatsapp_message?.replace('{{VELOCIDADE}}', plan.speed) || `Olá, gostaria de mais informações sobre o plano de ${plan.speed}.`;
    const whatsappUrl = `https://wa.me/${plan.whatsapp_number}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
      <div
        key={`${planType}-${index}`}
        className={cn(
          "relative flex h-full flex-col rounded-2xl p-6 transition-colors duration-300",
          plan.highlight
            ? "bg-gradient-to-b from-card to-card/95 border-2 border-[#03bf03] shadow-[0_10px_40px_-10px_rgba(3,191,3,0.3)]"
            : "bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg"
        )}
      >
        {plan.highlight && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-fit whitespace-nowrap rounded-full bg-gradient-to-r from-[#03bf03] to-green-500 px-6 py-1.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(3,191,3,0.5)] tracking-wide uppercase">
            Melhor Oferta
          </div>
        )}
        <div className="flex-grow pt-4">
          <div className="text-center">
            <p className="text-sm text-neutral-600 flex items-center justify-center gap-1.5"><Wifi size={14} /> INTERNET</p>
            <div className="mt-2">
              <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900">{plan.speed.replace(/\D/g, '')}</span>
              <span className="text-2xl md:text-3xl font-bold text-neutral-900">MEGA</span>
            </div>
            <div className="inline-block h-1 w-12 bg-[#03bf03] rounded-full mt-2" />
          </div>

          {plan.has_tv && plan.featured_channel_ids && (
            <ChannelLogos channelIds={plan.featured_channel_ids} allChannels={allChannels} />
          )}

          <ul className="my-6 space-y-3 flex flex-col items-center">
            {(plan.features ?? []).map((feature, i) => {
              const { Icon, text } = getFeatureIcon(feature);
              return (
                <li key={i} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-neutral-500" />
                  <span className="text-neutral-700">{text}</span>
                </li>
              );
            })}
            {plan.download_speed && <li className="flex items-center gap-3"><Download className="h-4 w-4 text-neutral-500" /> <span className="text-neutral-700">Download {plan.download_speed}</span></li>}
            {plan.upload_speed && <li className="flex items-center gap-3"><Upload className="h-4 w-4 text-neutral-500" /> <span className="text-neutral-700">Upload {plan.upload_speed}</span></li>}
          </ul>
        </div>

        <div className="flex flex-col gap-2 mt-auto text-center">
          {/* Replace Modal with Sheet for both Residential and Enterprise for consistency, or just Enterprise? User said "when clicque em saber mais apareça igual lá o canva". This implies for all plans or strictly enterprise? 
               Usually consistency is better. I will use Sheet for ALL plans details. */}
          <PlanDetailsSheet plan={plan}>
            <Button variant="link" className="text-sm text-[#03bf03] h-auto py-1 mb-2 flex items-center gap-1">Mais detalhes <PlusCircle size={14} /></Button>
          </PlanDetailsSheet>

          <div className="text-neutral-900 mb-4">
            {firstMonthPriceBRL ? (
              <>
                <div className="mb-2">
                  <p className="text-md md:text-lg font-bold text-yellow-600 flex items-center justify-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 1º MÊS POR</p>
                  <div className="flex items-baseline justify-center gap-1 whitespace-nowrap">
                    <span className="font-bold text-3xl md:text-4xl">R$</span>
                    <span className="font-bold text-3xl md:text-4xl">{firstMonthPriceBRL.split(',')[0]}</span>
                    <span className="font-bold text-xl md:text-2xl">,{firstMonthPriceBRL.split(',')[1]}</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-center gap-1 whitespace-nowrap text-sm text-neutral-500">
                  <span>Após,</span>
                  <span className="font-medium">R$ {priceBRL}</span>
                  <span>/mês</span>
                </div>
              </>
            ) : (
              <>
                {plan.original_price && (
                  <span className="text-sm text-neutral-500 line-through mr-2">
                    De R$ {formatBRL(plan.original_price)}
                  </span>
                )}
                <div className="flex items-baseline justify-center gap-2 whitespace-nowrap">
                  <span className="text-md font-medium">Por</span>
                  <span className="font-bold text-4xl">R$ {priceBRL}</span>
                  <span className="text-neutral-500 text-sm">/mês</span>
                </div>
              </>
            )}
          </div>

          <PlanDetailsSheet plan={plan}>
            <Button id={`plan-cta-saiba-mais-${slug}`}
              size="lg"
              data-track-event="cta_click"
              data-track-prop-button-id={`cta-saiba-mais-${slug}`}
              data-track-prop-plan-name={planName}
              data-track-prop-plan-price={plan.price}
              className="w-full font-bold bg-[#03bf03] hover:bg-[#03bf03]/90 text-white"
            >
              Saiba mais
            </Button>
          </PlanDetailsSheet>
        </div>
      </div>
    )
  };

  return (
    <section id="planos" className="border-b border-border bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 md:mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Escolha seu plano{city ? ` em ${city}` : ''}</h2>
            <p className="mt-2 text-muted-foreground">Sem fidelidade, sem pegadinha. Instalação rápida e suporte que resolve.</p>
          </div>
          <div className="flex shrink-0 rounded-xl bg-card border p-1 text-sm bg-muted/50">
            {(
              [
                { k: "residencial", label: "Residencial" },
                { k: "empresarial", label: "Empresarial" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.k}
                onClick={() => setPlanType(opt.k)}
                className={`rounded-lg px-6 py-2.5 transition-all font-medium ${planType === opt.k ? "bg-[#03bf03] text-white shadow-sm" : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Carousel
          opts={{ align: "start", loop: false }} // Disabled loop as requested
          className="relative w-full"
          setApi={setApi}
        >
          <CarouselContent className="-ml-4 pb-4">
            {currentPlans.map((p, i) => (
              <CarouselItem key={`${planType}-carousel-${i}`} className="basis-4/5 md:basis-1/3 lg:basis-1/4 pl-4 pt-6">
                <div className="p-1 h-full">
                  <PlanCard plan={p} index={i} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-card/80 border-border hover:bg-accent" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-card/80 border-border hover:bg-accent" />
          {api && <CarouselDots api={api} className="mt-10" />}
        </Carousel>
      </div>
    </section>
  );
}
