"use client";

import { Shield, Zap, Headphones, Server, Clock, Activity } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        icon: Zap,
        title: "Link Dedicado 1:1",
        description: "Conexão exclusiva com garantia de 100% da banda contratada, tanto para download quanto para upload.",
        color: "from-green-500 to-green-600",
    },
    {
        icon: Clock,
        title: "SLA de 4 Horas",
        description: "Compromisso contratual de reparo em até 4 horas. Sua operação não pode parar, e nós garantimos isso.",
        color: "from-blue-500 to-blue-600",
    },
    {
        icon: Server,
        title: "IP Fixo Disponível",
        description: "Opção de IP fixo para servidores, acesso remoto, câmeras de segurança e sistemas de gestão (ERP). (Contratação opcional)",
        color: "from-purple-500 to-purple-600",
    },
    {
        icon: Headphones,
        title: "Gestor Exclusivo",
        description: "Atendimento direto com um gerente de contas que conhece o histórico e as necessidades da sua empresa.",
        color: "from-orange-500 to-orange-600",
    },
];

export function EnterpriseFeatures() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Blobs - lighter for white theme */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/40 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6">
                        Por que grandes empresas escolhem a Velpro?
                    </h2>
                    <p className="text-neutral-500 text-lg">
                        Muito mais que internet. Entregamos uma infraestrutura robusta, segura e gerenciada para suportar o crescimento do seu negócio.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group p-8 rounded-[2rem] bg-neutral-50 border border-neutral-100 hover:border-neutral-200 hover:bg-white hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Hover Gradient Effect - lighter */}
                            <div
                                className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${feature.color} transition-opacity duration-500`}
                            />

                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-black/5`}>
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>

                            <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-neutral-600 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
