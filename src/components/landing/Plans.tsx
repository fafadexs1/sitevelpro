

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ChannelLogos } from "./ChannelLogos";
import { Skeleton } from "@/components/ui/skeleton";

export type Plan = {
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

// Hardcoded Enterprise Plans to match BusinessPlans.tsx
const ENTERPRISE_PLANS: Plan[] = [
  {
    id: 'ent-500',
    type: 'empresarial',
    speed: '500 MEGA',
    upload_speed: null,
    download_speed: null,
    price: 99.90,
    original_price: 109.90,
    first_month_price: null,
    features: ["Wifi 6 Up", "Instalação grátis", "Suporte Prioritário"],
    highlight: false,
    has_tv: false,
    featured_channel_ids: [],
    whatsapp_number: '5508003810404',
    whatsapp_message: 'Olá! Tenho interesse no plano Empresarial de 500 MEGA.',
    conditions: null
  },
  {
    id: 'ent-700',
    type: 'empresarial',
    speed: '700 MEGA',
    upload_speed: null,
    download_speed: null,
    price: 129.90,
    original_price: 139.90,
    first_month_price: null,
    features: ["Wifi 6 Up", "Instalação grátis", "Suporte Premium 24/7", "IP Dinâmico"],
    highlight: true,
    has_tv: false,
    featured_channel_ids: [],
    whatsapp_number: '5508003810404',
    whatsapp_message: 'Olá! Tenho interesse no plano Empresarial de 700 MEGA.',
    conditions: null
  },
  {
    id: 'ent-900',
    type: 'empresarial',
    speed: '900 MEGA',
    upload_speed: null,
    download_speed: null,
    price: 169.90,
    original_price: 179.90,
    first_month_price: null,
    features: ["Wifi 6 Up", "Instalação grátis", "SLA Garantido", "Gestor de Conta"],
    highlight: false,
    has_tv: false,
    featured_channel_ids: [],
    whatsapp_number: '5508003810404',
    whatsapp_message: 'Olá! Tenho interesse no plano Empresarial de 900 MEGA.',
    conditions: null
  }
];

const addons = [
  { name: "IP Fixo", price: "50,00", icon: Server }, // Using Server as placeholder for Globe/Zap/Shield if imports unavailable
  { name: "Upload 50%", price: "9,90", icon: Upload },
  { name: "Filtro de Conteúdo", price: "9,90", icon: Shield },
  { name: "Garantia de Banda Monitorada", price: "Consulte", icon: Server },
];

const PlanDetailsSheet = ({ plan, children }: { plan: Plan, children: React.ReactNode }) => {
  const isEmpresarial = plan.type === 'empresarial';
  const bgColor = isEmpresarial ? "bg-neutral-950" : "bg-white";
  const textColor = isEmpresarial ? "text-white" : "text-neutral-900";
  const subTextColor = isEmpresarial ? "text-neutral-400" : "text-neutral-500";
  const borderColor = isEmpresarial ? "border-white/5" : "border-neutral-200";
  const cardBg = isEmpresarial ? "bg-neutral-900/50 border-white/5" : "bg-neutral-50 border-neutral-100";

  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Toggle addon selection
  const toggleAddon = (addonName: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonName)
        ? prev.filter(a => a !== addonName)
        : [...prev, addonName]
    );
  };

  // Generate WhatsApp Link with Addons
  const getWhatsappLink = () => {
    let message = plan.whatsapp_message || '';

    if (isEmpresarial && selectedAddons.length > 0) {
      message += `\n\nTenho interesse também nos adicionais:\n${selectedAddons.map(a => `- ${a}`).join('\n')}`;
    }

    return `https://wa.me/${plan.whatsapp_number}?text=${encodeURIComponent(message)}`;
  };

  // Helper to format the condition text
  const formatConditions = (text: string) => {
    // Split by common dividers used in legal text
    return text.split(/(?<=[.!?])\s+(?=[A-Z])|(?=📌)|(?=♦)|(?=•)|(?=Obs:)/g).map((part, index) => {
      const trimmed = part.trim();
      if (!trimmed) return null;
      return (
        <p key={index} className={`mb-1.5 ${trimmed.length < 50 ? 'font-medium' : ''}`}>
          {trimmed}
        </p>
      );
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className={`w-[400px] sm:w-[540px] border-l ${borderColor} ${bgColor} ${textColor} overflow-y-auto z-[9999] p-0 flex flex-col h-full`}>
        <SheetHeader className="p-6 pb-2 text-left shrink-0">
          <SheetTitle className={`text-xl font-bold flex items-center gap-2 ${textColor}`}>
            Detalhes do Plano
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-4">
          {/* Main Card - Compact */}
          <div className={`p-5 rounded-2xl border ${cardBg} relative overflow-hidden shrink-0`}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <Wifi className={`w-24 h-24 ${isEmpresarial ? 'text-white' : 'text-neutral-900'}`} />
            </div>
            <div className="flex flex-col gap-0.5 mb-4 relative z-10">
              <span className="text-xs text-green-500 font-bold tracking-wider uppercase">Plano Selecionado</span>
              <h3 className={`text-4xl font-black ${textColor}`}>{plan.speed.replace(/\D/g, '')} MEGA</h3>
            </div>

            <Separator className={`${isEmpresarial ? 'bg-white/5' : 'bg-neutral-200'} my-4`} />

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative z-10">
              {plan.features?.map(f => {
                const { Icon, text } = getFeatureIcon(f);
                return (
                  <li key={f} className={`flex items-center gap-2 text-sm ${isEmpresarial ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    <Icon className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="line-clamp-1">{text}</span>
                  </li>
                );
              })}
              <li className={`flex items-center gap-2 text-sm ${isEmpresarial ? 'text-neutral-300' : 'text-neutral-600'}`}>
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                <span className="line-clamp-1">Link 100% Fibra Óptica</span>
              </li>
              {!isEmpresarial && plan.download_speed && (
                <li className="flex items-center gap-2 text-sm text-neutral-600">
                  <Download className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="line-clamp-1">Download {plan.download_speed}</span>
                </li>
              )}
              {!isEmpresarial && plan.upload_speed && (
                <li className="flex items-center gap-2 text-sm text-neutral-600">
                  <Upload className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="line-clamp-1">Upload {plan.upload_speed}</span>
                </li>
              )}
            </ul>

            <div className={`mt-4 pt-4 border-t ${isEmpresarial ? 'border-white/5' : 'border-neutral-200'} flex flex-col gap-1`}>
              {plan.first_month_price ? (
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="flex items-center gap-1.5 mb-1 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-yellow-600 uppercase tracking-wide">1º Mês Por</span>
                  </div>
                  <div className={`text-4xl font-black ${textColor} leading-tight`}>
                    R$ {formatBRL(plan.first_month_price)}
                  </div>
                  <div className={`text-xs ${subTextColor} mt-1 font-medium`}>
                    Após, R$ {formatBRL(plan.price)}/mês
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full py-1">
                  <div className={`text-sm font-medium ${subTextColor}`}>Mensalidade</div>
                  <div className="flex flex-col items-end">
                    {plan.original_price && (
                      <span className={`text-xs line-through ${subTextColor}`}>
                        De R$ {formatBRL(plan.original_price)}
                      </span>
                    )}
                    <div className={`text-3xl font-black ${textColor} leading-none`}>
                      R$ {formatBRL(plan.price)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isEmpresarial && (
            <div className="shrink-0">
              <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${textColor}`}>
                Adicionais (Selecione)
              </h4>
              <div className="flex flex-col gap-2">
                {addons.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.name);
                  return (
                    <div
                      key={addon.name}
                      onClick={() => toggleAddon(addon.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200
                        ${isSelected
                          ? 'bg-green-500/10 border-green-500/50'
                          : `${isEmpresarial ? 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]' : 'border-neutral-200'}`
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                          ${isSelected ? 'bg-green-500 border-green-500' : 'border-neutral-600'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-md ${isEmpresarial ? 'bg-neutral-900' : 'bg-neutral-100'} text-green-500`}>
                            <addon.icon className="w-4 h-4" />
                          </div>
                          <p className={`text-sm font-medium ${isSelected ? 'text-green-500' : textColor}`}>{addon.name}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${isSelected ? 'text-green-500' : 'text-neutral-500'}`}>
                        {addon.price === 'Consulte' ? 'Consulte' : `+ ${addon.price}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conditions Section - Scrollable if needed */}
          {plan.conditions && (
            <div className={`p-3 rounded-xl border ${isEmpresarial ? 'border-white/5 bg-white/[0.02]' : 'border-neutral-100 bg-neutral-50'}`}>
              <h4 className={`font-semibold text-xs mb-2 ${textColor} flex items-center gap-2 uppercase tracking-wider opacity-80`}>
                <div className="w-1 h-3 bg-green-500 rounded-full" />
                Condições da Oferta
              </h4>
              <div className={`text-[11px] leading-relaxed ${subTextColor} space-y-1`}>
                {formatConditions(plan.conditions)}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Fixed at bottom */}
        <div className={`p-6 pt-2 mt-auto border-t ${isEmpresarial ? 'border-white/5' : 'border-neutral-100'} bg-transparent sm:bg-transparent`}>
          <div className="space-y-2">
            {!isEmpresarial ? (
              <Button className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition-all" asChild>
                <Link href="/assinar">
                  Contratar pelo Site
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-lg transition-all" asChild>
                <a href={getWhatsappLink()} target="_blank" rel="noopener noreferrer">
                  <Phone className="w-4 h-4 mr-2" />
                  Contratar Agora
                  {selectedAddons.length > 0 && <span className="ml-1 text-xs font-normal opacity-80">({selectedAddons.length} opcionais)</span>}
                </a>
              </Button>
            )}

            {!isEmpresarial && (
              <Button variant="outline" className={`w-full h-10 text-sm font-semibold ${textColor} border-border hover:bg-neutral-100`} asChild>
                <a href={`https://wa.me/${plan.whatsapp_number || '5508003810404'}?text=${encodeURIComponent(plan.whatsapp_message || 'Olá, tenho interesse neste plano.')}`} target="_blank" rel="noopener noreferrer">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Falar no WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
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

export function Plans({ city, plans }: PlansProps & { plans: Plan[] }) {
  const [planType, setPlanType] = useState<"residencial" | "empresarial">("residencial");
  const [api, setApi] = useState<CarouselApi>()

  // Use DB plans for residencial, Hardcoded for empresarial
  const currentPlans = planType === 'empresarial' ? ENTERPRISE_PLANS : plans.filter(p => p.type === planType);

  const PlanCard = ({ plan, index }: { plan: Plan, index: number }) => {
    const slug = generatePlanSlug(plan);
    const planName = `${plan.speed}`;
    const priceBRL = formatBRL(plan.price);
    const firstMonthPriceBRL = plan.first_month_price ? formatBRL(plan.first_month_price) : null;
    const whatsappMessage = plan.whatsapp_message?.replace('{{VELOCIDADE}}', plan.speed) || `Olá, gostaria de mais informações sobre o plano de ${plan.speed}.`;
    const whatsappUrl = `https://wa.me/${plan.whatsapp_number}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
      <motion.div
        key={`${planType}-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className={cn(
          "relative flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
          plan.highlight
            ? "bg-gradient-to-b from-card to-card/95 border-2 border-[#03bf03] shadow-[0_10px_40px_-10px_rgba(3,191,3,0.3)]"
            : "bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:border-primary/30"
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
      </motion.div>
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


