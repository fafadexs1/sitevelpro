"use client";

import { Shield, Zap, Headphones, Server, Clock, Activity, Lock } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        icon: Zap,
        title: "Link Dedicado",
        description: "Banda garantida e estabilidade total. Entregamos a velocidade ideal de acordo com a demanda específica do seu negócio.",
        color: "from-green-500 to-emerald-600",
        delay: 0
    },
    {
        icon: Clock,
        title: "SLA de 4 Horas",
        description: "Tempo máximo de reparo contratual. Nossa equipe técnica atua com prioridade absoluta para garantir que sua operação não pare.",
        color: "from-green-400 to-teal-500",
        delay: 0.1
    },
    {
        icon: Server,
        title: "IP Fixo Opcional",
        description: "Estabilidade total para seus servidores web, câmeras, VPNs e sistemas ERP. Endereçamento IPv4 e IPv6 nativo.",
        color: "from-emerald-500 to-green-600",
        delay: 0.2
    },
    {
        icon: Shield,
        title: "Melhores Rotas",
        description: "Rotas nacionais e internacionais otimizadas para garantir a menor latência e a melhor performance para suas aplicações.",
        color: "from-teal-500 to-emerald-500",
        delay: 0.3
    },
];

export function EnterpriseFeatures() {
    return (
        <section className="py-24 bg-neutral-950 relative overflow-hidden">
            {/* Background noise */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ margin: "-10% 0px -10% 0px", amount: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 mb-6"
                    >
                        <Lock className="w-3 h-3 text-neutral-400" />
                        <span className="text-xs font-bold text-neutral-400 tracking-widest uppercase">Segurança & Performance</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ margin: "-10% 0px -10% 0px", amount: 0.2 }}
                        className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight"
                    >
                        Por que grandes empresas <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">escolhem a Velpro?</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ margin: "-10% 0px -10% 0px", amount: 0.2 }}
                        transition={{ delay: 0.1 }}
                        className="text-neutral-400 text-lg leading-relaxed"
                    >
                        Muito mais que internet. Entregamos uma infraestrutura robusta, segura e gerenciada para suportar o crescimento crítico do seu negócio.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ margin: "-10% 0px -10% 0px", amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100 }}
            className="group relative p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-green-500/20 transition-all duration-500 hover:-translate-y-2"
        >
            {/* Hover Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />

            <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
                    {feature.title}
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed group-hover:text-neutral-300 transition-colors">
                    {feature.description}
                </p>
            </div>
        </motion.div>
    );
}
