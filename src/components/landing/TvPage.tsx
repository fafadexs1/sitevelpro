
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Tv, Smartphone, Laptop, Clapperboard, ChevronRight, Loader2, Computer, AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

type Channel = {
  id: string;
  name: string;
  logo_url: string;
};

const ChannelCard = ({ channel, delay }: { channel: Channel; delay: number }) => (
   <motion.div
      key={channel.id}
      title={channel.name}
      variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
      }}
       style={{ "--delay": `${delay}s` } as React.CSSProperties}
       className="flex flex-col items-center justify-start text-center"
    >
      <div className="card h-[110px] w-full max-w-[140px]" data-float>
        <span className="shine"></span>
         <Image
            className="logo"
            alt={channel.name}
            src={channel.logo_url}
            width={140}
            height={78}
            unoptimized // SVGs are better without optimization
          />
      </div>
      <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{channel.name}</p>
    </motion.div>
);

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
      <div className="relative border-b border-border py-16 sm:py-24 overflow-hidden bg-secondary">
        <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5 }}
            >
                <Clapperboard className="h-12 w-12 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Sua Grade Completa de Canais
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Explore todos os canais disponíveis nos pacotes Velpro TV. A melhor programação, onde você estiver.
                </p>
                <div className="mt-6 flex justify-center items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-foreground/80"><Tv className="text-primary"/> TV</div>
                    <div className="flex items-center gap-2 text-sm text-foreground/80"><Smartphone className="text-primary"/> Celular</div>
                    <div className="flex items-center gap-2 text-sm text-foreground/80"><Laptop className="text-primary"/> Computador</div>
                </div>
            </motion.div>
        </div>
      </div>
      
      <div className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold text-foreground">Todos os Canais</h2>
                <p className="text-muted-foreground mt-2">Navegue por nossa seleção completa de entretenimento.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : (
                <motion.div 
                    className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-8 sm:gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.02,
                            },
                        },
                    }}
                >
                    {channels.map((channel, i) => (
                         <ChannelCard key={channel.id} channel={channel} delay={i * 0.1} />
                    ))}
                </motion.div>
            )}
        </div>
      </div>
       <div className="py-16 sm:py-24 bg-secondary border-t border-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold text-foreground">Dispositivos Compatíveis</h2>
                    <p className="text-muted-foreground mt-2">Assista em suas telas favoritas, onde e quando quiser.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Computer className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-bold text-card-foreground">Computador</h3>
                        </div>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>Google Chrome</li>
                            <li>Mozilla Firefox</li>
                            <li>Microsoft Edge</li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Tv className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-bold text-card-foreground">TV</h3>
                        </div>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>Amazon Fire TV</li>
                            <li>Android TV</li>
                            <li>Roku</li>
                            <li>Chromecast</li>
                            <li>
                                LG (WebOS)
                                <ul className="pl-4 text-xs text-muted-foreground/80">
                                    <li>Versão mínima WebOS: 4.5.0</li>
                                    <li>Modelos: Série 7 em diante</li>
                                </ul>
                            </li>
                            <li>
                                Samsung (Tizen)
                                <ul className="pl-4 text-xs text-muted-foreground/80">
                                    <li>Modelos: Série 7 em diante</li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Smartphone className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-bold text-card-foreground">Celulares e Tablets</h3>
                        </div>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>Celulares e Tablets Android</li>
                            <li>iPhone e iPad</li>
                        </ul>
                         <p className="text-xs text-muted-foreground/80 mt-4">
                            Certifique-se de que seus dispositivos e aplicativos estão atualizados para garantir a melhor experiência.
                         </p>
                    </div>
                </div>

                <Alert variant="default" className="mt-12 max-w-4xl mx-auto bg-yellow-400/5 border-yellow-400/20 text-yellow-500">
                    <AlertTriangle className="h-4 w-4 !text-yellow-400" />
                    <AlertTitle className="text-yellow-400">Dica de Performance</AlertTitle>
                    <AlertDescription className="text-yellow-300">
                        Para a melhor experiência de TV, recomendamos conectar sua TV ou dispositivo de streaming diretamente ao roteador com um cabo de rede. Conexões Wi-Fi podem sofrer instabilidades e causar travamentos no sinal.
                    </AlertDescription>
                </Alert>
            </div>
        </div>

      <div className="text-center py-16 sm:py-24 bg-background border-t border-border">
        <p className="text-muted-foreground mb-4">Gostou da nossa seleção? Escolha o plano ideal para você.</p>
        <Button asChild size="lg">
            <Link href="/#planos">
                Ver Planos e Preços <ChevronRight />
            </Link>
        </Button>
    </div>
    </>
  );
}
