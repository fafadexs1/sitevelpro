
"use client";

import { useEffect, useRef } from "react";
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

const GameCard = ({ game }: { game: typeof games[0] }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in-view');
                } else {
                    entry.target.classList.remove('is-in-view');
                }
            });
        }, observerOptions);

        observer.observe(card);

        return () => {
            if (card) {
                observer.unobserve(card);
            }
        };
    }, []);

    return (
        <div ref={cardRef} className="game-card-fx">
            <div className="card-image-wrapper">
                <Image
                    src={game.image.src}
                    alt={`Gameplay de ${game.name}`}
                    width={500}
                    height={400}
                    data-ai-hint={game.image.aiHint}
                />
            </div>
            <div className="card-content">
                <h3>{game.name}</h3>
                <p>{game.description}</p>
            </div>
        </div>
    );
};

export function Games() {
  return (
    <section className="games-showcase">
      <div className="games-showcase-content">
        <h2>Feita para <span className="highlight-text">Gamers de Elite</span></h2>
        <p>Rotas otimizadas, conexão turbo e estabilidade que redefine o que é possível nos seus jogos favoritos.</p>
      </div>

      <div className="games-grid">
        {games.map((game) => (
          <GameCard key={game.name} game={game} />
        ))}
      </div>
    </section>
  );
}
