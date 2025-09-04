"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Gauge, MapPin, ChevronRight, Rocket } from "lucide-react";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Zap className="h-3.5 w-3.5" /> Nova geração: Wi‑Fi 6 + Fibra 100%
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Internet{" "}
            <span className="bg-gradient-to-r from-green-300 to-primary bg-clip-text text-transparent">
              ultrarrápida
            </span>{" "}
            para tudo que importa
          </h1>
          <p className="max-w-xl text-lg text-white/70">
            Planos estáveis, latência baixíssima e suporte humano 24/7.
            Conecte-se com a Velpro e sinta a diferença.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#cobertura"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-neutral-950 transition-colors hover:bg-white/90"
            >
              Consultar cobertura <MapPin className="h-4 w-4" />
            </a>
            <a
              href="#planos"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 font-medium text-white transition-colors hover:bg-white/5"
            >
              Ver planos <ChevronRight className="h-4 w-4" />
            </a>
          </div>
          <div className="flex items-center gap-6 pt-4 text-sm text-white/70">
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 shadow-2xl">
            <div className="h-full w-full rounded-2xl bg-[radial-gradient(ellipse_at_top_left,rgba(4,189,3,0.2),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(4,189,3,0.2),transparent_50%)] p-6">
              <div className="grid h-full grid-rows-3 gap-4">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-neutral-900/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/20">
                      <Rocket className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Velocidade média</p>
                      <p className="text-2xl font-bold">940 Mbps</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/70">Latência</p>
                    <p className="text-2xl font-bold">3 ms</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
                  <div className="mb-3 flex items-center justify-between text-sm text-white/70">
                    <span>Consumo mensal</span>
                    <span>2.3 TB</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-3/4 animate-pulse rounded-full bg-gradient-to-r from-green-400 to-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {["4K Streaming", "Jogos", "Trabalho"].map((tag) => (
                    <div
                      key={tag}
                      className="grid place-items-center rounded-xl border border-white/10 bg-neutral-900/60 p-4 text-center text-sm"
                    >
                      <div className="mb-2 grid h-8 w-8 place-items-center rounded-md bg-primary/15">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
