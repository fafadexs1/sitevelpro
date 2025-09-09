

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Upload, Download, Tv, Smartphone, Check, Loader2, PlusCircle, Gauge, X } from "lucide-react";
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
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Plan = {
  id: string;
  type: 'residencial' | 'empresarial';
  speed: string;
  upload_speed: string | null;
  download_speed: string | null;
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
};

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

                <div className="px-6 pb-28">
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
                        <span className="text-neutral-900 font-bold text-3xl">R${plan.price.toFixed(2).split('.')[0]}</span>
                        <span className="text-neutral-900 font-bold text-xl">,{plan.price.toFixed(2).split('.')[1]}</span>
                        <span className="text-neutral-500">/mês</span>
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


  const PlanCard = ({ plan, index }: { plan: Plan, index: number }) => {
    const slug = `${plan.type}-${plan.speed.replace(/\s+/g, '-').toLowerCase()}`;
    const planName = `${plan.speed} MEGA`;
    const priceInt = plan.price.toFixed(2).split('.')[0];
    const priceDec = plan.price.toFixed(2).split('.')[1];

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
                    <span className="text-5xl font-extrabold tracking-tight text-neutral-900">{plan.speed.replace(/\D/g, '')}</span>
                    <span className="text-3xl font-bold text-neutral-900">MEGA</span>
                </div>
                <div className="inline-block h-1 w-12 bg-[#03bf03] rounded-full mt-2"/>
            </div>

          <ul className="my-6 space-y-3 text-sm flex flex-col items-center">
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
                 {plan.original_price && (
                    <span className="text-sm text-neutral-500 line-through mr-2">De R$ {plan.original_price.toFixed(2)}</span>
                 )}
                 <div className="flex items-baseline justify-center gap-1 whitespace-nowrap">
                    <span className="text-md">Por</span>
                    <span className="font-bold text-4xl">R$ {priceInt}</span>
                    <div className="flex flex-col items-start">
                        <span className="font-bold text-xl">,{priceDec}</span>
                        <span className="text-neutral-500 text-sm -mt-2">/mês</span>
                    </div>
                 </div>
            </div>

            <Button id={`plan-cta-assinar-${slug}`}
                    asChild
                    size="lg"
                    data-track-event="cta_click"
                    data-track-prop-button-id={`assinar-plano-${slug}`}
                    data-track-prop-plan-name={planName}
                    data-track-prop-plan-price={plan.price}
                    className="w-full font-bold bg-[#03bf03] hover:bg-[#03bf03]/90 text-white"
            >
                <Link href="/assinar">Aproveitar oferta</Link>
            </Button>
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
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        ) : isMobile ? (
          <Carousel opts={{ loop: false }} className="relative w-full">
            <CarouselContent>
              {currentPlans.map((p, i) => (
                <CarouselItem key={`${planType}-carousel-${i}`} className="basis-4/5">
                    <div className="p-1 h-full">
                      <PlanCard plan={p} index={i}/>
                    </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-card/80 border-border hover:bg-accent"/>
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-card/80 border-border hover:bg-accent" />
          </Carousel>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentPlans.map((p, i) => (
              <PlanCard plan={p} index={i} key={`${planType}-grid-${i}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
