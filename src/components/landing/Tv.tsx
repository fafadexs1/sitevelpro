
"use client";

import { motion } from "framer-motion";
import { Tv, Film, Clapperboard, ChevronRight } from "lucide-react";
import React, { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";

const channels = [
    { name: "Filmes", icon: <Film className="w-8 h-8"/> },
    { name: "Séries", icon: <Clapperboard className="w-8 h-8"/> },
    { name: "Esportes", icon: <Tv className="w-8 h-8"/> },
    { name: "Notícias", icon: <Tv className="w-8 h-8"/> },
    { name: "Infantil", icon: <Tv className="w-8 h-8"/> },
    { name: "Documentários", icon: <Tv className="w-8 h-8"/> },
    { name: "Variedades", icon: <Tv className="w-8 h-8"/> },
    { name: "Música", icon: <Tv className="w-8 h-8"/> },
    { name: "Cultura", icon: <Tv className="w-8 h-8"/> },
    { name: "Adulto", icon: <Tv className="w-8 h-8"/> },
    { name: "Internacional", icon: <Tv className="w-8 h-8"/> },
    { name: "Abertos", icon: <Tv className="w-8 h-8"/> },
];

const radius = 420;
const perspective = 750;

type AnimatedItem = {
    i: number;
    channel: typeof channels[number];
    angle: number;
    x: number;
    z: number;
    scale: number;
};

function DesktopView() {
    const [rotateX, setRotateX] = React.useState(0);
    const [rotateY, setRotateY] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [animatedItems, setAnimatedItems] = useState<AnimatedItem[]>([]);

    useEffect(() => {
        const items = channels.map((channel, i) => {
            const angle = (i / channels.length) * 2 * Math.PI;
            const x = radius * Math.sin(angle);
            const z = radius * Math.cos(angle);
            const scale = 0.8 + ((z + radius) / (2 * radius)) * 0.25;
            return { i, channel, angle, x, z, scale };
        }).sort((a, b) => a.z - b.z);
        setAnimatedItems(items);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = e.clientX - left - width / 2;
        const y = e.clientY - top - height / 2;
        setRotateY((x / width) * 15);
        setRotateX((-y / height) * 15);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };


    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-[500px] flex items-center justify-center"
            style={{ perspective: `${perspective}px` }}
        >
            <motion.div
                className="relative w-full h-full"
                style={{
                    transformStyle: "preserve-3d",
                    rotateX,
                    rotateY,
                    transition: 'transform 0.2s ease-out'
                }}
            >
                {animatedItems.map(({ i, channel, angle, x, z, scale }) => {
                    const isFront = z > 0;
                    if (!isFront) return null;

                    const opacity = 0.65 + (z / radius) * 0.35;

                    return (
                        <motion.div
                            key={i}
                            className="absolute top-1/2 left-1/2 flex flex-col items-center justify-center w-28 h-28 p-4 rounded-2xl border border-white/10 shadow-xl"
                            style={{
                                transform: `translate3d(${x - 56}px, -56px, ${z}px) rotateY(${angle}rad) scale(${scale})`,
                                zIndex: Math.round(z),
                                backfaceVisibility: "hidden",
                                willChange: "transform",
                                backgroundColor: `rgba(23,23,23,${opacity})`,
                            }}
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: isFront ? 1 : 0, scale: isFront ? scale : 0.5 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05, type: "spring", stiffness: 100, damping: 20 }}
                        >
                            <div className="text-primary">{channel.icon}</div>
                            <p className="mt-2 text-sm text-center text-white/80">{channel.name}</p>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}

function MobileView() {
    return (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {channels.map((channel, i) => (
                <motion.div
                    key={i}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/10 bg-neutral-900/60"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <div className="text-primary">{React.cloneElement(channel.icon, { className: "w-7 h-7" })}</div>
                    <p className="mt-2 text-sm text-center text-white/80">{channel.name}</p>
                </motion.div>
            ))}
        </div>
    );
}


export function TvSection() {
    const isMobile = useIsMobile();
    
    if (isMobile === undefined) {
      return <div className="h-[500px]" />; // Placeholder or loader
    }

    return (
        <section id="tv" className="border-t border-white/5 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Uma nova dimensão de entretenimento na sua TV
                        </h2>
                        <p className="mt-4 text-white/70">
                            Qualidade de imagem e som de cinema com uma grade de mais de 100 canais para toda a família. Filmes, séries, esportes e muito mais, tudo em alta definição.
                        </p>
                        <a 
                            id="tv-cta-pacotes"
                            href="#planos"
                            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                        >
                            Conhecer pacotes de TV <ChevronRight className="h-4 w-4" />
                        </a>
                    </div>
                    {isMobile ? <MobileView /> : <DesktopView />}
                </div>
            </div>
        </section>
    );
}
