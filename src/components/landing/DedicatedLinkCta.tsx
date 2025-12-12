"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";

export function DedicatedLinkCta() {
    return (
        <section className="py-16 bg-[#F4F4F5] border-t border-neutral-200">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                >
                    <Button
                        asChild
                        className="relative w-full max-w-sm md:max-w-2xl overflow-hidden bg-[#03bf03] hover:bg-[#029e02] text-white p-0 h-auto rounded-3xl shadow-[0_15px_40px_-10px_rgba(3,191,3,0.4)] hover:shadow-[0_20px_60px_-10px_rgba(3,191,3,0.6)] transition-all duration-300 group"
                    >
                        <a href="/empresa" className="flex flex-col md:flex-row items-center gap-4 md:gap-8 px-6 py-6 md:px-12 md:py-8">

                            {/* Icon Box */}
                            <div className="shrink-0 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white shadow-inner">
                                <Zap className="w-7 h-7 md:w-8 md:h-8 fill-current" />
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col text-center md:text-left">
                                <span className="text-xs md:text-sm font-bold text-green-100 uppercase tracking-wider mb-1">
                                    Solução Empresarial
                                </span>
                                <span className="text-xl md:text-3xl font-black leading-tight">
                                    CONTRATAR LINK DEDICADO
                                </span>
                            </div>

                            {/* Arrow Action */}
                            <div className="hidden md:flex shrink-0 w-12 h-12 rounded-full border-2 border-white/30 items-center justify-center group-hover:bg-white group-hover:text-[#03bf03] transition-colors ml-auto">
                                <ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>

                            {/* Shine Effect */}
                            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                                <div className="relative h-full w-24 bg-white/20"></div>
                            </div>
                        </a>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
