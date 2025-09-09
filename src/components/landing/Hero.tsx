
"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Gauge, MapPin, ChevronRight } from "lucide-react";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Zap className="h-3.5 w-3.5" /> Nova geração: Wi‑Fi 6 + Fibra 100%
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Internet{" "}
            <span className="text-primary">
              ultrarrápida
            </span>{" "}
            para tudo que importa
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Planos estáveis, latência baixíssima e suporte que resolve de verdade.
            Conecte-se com a Velpro e sinta a diferença.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              id="hero-cta-cobertura"
              href="#planos"
              data-track-event="cta_click"
              data-track-prop-button-id="consultar-cobertura-hero"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Conhecer planos <ChevronRight className="h-4 w-4" />
            </a>
            <a
              id="hero-cta-vantagens"
              href="#vantagens"
              data-track-event="cta_click"
              data-track-prop-button-id="ver-vantagens-hero"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 font-medium text-foreground transition-colors hover:bg-accent"
            >
              Ver vantagens
            </a>
          </div>
          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Garantia de
              satisfação
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" /> Latência
              baixíssima
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
