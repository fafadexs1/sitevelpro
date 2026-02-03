
"use client";

import { motion } from "framer-motion";
import { ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

type Channel = {
  id: string;
  name: string;
  logo_url: string;
};

const ChannelCard = ({ channel, delay }: { channel: Channel; delay: number }) => (
  <article className="card" data-float style={{ "--delay": `${delay}s` } as React.CSSProperties}>
    <span className="shine"></span>
    <Image
      className="logo"
      alt={channel.name}
      src={channel.logo_url}
      width={140}
      height={78}
      unoptimized // SVGs from wikimedia are better without optimization
    />
  </article>
);


export function TvGrid({ channels }: { channels: Channel[] }) {
  // const [channels, setChannels] = useState<Channel[]>([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   async function fetchChannels() {
  //     // Fetching removed
  //   }
  //   fetchChannels();
  // }, []);

  const loading = false; // Props passed, assumed loaded

  return (
    <section id="tv" className="border-t border-border bg-secondary py-16 sm:py-24">
      <div className="wrap grid-cols-1 lg:grid-cols-2">
        <section className="channels">
          {loading ? (
            <div className="grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card h-[110px] bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid">
              {channels.map((channel, i) => (
                <ChannelCard key={channel.id} channel={channel} delay={i * 0.4} />
              ))}
            </div>
          )}
        </section>
        <section className="headline">
          <span className="mini">Mais de 100 canais</span>
          <h2>Uma vitrine elegante dos canais<br /> que vão com a <strong>Velpro TV</strong></h2>
          <p className="sub">Imagem e som em alta definição, com os principais canais de filmes, séries, esportes e variedades. Um layout limpo, rápido e preparado para conversão.</p>
          <Link className="cta" href="/tv">Conhecer pacotes de TV →</Link>
        </section>
      </div>
    </section>
  );
}
