"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Channel = {
  id: string;
  name: string;
  logo_url: string;
};

const ChannelCard = ({ channel, delay }: { channel: Channel; delay: number }) => (
  <article className="tv-channel-card" data-float style={{ "--delay": `${delay}s` } as React.CSSProperties}>
    <span className="tv-channel-glow" />
    <span className="tv-channel-shine" />
    <Image
      className="tv-channel-logo"
      alt={channel.name}
      src={channel.logo_url}
      width={140}
      height={78}
      unoptimized
    />
  </article>
);

export function TvGrid({ channels }: { channels: Channel[] }) {
  return (
    <section id="tv" className="tv-showcase border-t border-white/10 bg-neutral-950 py-16 text-white sm:py-24">
      <div className="tv-showcase-orb tv-showcase-orb-left" />
      <div className="tv-showcase-orb tv-showcase-orb-right" />

      <div className="wrap grid-cols-1 lg:grid-cols-2">
        <section className="tv-channels" aria-label="Canais em destaque da Velpro TV">
          <div className="tv-channels-grid">
            {channels.map((channel, index) => (
              <ChannelCard key={channel.id} channel={channel} delay={index * 0.28} />
            ))}
          </div>
        </section>

        <section className="tv-headline">
          <span className="tv-mini">Mais de 100 canais</span>
          <h2>
            Uma vitrine elegante dos canais que vão com a <strong>Velpro TV</strong>
          </h2>
          <p>
            Imagem e som em alta definição, com os principais canais de filmes, séries, esportes e variedades em uma
            experiência rápida e pronta para assistir.
          </p>
          <Link className="tv-cta" href="/tv">
            Conhecer pacotes de TV <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </section>
  );
}
