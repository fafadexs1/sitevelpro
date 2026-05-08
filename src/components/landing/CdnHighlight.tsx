"use client";

import { Activity, Globe, Server, Shield, Zap } from "lucide-react";

export function CdnHighlight() {
  const nodes = [
    { name: "Google GGC", icon: Globe, color: "text-cyan-300", position: "top-10 left-10 md:top-20 md:left-32" },
    { name: "Netflix OCA", icon: Server, color: "text-red-400", position: "top-10 right-10 md:top-20 md:right-32" },
    { name: "Facebook FNA", icon: Activity, color: "text-blue-400", position: "bottom-10 left-10 md:bottom-20 md:left-32" },
    { name: "Akamai CDN", icon: Shield, color: "text-amber-300", position: "bottom-10 right-10 md:bottom-20 md:right-32" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#07100d] py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(3,191,3,0.16),transparent_32%,rgba(34,211,238,0.12)_66%,transparent)]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#03BF03]/25 bg-[#03BF03]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#03BF03]">
            <Activity className="h-3 w-3" />
            Baixa latência
          </div>
          <h2 className="mb-4 text-3xl font-black tracking-tight text-white md:text-5xl">
            Conteúdo mais perto, resposta mais rápida
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-neutral-300">
            Conteúdo do Google, Netflix e Facebook hospedado dentro da nossa rede.
            <br className="hidden md:block" />
            Menos rotas, menos espera e mais estabilidade.
          </p>
        </div>

        <div className="relative mx-auto flex h-[400px] w-full max-w-5xl items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-neutral-950/70 backdrop-blur-sm md:h-[500px]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

          <svg className="absolute inset-0 z-0 h-full w-full pointer-events-none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#03BF03" stopOpacity="0" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.48" />
                <stop offset="100%" stopColor="#03BF03" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5 5" strokeOpacity="0.45" />
            <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5 5" strokeOpacity="0.45" />
            <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5 5" strokeOpacity="0.45" />
            <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5 5" strokeOpacity="0.45" />
          </svg>

          <div className="relative z-20 flex flex-col items-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-lg border-4 border-[#03BF03] bg-neutral-900 shadow-[0_0_60px_rgba(3,191,3,0.22)]">
              <div className="absolute inset-0 rounded-lg border border-white/15" />
              <Zap className="h-10 w-10 fill-current text-[#03BF03]" />
            </div>
          </div>

          {nodes.map((node) => (
            <div key={node.name} className={`absolute ${node.position} z-10 flex flex-col items-center gap-3`}>
              <div className="group flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-neutral-800/80 shadow-lg backdrop-blur transition-all hover:border-cyan-300/40 hover:shadow-cyan-300/10">
                <node.icon className={`h-8 w-8 ${node.color} opacity-80 transition-opacity group-hover:opacity-100`} />
              </div>
              <div className="rounded-full border border-white/5 bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-300 backdrop-blur-md">
                {node.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
