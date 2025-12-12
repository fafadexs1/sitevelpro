"use client";

import { motion } from "framer-motion";
import { Building2, Briefcase, Globe2, BarChart3, PieChart } from "lucide-react";

// Placeholder logos using Lucide icons for now, can be replaced with real images
const companies = [
    { name: "TechCorp", icon: Building2 },
    { name: "GlobalSol", icon: Globe2 },
    { name: "FinanceFlow", icon: BarChart3 },
    { name: "InnovateX", icon: Briefcase },
    { name: "DataPeak", icon: PieChart },
    { name: "TechCorp", icon: Building2 },
    { name: "GlobalSol", icon: Globe2 },
    { name: "FinanceFlow", icon: BarChart3 },
    { name: "InnovateX", icon: Briefcase },
    { name: "DataPeak", icon: PieChart },
];

export function TrustedCompanies() {
    return (
        <section className="py-12 bg-neutral-950 border-y border-white/5 overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center">
                <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">
                    Empresas que confiam na nossa conexão
                </p>
            </div>

            <div className="relative flex w-full">
                {/* Gradients for smooth fade in/out */}
                <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-neutral-950 to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-neutral-950 to-transparent" />

                <motion.div
                    className="flex gap-12 md:gap-24 items-center whitespace-nowrap"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 20,
                    }}
                >
                    {companies.map((company, i) => (
                        <div key={i} className="flex items-center gap-3 opacity-30 hover:opacity-80 transition-opacity cursor-pointer">
                            <company.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            <span className="text-xl md:text-2xl font-bold text-white">{company.name}</span>
                        </div>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {companies.map((company, i) => (
                        <div key={`dup-${i}`} className="flex items-center gap-3 opacity-30 hover:opacity-80 transition-opacity cursor-pointer">
                            <company.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            <span className="text-xl md:text-2xl font-bold text-white">{company.name}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
