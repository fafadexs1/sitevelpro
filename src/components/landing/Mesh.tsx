
"use client";

import { motion } from "framer-motion";
import { Wifi, Router, Smartphone, Laptop, Tablet, Home, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from 'react';

const devices = [
    { icon: Smartphone },
    { icon: Laptop },
    { icon: Tablet },
    { icon: Home },
    { icon: Wifi },
];

function DesktopView() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="relative w-full aspect-square max-w-lg mx-auto" />; // Render nothing on server
    }

    return (
        <div className="relative w-full aspect-square max-w-lg mx-auto">
            <div className="absolute inset-0 grid place-items-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex flex-col items-center justify-center text-center p-2 border border-primary/30">
                    <Router className="w-7 h-7 text-primary"/>
                    <p className="text-xs mt-1 text-primary">Seu Wi-Fi</p>
                </div>
            </div>
            {devices.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.5,
                        delay: i * 0.2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        repeatDelay: 2,
                        ease: "easeInOut"
                    }}
                    className="absolute w-full h-full"
                    style={{ transform: `rotate(${i * (360 / devices.length)}deg)` }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-24 bg-gradient-to-b from-primary/5 to-primary/50 rounded-full" />
                </motion.div>
            ))}
            <div className="absolute w-full h-full top-0 left-0">
                {devices.map(({ icon: Icon }, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-12 h-12 bg-neutral-900 border border-white/10 rounded-full grid place-items-center"
                        style={{
                            top: `calc(50% - 24px + ${90 * Math.sin(i * 2 * Math.PI / devices.length)}px)`,
                            left: `calc(50% - 24px + ${90 * Math.cos(i * 2 * Math.PI / devices.length)}px)`,
                        }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                    >
                        <Icon className="w-5 h-5 text-white/70" />
                    </motion.div>
                ))}
            </div>
            <svg className="absolute w-full h-full opacity-20" viewBox="0 0 300 300" style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '300px'}}>
                {devices.map((_, i) => (
                    <motion.line 
                        key={`inner-line-${i}`}
                        x1="150" y1="150" 
                        x2={150 + 75 * Math.cos(i * 2 * Math.PI / devices.length)} 
                        y2={150 + 75 * Math.sin(i * 2 * Math.PI / devices.length)}
                        stroke="white" strokeWidth="0.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeInOut" }}
                    />
                ))}
                {devices.map((_, i) => (
                        <motion.line 
                        key={`outer-line-${i}`}
                        x1={150 + 75 * Math.cos(i * 2 * Math.PI / devices.length)} 
                        y1={150 + 75 * Math.sin(i * 2 * Math.PI / devices.length)}
                        x2={150 + 75 * Math.cos((i + 1) * 2 * Math.PI / devices.length)}
                        y2={150 + 75 * Math.sin((i + 1) * 2 * Math.PI / devices.length)}
                        stroke="white" strokeWidth="0.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: "easeInOut" }}
                    />
                ))}
            </svg>
        </div>
    );
}

export function Mesh() {
    return (
        <section id="mesh" className="border-t border-white/5 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                           Sinal forte e estável em todos os cantos da casa
                        </h2>
                        <p className="mt-4 text-white/70">
                           Com a tecnologia Mesh, criamos uma rede unificada e inteligente que cobre todos os ambientes, eliminando pontos cegos e garantindo a melhor conexão para todos os seus dispositivos, não importa onde você esteja.
                        </p>
                        <a 
                            id="mesh-cta-planos"
                            href="#planos"
                            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-neutral-950 transition-colors hover:bg-white/90"
                        >
                            Ver planos com Mesh <ChevronRight className="h-4 w-4" />
                        </a>
                    </div>
                    <DesktopView />
                </div>
            </div>
        </section>
    );
}
