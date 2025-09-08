
"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

const channelLogos = [
  { name: "HBO", src: "https://picsum.photos/id/1/100/60", dataAiHint: "hbo logo" },
  { name: "Warner", src: "https://picsum.photos/id/2/100/60", dataAiHint: "warner logo" },
  { name: "Sony", src: "https://picsum.photos/id/3/100/60", dataAiHint: "sony channel logo" },
  { name: "AXN", src: "https://picsum.photos/id/4/100/60", dataAiHint: "axn logo" },
  { name: "Cinemax", src: "https://picsum.photos/id/5/100/60", dataAiHint: "cinemax logo" },
  { name: "Universal", src: "https://picsum.photos/id/6/100/60", dataAiHint: "universal channel logo" },
  { name: "ESPN", src: "https://picsum.photos/id/7/100/60", dataAiHint: "espn logo" },
  { name: "Discovery", src: "https://picsum.photos/id/8/100/60", dataAiHint: "discovery channel logo" },
  { name: "History", src: "https://picsum.photos/id/9/100/60", dataAiHint: "history channel logo" },
  { name: "Cartoon Network", src: "https://picsum.photos/id/10/100/60", dataAiHint: "cartoon network logo" },
  { name: "Nickelodeon", src: "https://picsum.photos/id/11/100/60", dataAiHint: "nickelodeon logo" },
  { name: "Gloob", src: "https://picsum.photos/id/12/100/60", dataAiHint: "gloob logo" },
];

export function TvSection() {
  return (
    <section id="tv" className="border-t border-white/5 py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Uma nova dimensão de entretenimento na sua TV
          </h2>
          <p className="mt-4 text-white/70">
            Qualidade de imagem e som de cinema com uma grade de mais de 100
            canais para toda a família. Filmes, séries, esportes e muito mais,
            tudo em alta definição.
          </p>
          <a
            id="tv-cta-pacotes"
            href="#planos"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            Conhecer pacotes de TV <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="relative">
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                {channelLogos.map((channel, i) => (
                    <motion.div
                        key={channel.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 100 }}
                        className="aspect-video rounded-lg border border-white/10 bg-neutral-900/60 p-2 sm:p-4 flex items-center justify-center"
                    >
                        <Image
                            src={channel.src}
                            alt={channel.name}
                            data-ai-hint={channel.dataAiHint}
                            width={100}
                            height={60}
                            className="w-full h-auto object-contain"
                        />
                    </motion.div>
                ))}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
        </div>

      </div>
    </section>
  );
}
