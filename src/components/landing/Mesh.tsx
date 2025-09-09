
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
        return <div className="relative w-full aspect-square max-w-xl mx-auto" />; // Render nothing on server
    }

    // Increased radius and sizes for a larger, more impactful animation
    const radius = 150;
    const centerIconSize = 128; // w-32, h-32
    const deviceIconSize = 56; // w-14, h-14
    const deviceIconOffset = deviceIconSize / 2;

    return (
        <div className="relative w-full aspect-square max-w-xl mx-auto">
            <div className="absolute inset-0 grid place-items-center">
                <div className="w-32 h-32 rounded-full bg-primary/20 flex flex-col items-center justify-center text-center p-2 border border-primary/30">
                    <Router className="w-10 h-10 text-primary"/>
                    <p className="text-sm mt-1 text-primary">Seu Wi-Fi</p>
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
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-40 bg-gradient-to-b from-primary/5 to-primary/50 rounded-full" />
                </motion.div>
            ))}
            <div className="absolute w-full h-full top-0 left-0">
                {devices.map(({ icon: Icon }, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-14 h-14 bg-card border border-border rounded-full grid place-items-center"
                        style={{
                            top: `calc(50% - ${deviceIconOffset}px + ${radius * Math.sin(i * 2 * Math.PI / devices.length)}px)`,
                            left: `calc(50% - ${deviceIconOffset}px + ${radius * Math.cos(i * 2 * Math.PI / devices.length)}px)`,
                        }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                    >
                        <Icon className="w-6 h-6 text-muted-foreground" />
                    </motion.div>
                ))}
            </div>
            <svg className="absolute w-full h-full opacity-20" viewBox="0 0 400 400" style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '400px'}}>
                {devices.map((_, i) => (
                    <motion.line 
                        key={`inner-line-${i}`}
                        x1="200" y1="200" 
                        x2={200 + radius * Math.cos(i * 2 * Math.PI / devices.length)} 
                        y2={200 + radius * Math.sin(i * 2 * Math.PI / devices.length)}
                        stroke="hsl(var(--foreground))" strokeWidth="0.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeInOut" }}
                    />
                ))}
                {devices.map((_, i) => (
                        <motion.line 
                        key={`outer-line-${i}`}
                        x1={200 + radius * Math.cos(i * 2 * Math.PI / devices.length)} 
                        y1={200 + radius * Math.sin(i * 2 * Math.PI / devices.length)}
                        x2={200 + radius * Math.cos((i + 1) * 2 * Math.PI / devices.length)}
                        y2={200 + radius * Math.sin((i + 1) * 2 * Math.PI / devices.length)}
                        stroke="hsl(var(--foreground))" strokeWidth="0.5"
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
        <section id="mesh" className="border-t border-border bg-background py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                           Sinal forte e estável em todos os cantos da casa
                        </h2>
                        <p className="mt-4 text-muted-foreground">
                           Com a tecnologia Mesh, criamos uma rede unificada e inteligente que cobre todos os ambientes, eliminando pontos cegos e garantindo a melhor conexão para todos os seus dispositivos, não importa onde você esteja.
                        </p>
                        <a 
                            id="mesh-cta-planos"
                            href="#planos"
                            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
