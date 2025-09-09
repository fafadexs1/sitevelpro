
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gauge, Check, ChevronRight, Loader2, Wifi, Upload, Download, Tv, Smartphone, ShieldCheck, Zap, Rocket, Home, MessageSquare, Globe, FileText, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChannelLogos } from "./ChannelLogos";
import { createClient } from "@/utils/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type Plan = {
  id: string;
  type: 'residencial' | 'empresarial';
  speed: string;
  price: number;
  original_price: number | null;
  features: string[] | null;
  highlight: boolean;
  has_tv: boolean;
  featured_channel_ids: string[] | null;
  whatsapp_number: string | null;
  whatsapp_message: string | null;
  conditions: string | null;
};

// Mapeamento de nomes de ícones para componentes de ícone
const ICONS: { [key: string]: React.ElementType } = {
  check: Check,
  wifi: Wifi,
  upload: Upload,
  download: Download,
  tv: Tv,
  smartphone: Smartphone,
  gauge: Gauge,
  shield: ShieldCheck,
  zap: Zap,
  rocket: Rocket,
  home: Home
};

export function Plans() {
  const [planType, setPlanType] = useState<"residencial" | "empresarial">("residencial");
  const isMobile = useIsMobile();
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPlans() {
      const supabase = createClient();
      setLoading(true);
      const { data, error } = await supabase.from('plans').select('*').order('price', { ascending: true });
      if (error) {
        console.error("Erro ao buscar planos:", error);
      } else {
        setAllPlans(data as Plan[]);
      }
      setLoading(false);
    }
    getPlans();
  }, []);

  const currentPlans = allPlans.filter(p => p.type === planType);

  const getFeatureIcon = (feature: string) => {
    const parts = feature.split(':');
    const iconName = parts.length > 1 ? parts[0].trim().toLowerCase() : 'check';
    const IconComponent = ICONS[iconName] || Check;
    const text = parts.length > 1 ? parts.slice(1).join(':').trim() : feature;
    
    return {
      Icon: <IconComponent className="h-4 w-4 mt-0.5 shrink-0 text-primary" />,
      text: text,
    };
  };

  const PlanCard = ({ plan, index }: { plan: Plan, index: number }) => {
    const slug = `${plan.type}-${plan.speed.replace(/\s+/g, '-').toLowerCase()}`;
    const planName = `${plan.speed} MEGA`;

    return (
      <motion.div
        key={`${planType}-${index}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className={`relative flex h-full flex-col rounded-2xl border ${
          plan.highlight ? "border-primary/60" : "border-white/10"
        } bg-neutral-900/60 p-6 shadow-xl`}
      >
        {plan.highlight && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-fit whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
            OFERTA IMPERDÍVEL
          </div>
        )}
        <div className="flex-grow pt-4">
            <h3 className="text-4xl font-black tracking-tighter flex items-center gap-2">
              <Gauge className="w-8 h-8 text-primary"/>
              {plan.speed} <span className="text-3xl font-bold text-white/70">MEGA</span>
            </h3>
            
            <div className="mt-3 mb-4 space-y-1">
                {plan.original_price && (
                    <p className="text-white/60 line-through">De R$ {plan.original_price.toFixed(2).replace('.', ',')}</p>
                )}
                <p className="text-xl font-bold">
                    Por <span className="text-4xl font-black">R$ {plan.price.toFixed(2).replace('.', ',')}</span>/mês
                </p>
            </div>
          
          {plan.has_tv && plan.featured_channel_ids && <ChannelLogos channelIds={plan.featured_channel_ids} />}

          <ul className="my-6 space-y-2 text-sm">
            {(plan.features ?? []).map((feature, i) => {
              const { Icon, text } = getFeatureIcon(feature);
              return (
                <li key={i} className="flex items-start gap-2">
                  {Icon}
                  <span className="text-white/80">{text}</span>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="flex flex-col gap-2 mt-auto">
             {plan.conditions && (
                 <Sheet>
                    <SheetTrigger asChild>
                         <Button variant="link" className="text-xs text-white/60 h-auto py-1 mb-2">Conferir condições</Button>
                    </SheetTrigger>
                    <SheetContent className="bg-neutral-950 border-white/10 text-white">
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2 text-primary"><FileText /> Condições do Plano {plan.speed} MEGA</SheetTitle>
                        </SheetHeader>
                        <div className="py-4 prose prose-sm prose-invert prose-p:text-white/80">
                           <p>{plan.conditions}</p>
                        </div>
                    </SheetContent>
                </Sheet>
            )}
            <Button id={`plan-cta-assinar-${slug}`}
                    asChild
                    data-track-event="cta_click"
                    data-track-prop-button-id={`assinar-plano-${slug}`}
                    data-track-prop-plan-name={planName}
                    data-track-prop-plan-price={plan.price}
                    className="w-full"
            >
                <Link href="/assinar">Assinar Agora</Link>
            </Button>
        </div>
      </motion.div>
    )
  };

  return (
    <section id="planos" className="border-t border-white/5 bg-neutral-950/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 md:mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Escolha seu plano</h2>
            <p className="mt-2 text-white/70">Sem fidelidade, sem pegadinha. Instalação rápida e suporte que resolve.</p>
          </div>
          <div className="flex shrink-0 rounded-xl border border-white/10 p-1 text-sm">
            {(
              [
                { k: "residencial", label: "Residencial" },
                { k: "empresarial", label: "Empresarial" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.k}
                onClick={() => setPlanType(opt.k)}
                className={`rounded-lg px-3 py-2 transition-colors ${
                  planType === opt.k ? "bg-primary text-primary-foreground" : "text-white/80 hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        ) : isMobile ? (
          <Carousel opts={{ loop: true }} className="relative w-full">
            <CarouselContent>
              {currentPlans.map((p, i) => (
                <CarouselItem key={`${planType}-carousel-${i}`} className="basis-4/5">
                    <div className="p-1 h-full">
                      <PlanCard plan={p} index={i}/>
                    </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-neutral-900/50 border-white/10 hover:bg-neutral-900"/>
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-neutral-900/50 border-white/10 hover:bg-neutral-900" />
          </Carousel>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {currentPlans.map((p, i) => (
              <PlanCard plan={p} index={i} key={`${planType}-grid-${i}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
