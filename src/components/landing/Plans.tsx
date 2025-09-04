"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gauge, Check, ChevronRight } from "lucide-react";

export function Plans() {
  const [planType, setPlanType] = useState<"residencial" | "empresarial">("residencial");

  const plans = useMemo(() => {
    return planType === "residencial"
      ? [
          { speed: "100 Mega", price: 79.9, features: ["Wi‑Fi 6 incluso", "Instalação rápida", "Suporte 24/7"], highlight: false },
          { speed: "300 Mega", price: 99.9, features: ["Roteador Wi‑Fi 6", "Streaming 4K", "Teletrabalho estável"], highlight: true },
          { speed: "500 Mega", price: 129.9, features: ["Latência ultrabaixa", "Jogos online", "Backup em nuvem"], highlight: false },
          { speed: "1 Giga", price: 199.9, features: ["Link premium", "IP público opcional", "Suporte VIP"], highlight: false },
        ]
      : [
          { speed: "300 Mega", price: 149.9, features: ["SLA comercial", "Ativação express", "Gateway Wi‑Fi 6 Pro"], highlight: false },
          { speed: "500 Mega", price: 219.9, features: ["Prioridade de atendimento", "IP Fixo opcional", "Wi‑Fi Mesh"], highlight: true },
          { speed: "1 Giga", price: 359.9, features: ["SLA 99,9%", "Suporte dedicado", "QoS avançada"], highlight: false },
          { speed: "2 Giga", price: 699.9, features: ["Backbone redundante", "Roteamento BGP", "Atendimento 24/7 NOC"], highlight: false },
        ];
  }, [planType]);

  return (
    <section id="planos" className="border-t border-white/5 bg-neutral-950/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Escolha seu plano</h2>
            <p className="mt-2 text-white/70">Sem fidelidade, sem pegadinha. Instalação rápida e suporte humano 24/7.</p>
          </div>
          <div className="flex rounded-xl border border-white/10 p-1 text-sm">
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
                  planType === opt.k ? "bg-emerald-500 text-neutral-950" : "text-white/80 hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => (
            <motion.div
              key={`${planType}-${i}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`relative rounded-2xl border ${
                p.highlight ? "border-emerald-400/60" : "border-white/10"
              } bg-neutral-900/60 p-6 shadow-xl`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-6 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300">
                  Mais popular
                </div>
              )}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">{p.speed}</h3>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/15">
                  <Gauge className="h-5 w-5 text-emerald-300" />
                </div>
              </div>
              <div className="mb-4 flex items-end gap-1">
                <span className="text-4xl font-black">{p.price.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                <span className="pb-2 text-white/70">/mês</span>
              </div>
              <ul className="mb-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span className="text-white/80">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contato"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
              >
                Assinar <ChevronRight className="h-4 w-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
