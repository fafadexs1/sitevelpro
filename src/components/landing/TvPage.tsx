
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Tv, Smartphone, Laptop, Clapperboard, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

type Channel = {
  id: string;
  name: string;
  logo_url: string;
};

export function TvPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllChannels() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tv_channels")
        .select("id, name, logo_url")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching channels:", error);
      } else {
        setChannels(data);
      }
      setLoading(false);
    }
    fetchAllChannels();
  }, []);

  return (
    <>
      <div className="relative border-b border-white/5 py-16 sm:py-24 overflow-hidden bg-neutral-900/30">
        <div className="absolute inset-0 -z-10">
            <Image 
                src="https://picsum.photos/1920/1080"
                alt="Fundo de entretenimento"
                data-ai-hint="entertainment background"
                fill
                className="object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5 }}
            >
                <Clapperboard className="h-12 w-12 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Sua Grade Completa de Canais
                </h1>
                <p className="mt-4 text-lg text-white/70">
                    Explore todos os canais disponíveis nos pacotes Velpro TV. A melhor programação, onde você estiver.
                </p>
                <div className="mt-6 flex justify-center items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-white/80"><Tv className="text-primary"/> TV</div>
                    <div className="flex items-center gap-2 text-sm text-white/80"><Smartphone className="text-primary"/> Celular</div>
                    <div className="flex items-center gap-2 text-sm text-white/80"><Laptop className="text-primary"/> Computador</div>
                </div>
            </motion.div>
        </div>
      </div>
      
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold">Todos os Canais</h2>
                <p className="text-white/60 mt-2">Navegue por nossa seleção completa de entretenimento.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : (
                <motion.div 
                    className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.03,
                            },
                        },
                    }}
                >
                    {channels.map((channel) => (
                         <motion.div
                            key={channel.id}
                            title={channel.name}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                            className="flex flex-col items-center justify-center text-center gap-2"
                        >
                            <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/60 p-3 transition-transform hover:scale-105 hover:bg-neutral-800/60">
                                <Image
                                src={channel.logo_url}
                                alt={channel.name}
                                width={80}
                                height={80}
                                className="object-contain"
                                />
                            </div>
                            <p className="text-xs sm:text-sm text-white/70">{channel.name}</p>
                        </motion.div>
                    ))}
                </motion.div>
            )}

             <div className="text-center mt-16">
                <p className="text-white/70 mb-4">Gostou da nossa seleção? Escolha o plano ideal para você.</p>
                <Button asChild size="lg">
                    <Link href="/#planos">
                        Ver Planos e Preços <ChevronRight />
                    </Link>
                </Button>
            </div>
        </div>
      </div>
    </>
  );
}
