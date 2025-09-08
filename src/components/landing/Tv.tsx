
"use client";

import { motion } from "framer-motion";
import { ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Button } from "../ui/button";

type Channel = {
  id: string;
  name: string;
  logo_url: string;
};

export function TvSection() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChannels() {
      const supabase = createClient();
      setLoading(true);
      const { data, error } = await supabase
        .from("tv_channels")
        .select("id, name, logo_url")
        .eq("is_featured", true)
        .order("name")
        .limit(10);

      if (error) {
        console.error("Error fetching featured channels:", error);
      } else {
        setChannels(data);
      }
      setLoading(false);
    }
    fetchChannels();
  }, []);

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
          <Button asChild id="tv-cta-pacotes" className="mt-8">
            <Link
              href="/tv"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
            >
              Conhecer pacotes de TV <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="relative">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                {channels.map((channel, i) => (
                  <motion.div
                    key={channel.id}
                    title={channel.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                      delay: i * 0.05,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className="flex aspect-video items-center justify-center rounded-lg border border-white/10 bg-neutral-900/60 p-2 sm:p-4"
                  >
                    <Image
                      src={channel.logo_url}
                      alt={channel.name}
                      width={100}
                      height={60}
                      className="h-auto w-full object-contain"
                    />
                  </motion.div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
