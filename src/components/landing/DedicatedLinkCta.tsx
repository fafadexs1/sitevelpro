"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export function DedicatedLinkCta() {
    return (
        <section className="border-t border-neutral-200 bg-[#F4F4F5] py-16">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45 }}
                    className="flex justify-center"
                >
                    <Button
                        asChild
                        className="group relative h-auto w-full max-w-sm overflow-hidden rounded-2xl border border-[#03BF03]/25 bg-white p-0 text-neutral-950 shadow-[0_16px_42px_-28px_rgba(3,191,3,0.75)] transition-all duration-300 hover:border-[#03BF03]/45 hover:bg-white hover:shadow-[0_22px_54px_-30px_rgba(3,191,3,0.85)] md:max-w-2xl"
                    >
                        <a href="/empresa" className="flex items-center gap-4 px-5 py-5 md:gap-6 md:px-8 md:py-6">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#03BF03]/20 bg-[#03BF03]/10 text-[#03BF03] md:h-12 md:w-12">
                                <Zap className="h-5 w-5 fill-current md:h-6 md:w-6" />
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col text-left">
                                <span className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#03BF03] md:text-xs">
                                    Solução empresarial
                                </span>
                                <span className="text-base font-black leading-tight text-neutral-950 md:text-2xl">
                                    Contratar link dedicado
                                </span>
                            </div>

                            <div className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#03BF03]/20 text-[#03BF03] transition-colors group-hover:bg-[#03BF03] group-hover:text-white md:h-10 md:w-10">
                                <ArrowRight className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:rotate-0 md:h-5 md:w-5" />
                            </div>

                            <div className="absolute inset-0 flex h-full w-full justify-center opacity-0 [transform:skew(-12deg)_translateX(-100%)] group-hover:opacity-100 group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                                <div className="relative h-full w-20 bg-[#03BF03]/10" />
                            </div>
                        </a>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
