"use client";

import { motion } from "framer-motion";
import { Laptop, Smartphone, Tablet, Tv, Wifi } from "lucide-react";

export function Mesh() {
    return (
        <section className="py-24 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-t border-white/5 relative overflow-hidden">
            {/* Background Mesh Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[128px] pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Content */}
                    <div className="flex-1 space-y-8">
                        <div className="inline-block">
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-950/30 border border-green-500/20 mb-6 w-fit">
                                <Wifi className="w-4 h-4 text-green-400" />
                                <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Wi-Fi Mesh Inteligente</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                Sinal forte em<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
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
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ margin: "-10% 0px -10% 0px", amount: 0.2 }}
                                    transition={{ delay: idx * 0.15, type: "spring", stiffness: 100 }}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-green-500/30 transition-colors group"
                                >
                                    <div className="p-2.5 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                                        <feature.icon className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm mb-1">{feature.title}</h3>
                                        <p className="text-xs text-neutral-400 leading-snug">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Visual Representation */}
                    <div className="flex-1 w-full flex justify-center lg:justify-end relative">
                        <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">

                            {/* Central Node */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                className="z-20 w-32 h-32 bg-neutral-900 rounded-full border-4 border-green-500 shadow-[0_0_60px_rgba(34,197,94,0.3)] flex items-center justify-center relative"
                            >
                                <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" />
                                <Wifi className="w-12 h-12 text-green-500" />
                            </motion.div>

                            {/* Orbit Container */}
                            <motion.div
                                className="absolute inset-0"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                {/* Orbiting Devices */}
                                {[
                                    { Icon: Laptop, angle: 0 },
                                    { Icon: Smartphone, angle: 90 },
                                    { Icon: Tablet, angle: 180 },
                                    { Icon: Tv, angle: 270 },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8"
                                        style={{
                                            transform: `rotate(${item.angle}deg) translate(200px) rotate(-${item.angle}deg)`
                                        }}
                                    >
                                        <motion.div
                                            className="w-full h-full bg-neutral-800 rounded-2xl border border-white/10 flex items-center justify-center shadow-lg relative"
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        >
                                            <item.Icon className="w-6 h-6 text-neutral-400" />
                                            {/* Signal Line (Dashed) */}
                                            <div className="absolute top-1/2 right-full w-[168px] h-[2px] bg-gradient-to-r from-transparent to-green-500/20 origin-right"
                                                style={{ transform: `rotate(0deg)` }} // Lines point to center
                                            />
                                        </motion.div>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Pulse Rings */}
                            {[1, 2, 3].map((ring) => (
                                <div
                                    key={ring}
                                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-green-500/10 rounded-full pointer-events-none`}
                                    style={{ width: `${ring * 200 + 100}px`, height: `${ring * 200 + 100}px` }}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
