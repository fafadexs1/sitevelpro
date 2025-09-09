
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Upload, Download, Tv, Smartphone, Check, Loader2, PlusCircle } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
      Icon: <IconComponent className="h-4 w-4 text-muted-foreground" />,
      text: text,
    };
  };
  
   const ProductIcons = ({ plan }: { plan: Plan }) => (
    <div className="mt-4">
        <p className="text-xs text-muted-foreground mb-2">Produtos inclusos</p>
        <div className="flex items-center gap-2">
            {plan.featured_channel_ids?.map(id => (
                 <div key={id} className="w-10 h-10 rounded-md bg-green-500 text-white grid place-items-center">
                    <p>{id.substring(0,1)}</p>
                 </div>
            ))}
            {/* Mock icons as per image */}
            <div className="w-10 h-10 rounded-md bg-green-500 text-white grid place-items-center">S</div>
            <div className="w-10 h-10 rounded-md bg-blue-600 text-white grid place-items-center">B</div>
        </div>
    </div>
  );


  const PlanCard = ({ plan, index }: { plan: Plan, index: number }) => {
    const slug = `${plan.type}-${plan.speed.replace(/\s+/g, '-').toLowerCase()}`;
    const planName = `${plan.speed} MEGA`;

    return (
      <motion.div
        key={`${planType}-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className={cn(
            "relative flex h-full flex-col rounded-2xl bg-card p-6 shadow-lg",
            plan.highlight ? "border-blue-600 border-2" : "border"
        )}
      >
        {plan.highlight && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-fit whitespace-nowrap rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
            MELHOR OFERTA
          </div>
        )}
        <div className="flex-grow pt-4">
            <div className="text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5"><Wifi size={14}/> INTERNET</p>
                <h3 className="text-3xl font-extrabold tracking-tight text-card-foreground mt-2">
                    {plan.speed.replace(/ /g, '')}MEGA
                </h3>
                <div className="inline-block h-1 w-12 bg-primary rounded-full mt-2"/>
            </div>

          <ul className="my-6 space-y-3 text-sm">
            {(plan.features ?? []).map((feature, i) => {
              const { Icon, text } = getFeatureIcon(feature);
              return (
                <li key={i} className="flex items-center gap-3">
                  {Icon}
                  <span className="text-card-foreground/90">{text}</span>
                </li>
              );
            })}
          </ul>
            
          {/* <ProductIcons plan={plan} /> */}

        </div>
        
        <div className="flex flex-col gap-2 mt-auto text-center">
            {plan.conditions && (
                 <Sheet>
                    <SheetTrigger asChild>
                         <Button variant="link" className="text-sm text-primary h-auto py-1 mb-2 flex items-center gap-1">Mais detalhes <PlusCircle size={14}/></Button>
                    </SheetTrigger>
                    <SheetContent className="bg-card border-border text-card-foreground">
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2 text-primary">Condições do Plano {plan.speed} MEGA</SheetTitle>
                        </SheetHeader>
                        <div className="py-4 prose prose-sm prose-p:text-card-foreground/80">
                           <p>{plan.conditions}</p>
                        </div>
                    </SheetContent>
                </Sheet>
            )}

            <div className="text-card-foreground mb-4">
                <span className="font-bold text-4xl">R$ {plan.price.toFixed(2).split('.')[0]}</span>
                <span className="font-bold text-2xl">,{plan.price.toFixed(2).split('.')[1]}</span>
                <span className="text-muted-foreground text-xl">/mês</span>
            </div>

            <Button id={`plan-cta-assinar-${slug}`}
                    asChild
                    size="lg"
                    data-track-event="cta_click"
                    data-track-prop-button-id={`assinar-plano-${slug}`}
                    data-track-prop-plan-name={planName}
                    data-track-prop-plan-price={plan.price}
                    className="w-full font-bold"
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
                  planType === opt.k ? "bg-primary text-primary-foreground" : "text-card-foreground hover:bg-black/5"
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
