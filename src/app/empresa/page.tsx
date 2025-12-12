
import { Header } from "@/components/landing/Header";
import dynamic from 'next/dynamic';
import { createClient } from "@/utils/supabase/server";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => mod.Footer));
const Contact = dynamic(() => import('@/components/landing/Contact').then(mod => mod.Contact));
const BusinessPlans = dynamic(() => import('@/components/empresa/BusinessPlans').then(mod => mod.BusinessPlans));
const TrustedCompanies = dynamic(() => import('@/components/empresa/TrustedCompanies').then(mod => mod.TrustedCompanies));
const EnterpriseFeatures = dynamic(() => import('@/components/empresa/EnterpriseFeatures').then(mod => mod.EnterpriseFeatures));

export const metadata = {
    title: 'Velpro Empresarial - Soluções para sua empresa',
    description: 'Internet dedicada, link ip, e soluções corporativas.',
};

export default async function EmpresaPage() {
    const supabase = await createClient();

    return (
        <div className="min-h-screen bg-white text-neutral-900">
            <Header />
            <main>
                <section className="relative w-full h-[75vh] flex items-center justify-center bg-neutral-50 overflow-hidden">

                    {/* Background with overlay */}
                    <div className="absolute inset-0 z-0">
                        {/* Light gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/40 z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
                        {/* Fallback pattern or image */}
                        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
                    </div>

                    <div className="relative z-20 container mx-auto px-4 md:px-6 mt-16">
                        <div className="max-w-3xl space-y-8">
                            <div className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-bold text-green-700 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <span className="flex h-2 w-2 rounded-full bg-green-600 mr-2 animate-pulse"></span>
                                Soluções Corporativas Premium
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-neutral-900 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                                Conectividade que <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-500">Impulsiona Resultados</span>
                            </h1>
                            <p className="text-xl text-neutral-600 max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                Link dedicado 100% fibra óptica, IP fixo e suporte que entende a criticidade do seu negócio. A infraestrutura definitiva para sua empresa.
                            </p>
                            <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                                <a href="#planos" className="inline-flex h-14 items-center justify-center rounded-xl bg-green-600 px-8 text-lg font-bold text-white shadow-[0_4px_20px_rgba(22,163,74,0.3)] transition-all hover:bg-green-700 hover:scale-105 hover:shadow-[0_6px_30px_rgba(22,163,74,0.4)]">
                                    Ver Planos
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </a>
                                <a href="https://wa.me/5508003810404" target="_blank" className="inline-flex h-14 items-center justify-center rounded-xl border border-neutral-200 bg-white px-8 text-lg font-medium text-neutral-900 shadow-sm transition-all hover:bg-neutral-50 hover:border-neutral-300">
                                    Falar com Especialista
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* <TrustedCompanies /> */}

                <section id="planos">
                    <BusinessPlans />
                </section>

                <EnterpriseFeatures />

                {/* Custom CTA Section */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-neutral-900 z-0">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-white/5 backdrop-blur-lg border border-white/10 rounded-[3rem] p-10 md:p-16">
                            <div className="max-w-xl">
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                                    Precisa de um projeto sob medida?
                                </h2>
                                <p className="text-lg text-neutral-300 leading-relaxed mb-8">
                                    Interligação de filiais (Lan-to-Lan), Wi-Fi de alta densidade para eventos ou galpões e soluções de redundância. Nossos engenheiros desenham a solução ideal para você.
                                </p>
                                <ul className="space-y-2 mb-8">
                                    {['Projetos Especiais', 'Redundância de Link', 'Wi-Fi Corporativo'].map(item => (
                                        <li key={item} className="flex items-center text-white font-medium">
                                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-3">
                                                <Check className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="shrink-0">
                                <Button className="h-16 px-10 rounded-2xl bg-white text-neutral-900 font-bold text-xl hover:bg-green-50 transition-all shadow-xl hover:scale-105" asChild>
                                    <a href="https://wa.me/5508003810404?text=Olá,%20gostaria%20de%20falar%20sobre%20um%20projeto%20especial%20para%20minha%20empresa." target="_blank">
                                        <MessageCircle className="w-6 h-6 mr-3" />
                                        Solicitar Orçamento
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
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
