
"use client";

import React from 'react';
import { useContract } from "@/components/cliente/ContractProvider";
import { Pill } from "@/components/cliente/ui-helpers";
import { ChevronRight, Tv } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';

export default function PlanosPage() {
  const { contract } = useContract();

  if (!contract) return null;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="plans"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-1 text-sm text-muted-foreground">{contract.alias}</div>
          <div className="text-lg font-semibold">Plano atual</div>
          <div className="text-muted-foreground">{contract.currentPlan.name} — R$ {contract.currentPlan.price.toFixed(2)}/mês</div>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Tv className="h-4 w-4 text-primary"/> {contract.currentPlan.tvPack.name} • {contract.currentPlan.tvPack.channels}+ canais</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">{contract.currentPlan.benefits.map(b=> <Pill key={b}>{b}</Pill>)}</div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[{ name: "100 Mega + TV Start", price: 79.9, tag: "Econômico" }, { name: "500 Mega + TV Max", price: 129.9, tag: "Performance" }, { name: "1 Giga + TV Ultra", price: 199.9, tag: "Premium" }].map((p) => (
              <div key={p.name} className="rounded-xl border border-border bg-secondary p-4">
                <div className="mb-1 text-xs text-muted-foreground">{p.tag}</div>
                <div className="text-lg font-semibold">{p.name}</div>
                <div className="text-muted-foreground">R$ {p.price.toFixed(2)} / mês</div>
                <button id={`upgrade-plan-${p.name.replace(/\s/g, '-')}`} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90">
                  Solicitar upgrade <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
