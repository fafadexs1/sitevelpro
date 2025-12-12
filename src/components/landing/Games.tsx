
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import imageData from "@/lib/placeholder-images.json";
import { Zap, Cable, Trophy, Crosshair, ChevronsUp } from "lucide-react";

const games = [
    {
        name: "Valorant",
        description: "Zero packet loss para seus headshots contarem sempre.",
        image: imageData.valorant,
        stats: { ping: "Ping Baixo", stability: "100% Fibra" },
        color: "from-rose-500 to-red-600"
    },
    {
        name: "PUBG",
        description: "Renderização rápida e resposta imediata em mundo aberto.",
        image: imageData.pubg,
        stats: { ping: "Sem Lag", stability: "Cabo" },
        color: "from-amber-400 to-orange-500"
    },
    {
        name: "Call of Duty",
        description: "Domine o lobby com a vantagem da conexão fibra óptica.",
        image: imageData.cod,
        stats: { ping: "Otimizado", stability: "Estável" },
        color: "from-emerald-400 to-green-600"
    }
];

export function Games() {
    return (
        <section className="relative py-24 bg-[#050a05] overflow-hidden border-t border-white/5">
            {/* Ambient Gamer Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-green-500/10 blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 mb-6"
                    >
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs font-bold text-neutral-300 tracking-widest uppercase">Performance Competitiva</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 italic"
                    >
                        GAMER <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">ELITE</span>
                    </motion.h2>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        Chega de lag. Nossa rota otimizada é a vantagem injusta que você precisa para subir de rank.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {games.map((game, i) => (
                        <GameCard key={game.name} game={game} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function GameCard({ game, index }: { game: typeof games[0], index: number }) {
    // Scroll-linked animation logic
    // We want the card to fade in and scale up as it scrolls into view
    // Since we are inside a map, we can't easily use a ref for the whole section to control individual items linearly without complex logic.
    // Instead, simpler trigger-based animation usually provides the "pop" described.
    // BUT the user asked specifically "dar play a altura que ele vai dando scroll".
    // This strongly suggests they want the animation to happen *precisely* when it enters, possibly re-triggering?
    // Let's stick to the 'standard' powerful scroll trigger but tuned to be very responsive.
    // Actually, let's use `whileInView` but with `amount: 0.2` so it triggers earlier/more consistently.
    // AND remove `once: true` so it feels alive every time they scroll by?
    // User said "ir arrastando para baixo" (dragging down).
    // Let's trust the previous "spring" physics but maybe the threshold was off.

    // Alternative: Parallax effect using useScroll on useRef for each card? Expensive for list.
    // Let's try adjusting viewport margin and threshold to be VERY responsive.

    return (
        <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ margin: "-10% 0px -10% 0px", amount: 0.1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.2, delay: index * 0.1 }} // Reduced stagger slightly
            className="group relative h-[450px] rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl"
        >
            {/* Background Image with Zoom Effect */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={game.image.src}
                    alt={game.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end">
                {/* Stats Badge */}
                <div className="absolute top-6 right-6 flex flex-col items-end gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-green-500/30">
                        <Zap className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-mono font-bold text-green-400">{game.stats.ping}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-green-500/30">
                        <Cable className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-mono font-bold text-green-400">{game.stats.stability}</span>
                    </div>
                </div>

                <h3 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                    {game.name}
                    <ChevronsUp className="w-6 h-6 text-green-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-neutral-400 text-sm mb-6 line-clamp-2">
                    {game.description}
                </p>

                {/* Progress Bar Aesthetic */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full w-full origin-left bg-gradient-to-r ${game.color} opacity-50 group-hover:opacity-100 transition-all duration-500 transform scale-x-0 group-hover:scale-x-100`} />
                </div>
            </div>

            {/* Hover Border Glow */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-500/30 rounded-3xl transition-colors duration-300 pointer-events-none" />
        </motion.div>
    );
}
