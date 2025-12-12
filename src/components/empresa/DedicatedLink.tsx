"use client";

import { motion } from "framer-motion";
import { Network, Sliders, Target, TrendingUp } from "lucide-react";

export function DedicatedLink() {
    return (
        <section className="py-24 bg-neutral-950 relative overflow-hidden">
            {/* Visual Background Elements */}
            <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-green-900/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute left-0 bottom-1/4 w-[300px] h-[300px] bg-emerald-900/10 rounded-full blur-[96px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Text Content */}
                    <div className="flex-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20"
                        >
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-bold text-green-400 tracking-wider uppercase">Link Dedicado</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-white leading-[1.1]"
                        >
                            Sua empresa é única. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                                Sua conexão também deve ser.
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-neutral-400 leading-relaxed max-w-xl"
                        >
                            Não acreditamos em soluções de prateleira para operações críticas. Desenvolvemos o projeto do seu Link Dedicado baseados estritamente na <strong>demanda real do seu negócio</strong>.
                        </motion.p>

                        <div className="space-y-6">
                            <FeatureItem
                                icon={Target}
                                title="Análise de Demanda"
                                description="Avaliamos o consumo de dados, picos de tráfego e tipos de aplicação da sua empresa para dimensionar o link exato."
                                delay={0.3}
                            />
                            <FeatureItem
                                icon={Sliders}
                                title="100% Personalizável"
                                description="Precisa de mais upload para backups? Baixa latência para VoIP? Configuramos a rota e a banda para sua necessidade."
                                delay={0.4}
                            />
                            <FeatureItem
                                icon={Network}
                                title="Escalabilidade Real"
                                description="Sua demanda cresceu? Ajustamos sua banda com agilidade, sem burocracia e sem necessidade de troca física de equipamentos."
                                delay={0.5}
                            />
                        </div>
                    </div>

                    {/* Visual/Graphic Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex-1 w-full max-w-lg lg:max-w-none"
                    >
                        <div className="relative aspect-square md:aspect-[4/3] rounded-3xl bg-neutral-900 border border-white/5 overflow-hidden p-8 flex items-center justify-center group">
                            {/* Abstract 'Connection' Visualization */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem]" />

                            <div className="relative z-10 w-full max-w-sm">
                                {/* Central Hub */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
                                <div className="relative bg-neutral-950 border border-green-500/30 p-6 rounded-2xl shadow-2xl backdrop-blur-xl mb-4 text-center">
                                    <div className="text-3xl font-bold text-white mb-1">Sua Empresa</div>
                                    <div className="text-xs text-green-400 font-mono">100% CONECTADA</div>
                                </div>

                                {/* Floating 'Demand' Cards */}
                                <div className="flex justify-between gap-4">
                                    <DemandCard label="VoIP / Vídeo" value="Prioridade Alta" />
                                    <DemandCard label="Cloud / ERP" value="Estabilidade" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function FeatureItem({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="flex gap-4 group"
        >
            <div className="shrink-0 w-12 h-12 rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-center group-hover:border-green-500/30 transition-colors">
                <Icon className="w-6 h-6 text-green-500" />
            </div>
            <div>
                <h3 className="font-bold text-white text-lg mb-1">{title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
            </div>
        </motion.div>
    )
}

function DemandCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex-1 bg-neutral-800/50 border border-white/10 rounded-xl p-4 text-center transform transition-transform duration-500 hover:scale-105 hover:border-green-500/30">
            <div className="text-xs text-neutral-400 mb-1">{label}</div>
            <div className="text-sm font-bold text-white">{value}</div>
        </div>
    )
}
