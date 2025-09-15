

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Upload, Download, Tv, Smartphone, Check, Loader2, PlusCircle, Gauge, X, Star, ArrowRight } from "lucide-react";
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
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ChannelLogos } from "./ChannelLogos";
import { Skeleton } from "@/components/ui/skeleton";

type Plan = {
  id: string;
  type: 'residencial' | 'empresarial';
  speed: string;
  upload_speed: string | null;
  download_speed: string | null;
  price: number;
  original_price: number | null;
  first_month_price: number | null;
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
};

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PlanDetailsModal = ({ plan, children }: { plan: Plan, children: React.ReactNode }) => {
    const slug = `${plan.type}-${plan.speed.replace(/\s+/g, '-').toLowerCase()}`;
    const planName = `${plan.speed} MEGA`;
    
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl w-full bg-white text-neutral-800 p-0">
                <DialogHeader className="p-6">
                    <p className="text-sm text-neutral-500">INTERNET FIBRA</p>
                    <DialogTitle className="text-3xl font-extrabold text-neutral-900">{planName}</DialogTitle>
                </DialogHeader>

                <div className="px-6 pb-28 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        {plan.features?.map(feat => {
                            const { Icon, text } = getFeatureIcon(feat);
                            return <div key={text} className="flex items-center gap-2 text-neutral-600"><Icon className="text-green-600"/>{text}</div>
                        })}
                        {plan.download_speed && <div className="flex items-center gap-2 text-neutral-600"><Download className="text-green-600"/> Download {plan.download_speed}</div>}
                        {plan.upload_speed && <div className="flex items-center gap-2 text-neutral-600"><Upload className="text-green-600"/> Upload {plan.upload_speed}</div>}
                    </div>

                    {plan.conditions && (
                        <div className="mt-6 pt-6 border-t">
                            <h4 className="font-semibold text-neutral-800">Velocidade da oferta</h4>
                            <p className="text-xs text-neutral-500 mt-1">{plan.conditions}</p>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-neutral-50 border-t flex items-center justify-between">
                    <div>
                      <span className="text-neutral-900 font-bold text-3xl">
                        R$ {formatBRL(plan.price)}
                      </span>
                      <span className="text-neutral-500 ml-2">/mês</span>
                    </div>
                     <Button id={`plan-modal-cta-assinar-${slug}`}
                        asChild
                        size="lg"
                        className="bg-[#03bf03] hover:bg-[#03bf03]/90 text-white font-bold"
                        data-track-event="cta_click"
                        data-track-prop-button-id={`assinar-modal-plano-${slug}`}
                        data-track-prop-plan-name={planName}
                        data-track-prop-plan-price={plan.price}
                    >
                        <Link href="/assinar">Aproveitar oferta</Link>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
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

const PlanSkeleton = () => (
    <div className="relative flex h-full flex-col rounded-2xl p-6 shadow-lg bg-card border">
        <div className="flex-grow pt-4">
            <div className="text-center">
                <Skeleton className="h-4 w-24 mx-auto" />
                <div className="mt-4">
                    <Skeleton className="h-12 w-32 mx-auto" />
                </div>
                <Skeleton className="h-1 w-12 mx-auto mt-3" />
            </div>
            <div className="my-6 space-y-3 flex flex-col items-center">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-44" />
            </div>
        </div>
        <div className="flex flex-col gap-2 mt-auto text-center">
            <Skeleton className="h-4 w-20 mx-auto mb-2" />
            <Skeleton className="h-10 w-32 mx-auto mb-4" />
            <Skeleton className="h-12 w-full" />
        </div>
    </div>
);


export function Plans() {
  const [planType, setPlanType] = useState<"residencial" | "empresarial">("residencial");
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>()

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

  const PlanCard = ({ plan, index }: { plan: Plan, index: number }) => {
    const slug = `${plan.type}-${plan.speed.replace(/\s+/g, '-').toLowerCase()}`;
    const planName = `${plan.speed} MEGA`;
    const priceBRL = formatBRL(plan.price);
    const firstMonthPriceBRL = plan.first_month_price ? formatBRL(plan.first_month_price) : null;
    const whatsappMessage = plan.whatsapp_message?.replace('{{VELOCIDADE}}', plan.speed) || `Olá, gostaria de mais informações sobre o plano de ${plan.speed} MEGA.`;
    const whatsappUrl = `https://wa.me/${plan.whatsapp_number}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
      <motion.div
        key={`${planType}-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className={cn(
            "relative flex h-full flex-col rounded-2xl p-6 shadow-lg text-neutral-800 bg-card",
            plan.highlight ? "border-[#03bf03] border-2" : "border"
        )}
      >
        {plan.highlight && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-fit whitespace-nowrap rounded-full bg-[#03bf03] px-4 py-1.5 text-xs font-bold text-white shadow-lg">
            MELHOR OFERTA
          </div>
        )}
        <div className="flex-grow pt-4">
            <div className="text-center">
                <p className="text-sm text-neutral-600 flex items-center justify-center gap-1.5"><Wifi size={14}/> INTERNET</p>
                <div className="mt-2">
                    <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900">{plan.speed.replace(/\D/g, '')}</span>
                    <span className="text-2xl md:text-3xl font-bold text-neutral-900">MEGA</span>
                </div>
                <div className="inline-block h-1 w-12 bg-[#03bf03] rounded-full mt-2"/>
            </div>

            {plan.has_tv && plan.featured_channel_ids && (
              <ChannelLogos channelIds={plan.featured_channel_ids} />
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
             {plan.download_speed && <li className="flex items-center gap-3"><Download className="h-4 w-4 text-neutral-500"/> <span className="text-neutral-700">Download {plan.download_speed}</span></li>}
             {plan.upload_speed && <li className="flex items-center gap-3"><Upload className="h-4 w-4 text-neutral-500"/> <span className="text-neutral-700">Upload {plan.upload_speed}</span></li>}
          </ul>
        </div>
        
        <div className="flex flex-col gap-2 mt-auto text-center">
            {plan.conditions && (
                <PlanDetailsModal plan={plan}>
                     <Button variant="link" className="text-sm text-[#03bf03] h-auto py-1 mb-2 flex items-center gap-1">Mais detalhes <PlusCircle size={14}/></Button>
                </PlanDetailsModal>
            )}
            
            <div className="text-neutral-900 mb-4">
              {firstMonthPriceBRL ? (
                <>
                    <div className="mb-2">
                        <p className="text-md md:text-lg font-bold text-yellow-600 flex items-center justify-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/> 1º MÊS POR</p>
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

            <Dialog>
                <DialogTrigger asChild>
                     <Button id={`plan-cta-saiba-mais-${slug}`}
                        size="lg"
                        data-track-event="cta_click"
                        data-track-prop-button-id={`saiba-mais-plano-${slug}`}
                        data-track-prop-plan-name={planName}
                        className="w-full font-bold bg-[#03bf03] hover:bg-[#03bf03]/90 text-white"
                     >
                        Saiba mais
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white text-gray-800">
                     <DialogHeader>
                        <DialogTitle>Como você prefere continuar?</DialogTitle>
                        <DialogDescription>
                            Escolha a melhor forma de contratar o plano de {planName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 pt-4">
                         <Button
                            id={`continue-site-plano-${slug}`}
                            asChild
                            variant="default"
                            size="lg"
                            className="bg-[#03bf03] hover:bg-[#03bf03]/90 text-white font-bold"
                            data-track-event="cta_click"
                            data-track-prop-button-id={`continuar-site-plano-${slug}`}
                            data-track-prop-plan-name={planName}
                        >
                            <Link href="/assinar">
                                Continuar pelo site
                                <ArrowRight className="ml-2 h-4 w-4"/>
                            </Link>
                        </Button>
                        <Button
                            id={`whatsapp-plano-${slug}`}
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                            data-track-event="cta_click"
                            data-track-prop-button-id={`whatsapp-plano-${slug}`}
                            data-track-prop-plan-name={planName}
                        >
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                Falar no WhatsApp
                                <Smartphone className="ml-2 h-4 w-4"/>
                            </a>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </motion.div>
    )
  };

  return (
    <section id="planos" className="border-b border-border bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 md:mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Escolha seu plano</h2>
            <p className="mt-2 text-muted-foreground">Sem fidelidade, sem pegadinha. Instalação rápida e suporte que resolve.</p>
          </div>
          <div className="flex shrink-0 rounded-xl bg-card border p-1 text-sm">
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
                  planType === opt.k ? "bg-[#03bf03] text-white" : "text-card-foreground hover:bg-black/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
             <Carousel className="relative w-full">
                <CarouselContent className="-ml-4">
                    {[...Array(3)].map((_, i) => (
                        <CarouselItem key={`skeleton-${i}`} className="basis-4/5 md:basis-1/3 pl-4 pt-6">
                            <div className="p-1 h-full">
                                <PlanSkeleton />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        ) : (
           <Carousel 
             opts={{ align: "start", loop: currentPlans.length > 2 }} 
             className="relative w-full"
             setApi={api}
            >
            <CarouselContent className="-ml-4">
              {currentPlans.map((p, i) => (
                <CarouselItem key={`${planType}-carousel-${i}`} className="basis-4/5 md:basis-1/3 lg:basis-1/4 pl-4 pt-6">
                    <div className="p-1 h-full">
                      <PlanCard plan={p} index={i}/>
                    </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-card/80 border-border hover:bg-accent"/>
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-card/80 border-border hover:bg-accent" />
            {api && <CarouselDots api={api} className="mt-10" />}
          </Carousel>
        )}
      </div>
    </section>
  );
}
