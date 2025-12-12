"use client";

import { useState, useEffect } from "react";
import { Check, Wifi, Globe, Zap, Shield, ChevronRight, Server, Phone, Info } from "lucide-react";
import { motion } from "framer-motion";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";

const plans = [
    {
        speed: 500,
        price: "99,90",
        oldPrice: "109,90",
        features: ["Wifi 6 Up", "Instalação grátis", "Suporte Prioritário"],
        highlight: false,
    },
    {
        speed: 700,
        price: "129,90",
        oldPrice: "139,90",
        features: ["Wifi 6 Up", "Instalação grátis", "Suporte Premium 24/7", "IP Dinâmico"],
        highlight: true,
    },
    {
        speed: 900,
        price: "169,90",
        oldPrice: "179,90",
        features: ["Wifi 6 Up", "Instalação grátis", "SLA Garantido", "Gestor de Conta"],
        highlight: false,
    }
];

const addons = [
    { name: "IP Fixo", price: "50,00", icon: Globe },
    { name: "Upload 50%", price: "9,90", icon: Zap },
    { name: "Filtro de Conteúdo (Pornografia)", price: "9,90", icon: Shield },
    { name: "Garantia de Banda Monitorada", price: "Consulte", icon: Server },
];

export function BusinessPlans() {
    const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    return (
        <section className="py-24 bg-gradient-to-b from-green-950 via-neutral-950 to-neutral-950 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-900/10 rounded-full blur-[128px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <Badge variant="outline" className="mb-4 border-green-500/30 text-green-400 uppercase tracking-wider bg-green-500/5">
                        Planos Corporativos
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                        Velocidade que impulsiona o seu negócio
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Soluções dedicadas para empresas que não podem parar. Escolha o plano ideal para sua operação.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto px-4 md:px-8">
                    <Carousel
                        setApi={setApi}
                        opts={{
                            align: "center",
                            loop: false,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4 pb-4">
                            {plans.map((plan, index) => (
                                <CarouselItem key={plan.speed} className="pl-4 basis-[85%] md:basis-1/2 lg:basis-1/3">
                                    <div className="h-full pt-6 px-2">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`relative h-full flex flex-col items-center text-center rounded-[2.5rem] p-8 transition-all duration-500 group bg-white border-2 border-green-500 ${plan.highlight
                                                ? "shadow-[0_0_40px_-5px_rgba(34,197,94,0.3)] scale-[1.02] z-10"
                                                : "shadow-[0_0_20px_-10px_rgba(34,197,94,0.15)] hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.25)]"
                                                }`}
                                        >
                                            {plan.highlight && (
                                                <div className="absolute -top-4 w-full flex justify-center">
                                                    <div className="bg-green-500 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-green-500/30">
                                                        Mais Vendido
                                                    </div>
                                                </div>
                                            )}

                                            {/* SpeedHero - Scalable Typography */}
                                            <div className="mt-8 mb-4 relative">
                                                {/* Subtle background glow for the number */}
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-32 md:h-32 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-all duration-500" />

                                                <div className="relative z-10 flex flex-col items-center">
                                                    <span className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all">
                                                        {plan.speed}
                                                    </span>
                                                    <span className="text-[10px] sm:text-xs md:text-sm font-bold text-neutral-400 tracking-[0.5em] uppercase mt-2 ml-1">
                                                        MEGA
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Separator Line with Glow */}
                                            <div className="w-8 md:w-12 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent my-4 opacity-50" />

                                            {/* Header Price Area */}
                                            <div className="mb-8">
                                                <div className="flex items-start justify-center gap-1 text-neutral-900">
                                                    <span className="text-xs md:text-sm font-medium text-neutral-500 mt-2">R$</span>
                                                    <span className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter transition-all">
                                                        {plan.price.split(',')[0]}
                                                    </span>
                                                    <div className="flex flex-col text-left mt-1 md:mt-2">
                                                        <span className="text-lg md:text-xl font-bold">,{plan.price.split(',')[1]}</span>
                                                        <span className="text-[10px] md:text-xs text-neutral-500 -mt-0.5">/mês</span>
                                                    </div>
                                                </div>
                                                <span className="text-neutral-400 line-through text-xs md:text-sm font-medium block mt-1">
                                                    De R$ {plan.oldPrice}
                                                </span>
                                            </div>

                                            {/* Features List - Compact on small screens */}
                                            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-10 w-full text-left max-w-[180px] md:max-w-[200px] mx-auto">
                                                {plan.features.map((feature) => (
                                                    <li key={feature} className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-medium text-neutral-600">
                                                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                            <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-600" />
                                                        </div>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                            {/* Actions */}
                                            <div className="mt-auto w-full space-y-4">
                                                <Button className="w-full h-12 rounded-xl text-base font-bold bg-neutral-900 text-white hover:bg-green-600 hover:text-white hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all duration-300"
                                                    asChild
                                                >
                                                    <a href="https://wa.me/5508003810404?text=Olá!%20Tenho%20interesse%20no%20plano%20Empresarial%20de%20internet." target="_blank" rel="noopener noreferrer">
                                                        Contratar Agora
                                                    </a>
                                                </Button>

                                                <Sheet>
                                                    <SheetTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="w-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 text-xs uppercase tracking-wider font-medium h-auto py-2"
                                                            onClick={() => setSelectedPlan(plan)}
                                                        >
                                                            + detalhes e opcionais
                                                        </Button>
                                                    </SheetTrigger>
                                                    {/* Sheet Content Implementation Remains Same but Cleaned */}
                                                    <SheetContent className="w-[400px] sm:w-[540px] border-l border-white/5 bg-neutral-950 text-white overflow-y-auto">
                                                        <SheetHeader className="mb-8">
                                                            <SheetTitle className="text-2xl font-bold text-white flex items-center gap-3">
                                                                <Wifi className="w-6 h-6 text-green-500" />
                                                                Detalhes do Plano
                                                            </SheetTitle>
                                                            <SheetDescription className="text-neutral-400">
                                                                Confira tudo o que está incluso no pacote corporativo {plan.speed} Mega.
                                                            </SheetDescription>
                                                        </SheetHeader>

                                                        <div className="space-y-8">
                                                            <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/5 relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                                                    <Wifi className="w-40 h-40" />
                                                                </div>
                                                                <div className="flex flex-col gap-1 mb-6 relative z-10">
                                                                    <span className="text-sm text-green-400 font-bold tracking-wider uppercase">Plano Selecionado</span>
                                                                    <h3 className="text-5xl font-black text-white">{plan.speed} MEGA</h3>
                                                                </div>

                                                                <Separator className="bg-white/5 my-6" />

                                                                <ul className="grid gap-3 relative z-10">
                                                                    {plan.features.map(f => (
                                                                        <li key={f} className="flex items-center gap-3 text-neutral-300">
                                                                            <Check className="w-5 h-5 text-green-500" />
                                                                            <span>{f}</span>
                                                                        </li>
                                                                    ))}
                                                                    <li className="flex items-center gap-3 text-neutral-300">
                                                                        <Check className="w-5 h-5 text-green-500" />
                                                                        <span>Upload de Alta Performance</span>
                                                                    </li>
                                                                    <li className="flex items-center gap-3 text-neutral-300">
                                                                        <Check className="w-5 h-5 text-green-500" />
                                                                        <span>Link 100% Fibra Óptica</span>
                                                                    </li>
                                                                </ul>

                                                                <div className="mt-8 pt-6 border-t border-white/5 flex items-end justify-between">
                                                                    <div className="text-sm text-neutral-500">Valor mensal</div>
                                                                    <div className="text-3xl font-bold text-white">R$ {plan.price}</div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                                                                    Adicionais Disponíveis
                                                                </h4>
                                                                <div className="grid gap-3">
                                                                    {addons.map((addon) => (
                                                                        <div key={addon.name} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="p-2 rounded-lg bg-neutral-900 text-green-500">
                                                                                    <addon.icon className="w-5 h-5" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-medium text-white">{addon.name}</p>
                                                                                    <p className="text-xs text-neutral-500">Opcional</p>
                                                                                </div>
                                                                            </div>
                                                                            <span className="text-sm font-semibold text-green-400">
                                                                                {addon.price === 'Consulte' ? 'Consulte' : `+ R$ ${addon.price}`}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <Button className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] transition-all" asChild>
                                                                <a href={`https://wa.me/5508003810404?text=Olá!%20Gostaria%20de%20contratar%20o%20plano%20de%20${plan.speed}%20Mega%20para%20minha%20empresa.`} target="_blank" rel="noopener noreferrer">
                                                                    <Phone className="w-5 h-5 mr-2" />
                                                                    Contratar Agora
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </SheetContent>
                                                </Sheet>
                                            </div>
                                        </motion.div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="flex flex-col items-center gap-4 mt-8">
                            <div className="flex items-center gap-2">
                                <CarouselPrevious className="static translate-y-0 border-white/10 bg-neutral-900 text-white hover:bg-green-500 hover:border-green-500 hover:text-black transition-colors" />
                                <div className="flex gap-2 mx-4">
                                    {Array.from({ length: count }).map((_, index) => (
                                        <button
                                            key={index}
                                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === current - 1 ? "bg-green-500 w-8" : "bg-white/20 hover:bg-white/40"
                                                }`}
                                            onClick={() => api?.scrollTo(index)}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                                <CarouselNext className="static translate-y-0 border-white/10 bg-neutral-900 text-white hover:bg-green-500 hover:border-green-500 hover:text-black transition-colors" />
                            </div>
                            <p className="text-xs text-neutral-500 font-medium uppercase tracking-widest animate-pulse">
                                Arraste ou use as setas
                            </p>
                        </div>
                    </Carousel>
                </div>
            </div>
        </section>
    );
}
