
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gauge, Check, ChevronRight, MessageCircle, Globe, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChannelLogos } from "./ChannelLogos";
import { createClient } from "@/utils/supabase/client";
import * as icons from "lucide-react";


type Plan = {
  id: string;
  type: 'residencial' | 'empresarial';
  speed: string;
  price: number;
  highlight: boolean;
  has_tv: boolean;
};

export function Plans() {
  const [planType, setPlanType] = useState<"residencial" | "empresarial">("residencial");
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          <div className="absolute -top-3 left-6 rounded-full border border-primary/50 bg-primary/10 px-2 py-0.5 text-xs text-primary">
            Mais popular
          </div>
        )}
        <div className="flex-grow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">{plan.speed}</h3>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15">
              <Gauge className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mb-4 flex items-end gap-1">
            <span className="text-4xl font-black">{(plan.price || 0).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            <span className="pb-2 text-white/70">/mês</span>
          </div>
          
          {plan.has_tv && <ChannelLogos />}

          {/* This section can be re-enabled later when features are stored */}
          {/* 
          <ul className="mb-6 space-y-2 text-sm">
            {(plan.features || []).map((f) => (
              <li key={f.text} className="flex items-start gap-2">
                <Icon name={f.icon} />
                <span className="text-white/80">{f.text}</span>
              </li>
            ))}
          </ul>
          */}
        </div>
        <Link href="/assinar">
          <Button
            asChild
            className="mt-auto w-full"
          >
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Assinar <ChevronRight className="h-4 w-4" />
            </span>
          </Button>
        </Link>
      </motion.div>
    )
  };

  return (
    <section id="planos" className="border-t border-white/5 bg-neutral-950/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 md:mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Escolha seu plano</h2>
            <p className="mt-2 text-white/70">Sem fidelidade, sem pegadinha. Instalação rápida e suporte humano 24/7.</p>
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
