"use client";

import { Laptop, Smartphone, Tablet, Tv, Wifi } from "lucide-react";

export function Mesh() {
    return (
        <section className="py-24 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-t border-white/5 relative overflow-hidden">
            {/* Background Mesh Gradients */}
            <div className="absolute top-0 right-0 hidden h-[500px] w-[500px] rounded-full bg-[#03BF03]/5 blur-[128px] pointer-events-none sm:block" />
            <div className="absolute bottom-0 left-0 hidden h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[128px] pointer-events-none sm:block" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Content */}
                    <div className="flex-1 space-y-8">
                        <div className="inline-block">
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#03BF03]/10 border border-[#03BF03]/20 mb-6 w-fit">
                                <Wifi className="w-4 h-4 text-[#03BF03]" />
                                <span className="text-xs font-bold text-[#03BF03] uppercase tracking-wider">Wi-Fi Mesh Inteligente</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                Sinal forte em<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#03BF03] to-[#03BF03]">
                                    todos os cômodos
                                </span>
                            </h2>
                        </div>

                        <p className="text-lg text-neutral-400 leading-relaxed max-w-xl">
                            Esqueça as zonas mortas. Nossa tecnologia Mesh cria uma malha única de conexão que cobre sua casa inteira,
                            garantindo que seus dispositivos estejam sempre conectados ao ponto mais forte, sem interrupções.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                            {[
                                { title: "Roaming Automático", desc: "Mova-se pela casa sem queda de sinal", icon: Smartphone },
                                { title: "Cobertura Total", desc: "Do quarto ao quintal, conexão máxima", icon: Wifi },
                                { title: "Conexão Estável", desc: "Ideal para reuniões e aulas online", icon: Laptop },
                                { title: "Smart Home", desc: "Conecte dezenas de dispositivos", icon: Tv },
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#03BF03]/30 transition-colors group"
                                >
                                    <div className="p-2.5 rounded-lg bg-[#03BF03]/10 group-hover:bg-[#03BF03]/20 transition-colors">
                                        <feature.icon className="w-5 h-5 text-[#03BF03]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm mb-1">{feature.title}</h3>
                                        <p className="text-xs text-neutral-400 leading-snug">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual Representation */}
                    <div className="flex-1 w-full flex justify-center lg:justify-end relative">
                        <div className="mesh-scene relative w-full max-w-[500px] aspect-square flex items-center justify-center overflow-hidden rounded-[2rem] sm:overflow-visible sm:rounded-none">
                            <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle,rgba(3,191,3,0.13)_0%,rgba(3,191,3,0.04)_34%,transparent_66%)]" />
                            <div className="mesh-sweep absolute inset-0 rounded-full" />

                            {/* Central Node */}
                            <div className="mesh-router z-20 w-32 h-32 bg-neutral-900 rounded-full border-4 border-[#03BF03] shadow-[0_0_44px_rgba(3,191,3,0.18)] flex items-center justify-center relative">
                                <div className="absolute inset-0 rounded-full border border-white/15" />
                                <div className="absolute inset-[-14px] rounded-full border border-[#03BF03]/20" />
                                <Wifi className="w-12 h-12 text-[#03BF03]" />
                                {[0, 1, 2].map((dot) => (
                                    <span
                                        key={dot}
                                        className="mesh-data-dot"
                                        style={{ "--mesh-dot-delay": `${dot * 0.9}s` } as React.CSSProperties}
                                    />
                                ))}
                            </div>

                            {/* Orbit Container */}
                            <div className="mesh-orbit absolute inset-0">
                                {/* Orbiting Devices */}
                                {[
                                    { Icon: Laptop, angle: 0 },
                                    { Icon: Smartphone, angle: 90 },
                                    { Icon: Tablet, angle: 180 },
                                    { Icon: Tv, angle: 270 },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="mesh-device absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8"
                                        style={{ "--mesh-angle": `${item.angle}deg` } as React.CSSProperties}
                                    >
                                        <div className="mesh-device-card w-full h-full bg-neutral-800 rounded-2xl border border-white/10 flex items-center justify-center shadow-lg relative">
                                            <item.Icon className="w-6 h-6 text-neutral-400" />
                                            {/* Signal Line (Dashed) */}
                                            <div className="mesh-link absolute top-1/2 right-full h-px origin-right" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pulse Rings */}
                            {[1, 2, 3].map((ring) => (
                                <div
                                    key={ring}
                                    className="mesh-ring absolute top-1/2 left-1/2 border border-[#03BF03]/10 rounded-full pointer-events-none"
                                    style={{
                                        width: `${ring * 200 + 100}px`,
                                        height: `${ring * 200 + 100}px`,
                                        animationDelay: `${(ring - 1) * -1.2}s`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
