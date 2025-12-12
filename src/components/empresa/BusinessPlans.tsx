"use client";

import { useState, useEffect } from "react";
import { Check, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanDetailsSheet, ENTERPRISE_PLANS } from "@/components/shared/PlanDetailsSheet";
import { motion } from "framer-motion";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";

export function BusinessPlans() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    return (
        <section className="py-24 bg-[#050a05] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-green-500/10 blur-[120px] pointer-events-none" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ margin: "-10% 0px -10% 0px", amount: 0.2 }}
                        className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4"
                    >
                        Planos sob medida para seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-[#03bf03]">negócio</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ margin: "-10% 0px -10% 0px", amount: 0.2 }}
                        transition={{ delay: 0.1 }}
                        className="text-neutral-400 max-w-2xl mx-auto text-lg"
                    >
                        Conectividade empresarial com SLA garantido, IP fixo e suporte prioritário. <br className="hidden md:block" />
                        Escolha a potência ideal para sua operação.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 50 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ margin: "-10% 0px -10% 0px", amount: 0.1 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                    className="relative max-w-7xl mx-auto"
                >
                    <Carousel
                        opts={{ align: "center", loop: false }}
                        className="w-full"
                        setApi={setApi}
                    >
                        <CarouselContent className="-ml-4 md:-ml-8 items-stretch pt-24 pb-20">
                            {ENTERPRISE_PLANS.map((plan, index) => (
                                <CarouselItem key={index} className="pl-4 md:pl-8 basis-[85%] md:basis-1/2 lg:basis-1/3">
                                    <div className={`h-full relative group transition-all duration-500 hover:-translate-y-4
                                        ${plan.highlight
                                            ? 'scale-105 z-10'
                                            : 'scale-100 opacity-90 hover:opacity-100'
                                        }`}>

                                        {/* Running Border Animation */}
                                        <div className="absolute -inset-[1px] rounded-[1.5rem] overflow-hidden">
                                            <div className="absolute inset-0 bg-neutral-800" /> {/* Base border color */}
                                            <div className={`absolute top-[50%] left-[50%] w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 animate-[spin_4s_linear_infinite] bg-[conic-gradient(transparent_0deg,transparent_60deg,#22c55e_180deg,transparent_300deg,transparent_360deg)] transition-opacity duration-500 ${index === current - 1 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                        </div>

                                        {/* Inner Content Card */}
                                        <div className={`relative h-full flex flex-col p-6 rounded-[1.5rem] border backdrop-blur-xl transition-all duration-300
                                            bg-[#0f140f]/95 border-transparent shadow-xl
                                        `}>

                                            {plan.highlight && (
                                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#03bf03] text-black font-bold text-[10px] tracking-wider uppercase shadow-[0_0_20px_rgba(3,191,3,0.6)] animate-pulse whitespace-nowrap z-20">
                                                    Mais Vendido
                                                </div>
                                            )}

                                            <div className="mb-6 text-center relative z-10">
                                                <div className="flex items-center justify-center gap-2 mb-1">
                                                    <Wifi className="w-4 h-4 text-[#03bf03]" />
                                                    <span className="text-xs font-bold text-[#03bf03] tracking-widest uppercase">Empresarial</span>
                                                </div>
                                                <div className="flex items-baseline justify-center gap-1">
                                                    <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                                                        {plan.speed.replace(/\D/g, '')}
                                                    </h3>
                                                    <span className="text-lg font-bold text-[#03bf03]">MEGA</span>
                                                </div>
                                            </div>

                                            <div className="mb-6 flex items-end justify-center gap-1 pb-6 border-b border-white/5 relative z-10">
                                                <span className="text-neutral-400 text-sm mb-1">R$</span>
                                                <span className="text-4xl font-black text-white tracking-tight">{plan.price.toFixed(2).replace('.', ',').split(',')[0]}</span>
                                                <div className="flex flex-col text-left leading-none mb-1">
                                                    <span className="text-base font-bold text-white">,{plan.price.toFixed(2).split('.')[1]}</span>
                                                    <span className="text-neutral-500 text-[10px] uppercase font-bold">/mês</span>
                                                </div>
                                            </div>

                                            <ul className="space-y-3 mb-6 flex-grow relative z-10">
                                                {plan.features?.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-3 group/item">
                                                        <div className="mt-0.5 p-0.5 rounded-full bg-[#03bf03]/10 border border-[#03bf03]/20 group-hover/item:bg-[#03bf03]/20 transition-colors">
                                                            <Check className="w-3 h-3 text-[#03bf03]" />
                                                        </div>
                                                        <span className="text-neutral-300 text-xs font-medium group-hover/item:text-white transition-colors">
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="relative z-10 mt-auto">
                                                <PlanDetailsSheet plan={plan}>
                                                    <Button
                                                        className="w-full h-12 bg-[#03bf03] hover:bg-[#029e02] text-white font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(3,191,3,0.3)] hover:shadow-[0_0_30px_rgba(3,191,3,0.5)] transition-all duration-300 group-hover:scale-[1.02]"
                                                    >
                                                        CONTRATAR
                                                    </Button>
                                                </PlanDetailsSheet>
                                            </div>

                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* Pagination Dots */}
                        <div className="flex justify-center gap-3 mt-8">
                            {Array.from({ length: count }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`h-2.5 rounded-full transition-all duration-300 
                    ${i + 1 === current
                                            ? 'w-10 bg-[#03bf03] shadow-[0_0_10px_rgba(3,191,3,0.5)]'
                                            : 'w-2.5 bg-neutral-800 hover:bg-neutral-600'
                                        }`}
                                    onClick={() => api?.scrollTo(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>

                        <CarouselPrevious className="flex -left-4 md:-left-12 bg-black/50 border-white/10 text-white hover:bg-[#03bf03] hover:border-[#03bf03]" />
                        <CarouselNext className="flex -right-4 md:-right-12 bg-black/50 border-white/10 text-white hover:bg-[#03bf03] hover:border-[#03bf03]" />
                    </Carousel>
                </motion.div>
            </div>
        </section >
    )
}
