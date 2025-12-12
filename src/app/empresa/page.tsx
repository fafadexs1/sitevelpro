
import { Header } from "@/components/landing/Header";
import dynamic from 'next/dynamic';
import { createClient } from "@/utils/supabase/server";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as motion from "framer-motion/client";

const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => mod.Footer));
const Contact = dynamic(() => import('@/components/landing/Contact').then(mod => mod.Contact));
const BusinessPlans = dynamic(() => import('@/components/empresa/BusinessPlans').then(mod => mod.BusinessPlans));
const DedicatedLink = dynamic(() => import('@/components/empresa/DedicatedLink').then(mod => mod.DedicatedLink));

const EnterpriseFeatures = dynamic(() => import('@/components/empresa/EnterpriseFeatures').then(mod => mod.EnterpriseFeatures));

export const metadata = {
    title: 'Velpro Empresarial - Soluções para sua empresa',
    description: 'Internet dedicada, link ip, e soluções corporativas.',
};

export default async function EmpresaPage() {
    const supabase = await createClient();

    return (
        <div className="min-h-screen bg-[#050a05] text-white selection:bg-green-500/30">
            <Header />
            <main>
                <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">

                    {/* Dark Premium Background */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-[#050a05]" />

                        {/* Optimized Background Image - Tech Abstract (Low opacity for texture) */}
                        <div className="absolute inset-0 bg-[url('/images/enterprise-hero.png')] bg-cover bg-center opacity-30 mix-blend-overlay" />

                        {/* Animated Gradients */}
                        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-green-900/20 rounded-full blur-[120px] animate-pulse duration-1000" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[100px]" />

                        {/* Mesh Grid Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
                    </div>

                    <div className="relative z-20 container mx-auto px-4 md:px-6">
                        <div className="max-w-4xl mx-auto text-center space-y-8">

                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-md mx-auto"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-bold text-green-400 tracking-wider uppercase">Velpro Business</span>
                            </motion.div>

                            {/* Main Title */}
                            <motion.h1
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
                                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.1]"
                            >
                                Conectividade <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600">
                                    Sem Limites
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed"
                            >
                                Infraestrutura de fibra óptica dedicada para empresas que não podem parar. Alta disponibilidade, IP fixo e suporte que fala a sua língua.
                            </motion.p>

                            {/* Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="flex flex-wrap items-center justify-center gap-4"
                            >
                                <a href="#planos" className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-xl bg-green-600 px-8 font-bold text-white shadow-2xl transition-all hover:bg-green-500 hover:scale-105 active:scale-95">
                                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                                        <div className="relative h-full w-8 bg-white/20"></div>
                                    </div>
                                    <span className="flex items-center gap-2">
                                        Ver Planos Corporativos
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </a>
                                <a href="https://wa.me/5508003810404" target="_blank" className="inline-flex h-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-8 font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20">
                                    Falar com Consultor
                                </a>
                            </motion.div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-neutral-500"
                    >
                        <div className="w-6 h-10 rounded-full border-2 border-neutral-700 flex items-start justify-center p-1">
                            <div className="w-1 h-3 bg-green-500 rounded-full" />
                        </div>
                    </motion.div>
                </section>

                <section id="planos">
                    <BusinessPlans />
                </section>

                <DedicatedLink />

                <EnterpriseFeatures />

                {/* Custom CTA Section - Dark Mode */}
                <section className="py-32 relative overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ margin: "-100px" }}
                            className="relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 bg-neutral-900/80 border border-white/10 backdrop-blur-2xl rounded-[3rem] p-10 md:p-20 shadow-2xl"
                        >
                            {/* Optimized Background Image - Server Room */}
                            <div className="absolute inset-0 bg-[url('/images/enterprise-noc.png')] bg-cover bg-center opacity-20 mix-blend-luminosity" />

                            {/* Glow Effect */}
                            <div className="absolute -top-[200px] -left-[200px] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px] pointer-events-none" />

                            <div className="max-w-xl relative z-10">
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                                    Projetos Especiais & <br />
                                    <span className="text-green-400">Redundância</span>
                                </h2>
                                <p className="text-lg text-neutral-400 leading-relaxed mb-8">
                                    Estamos prontos para atender a sua empresa com nosso link dedicado de alta performance.
                                </p>
                                <ul className="grid grid-cols-1 gap-3 mb-8">
                                    {['Link Dedicado de Backup', 'Eventos', 'IPs Fixos Adicionais'].map(item => (
                                        <li key={item} className="flex items-center text-neutral-300 font-medium bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3 text-green-400">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="shrink-0 relative z-10 w-full md:w-auto">
                                <Button className="w-full md:w-auto h-20 px-12 rounded-2xl bg-white text-neutral-950 font-black text-xl hover:bg-neutral-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105" asChild>
                                    <a href="https://wa.me/5508003810404?text=Olá,%20gostaria%20de%20falar%20sobre%20um%20projeto%20especial%20para%20minha%20empresa." target="_blank">
                                        <MessageCircle className="w-6 h-6 mr-3" />
                                        Solicitar Projeto
                                    </a>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>

            </main>
            <Footer className="border-neutral-200 bg-white text-neutral-600" />
        </div>
    );
}

function Check({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
