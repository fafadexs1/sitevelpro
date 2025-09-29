
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import imageData from "@/lib/placeholder-images.json";

const games = [
    {
        name: "Valorant",
        description: "Desempenho com latência mínima para você dominar cada partida.",
        image: imageData.valorant
    },
    {
        name: "PUBG",
        description: "Reaja antes do seu oponente com nossa estabilidade de conexão superior.",
        image: imageData.pubg
    },
    {
        name: "Call of Duty",
        description: "Velocidade e consistência para cada tiro, cada missão, cada vitória.",
        image: imageData.cod
    }
];

const GameCard = ({ game }: { game: typeof games[0] }) => (
    <div className="group rounded-2xl overflow-hidden bg-card border border-border transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
        <div className="relative aspect-[16/9] overflow-hidden">
            <Image
                src={game.image.src}
                alt={`Gameplay de ${game.name}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={game.image.aiHint}
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="p-5">
            <h3 className="text-xl font-bold text-card-foreground">{game.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{game.description}</p>
        </div>
    </div>
);

export function Games() {
  return (
    <section className="border-t border-border bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Feita para <span className="text-primary">Gamers de Elite</span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
            Rotas otimizadas, conexão turbo e estabilidade que redefine o que é possível nos seus jogos favoritos.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {games.map((game, index) => (
             <motion.div
                key={game.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
             >
                <GameCard game={game} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
