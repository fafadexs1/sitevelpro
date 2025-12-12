"use client";

import { motion } from "framer-motion";
import { Wifi, Rocket, HeadphonesIcon, Tv, Zap } from "lucide-react";

const BentoCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ margin: "-10% 0px -10% 0px", amount: 0.2 }}
    transition={{ duration: 0.6, delay, type: "spring", bounce: 0.3 }}
    className={`group relative overflow-hidden rounded-3xl bg-neutral-900/80 border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300 ${className}`}
  >
    {/* Hover Gradient Bloom */}
    <div className="absolute -inset-px bg-gradient-to-br from-green-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

    <div className="relative z-10 h-full flex flex-col">
      {children}
    </div>
  </motion.div>
);

export function Advantages() {
  return (
    <section className="py-24 bg-neutral-950 relative overflow-hidden">
      {/* Background noise/texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Por que a <span className="text-green-500">Velpro</span> é diferente?
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            Não entregamos apenas internet. Entregamos uma experiência de conexão superior, pensada em cada detalhe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4 md:h-[800px]">

          {/* Card 1: Main Feature (Fiber) - Large Square */}
          <BentoCard className="md:col-span-2 md:row-span-2 flex flex-col justify-between bg-gradient-to-br from-green-950/50 to-neutral-900">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">100% Fibra Óptica de Ponta a Ponta</h3>
              <p className="text-neutral-400">
                Tecnologia FTTH (Fiber to the Home). A fibra entra direto na sua casa, garantindo estabilidade total sem interferências eletromagnéticas.
              </p>
            </div>
            {/* Abstract visual */}
            <div className="h-32 w-full rounded-2xl bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 relative overflow-hidden mt-4 group-hover:scale-[1.02] transition-transform">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(34,197,94,0.2),transparent)] animate-[shimmer_2s_infinite]" />
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-green-500/30" />
            </div>
          </BentoCard>

          {/* Card 2: Wifi 6 (Wide) */}
          <BentoCard className="md:col-span-2 md:row-span-1" delay={0.1}>
            <div className="flex flex-col md:flex-row items-center gap-6 h-full">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-bold text-green-500 uppercase tracking-wider">Novo Padrão</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Roteadores WiFi 6</h3>
                <p className="text-neutral-400 text-sm">
                  Maior alcance, menos interferência e capacidade para conectar dezenas de dispositivos simultaneamente sem travar.
                </p>
              </div>
              <div className="w-full md:w-1/3 aspect-square md:aspect-auto h-24 rounded-full bg-green-500/5 blur-2xl animate-pulse" />
            </div>
          </BentoCard>

          {/* Card 3: Support (Tall) */}
          <BentoCard className="md:col-span-1 md:row-span-2" delay={0.2}>
            <div className="h-full flex flex-col">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                <HeadphonesIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Suporte Humanizado</h3>
              <p className="text-neutral-400 text-sm mb-4 flex-grow">
                Nada de robôs te enrolando. Atendimento rápido e técnico, direto ao ponto.
              </p>
              <div className="mt-auto px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                <span className="text-green-400 font-bold text-sm">Suporte Especializado</span>
              </div>
            </div>
          </BentoCard>

          {/* Card 4: Streaming/Apps */}
          <BentoCard className="md:col-span-1 md:row-span-2 bg-gradient-to-b from-purple-900/20 to-neutral-900" delay={0.3}>
            <div className="h-full flex flex-col">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <Tv className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Apps Opcionais</h3>
              <p className="text-neutral-400 text-sm mb-6">
                Turbine seu plano com os melhores apps de filmes, séries e esportes. Você escolhe o que assistir.
              </p>
            </div>
          </BentoCard>

          {/* Card 5: Stability/SLA */}
          <BentoCard className="md:col-span-2 md:row-span-1" delay={0.4}>
            <div className="flex items-center gap-4 h-full">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <Zap className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Instalação Grátis e Rápida</h3>
                <p className="text-neutral-400 text-sm">
                  Nossa equipe técnica deixa tudo configurado para velocidade máxima.
                </p>
              </div>
            </div>
          </BentoCard>

        </div>
      </div>
    </section>
  );
}
