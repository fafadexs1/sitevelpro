
"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Radio } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// --- TIPAGEM ---
type Channel = {
  id: string;
  name: string;
  logo_url: string;
};

type Program = {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  image: string;
  rating: string;
  year: number;
  genres: string[];
  cast: string[];
  director: string;
};

type ScheduleItem = {
  channel: Channel;
  program: Program;
};

// --- DADOS FALSOS (MOCK) ---
const mockPrograms = [
    { id: 'p1', title: "Jurassic World", description: "Um novo parque temático, construído no local original do Jurassic Park, cria um dinossauro híbrido geneticamente modificado, o Indominus Rex, que escapa e inicia uma matança.", image: "https://image.tmdb.org/t/p/w500/2c0ajs1S6t2GQVlI4t3y2S3iHq.jpg", rating: "16", year: 2015, genres: ["Ação", "Aventura"], cast: ["Chris Pratt", "Bryce Dallas Howard"], director: "Colin Trevorrow" },
    { id: 'p2', title: "Os Simpsons", description: "Uma série de comédia animada que satiriza a vida da classe média americana, personificada pela família Simpson.", image: "https://image.tmdb.org/t/p/w500/t3c3p0a2Jk3y4zG6q3gC3T6uA1.jpg", rating: "Livre", year: 1989, genres: ["Animação", "Comédia"], cast: ["Dan Castellaneta", "Julie Kavner"], director: "Matt Groening" },
    { id: 'p3', title: "Fronteiras Perigosas", description: "Documentário explorando os desafios e a vida nas zonas de fronteira mais tensas do mundo.", image: "https://image.tmdb.org/t/p/w500/fA8IordY1r294d1o2aA4H6g3o1.jpg", rating: "14", year: 2018, genres: ["Documentário"], cast: ["N/A"], director: "N/A" },
    { id: 'p4', title: "Moneyball", description: "O gerente de um time de beisebol, Billy Beane, tenta montar uma equipe competitiva com um orçamento apertado usando análise de dados.", image: "https://image.tmdb.org/t/p/w500/3oAA2aB23v1l24Tf4dM3sLp3Lp.jpg", rating: "10", year: 2011, genres: ["Drama", "Esporte"], cast: ["Brad Pitt", "Jonah Hill"], director: "Bennett Miller" },
    { id: 'p5', title: "X-Men Origens: Wolverine", description: "A história de origem de Wolverine, desde sua infância até sua transformação no mutante com garras de adamantium.", image: "https://image.tmdb.org/t/p/w500/b32s1i2x5aTf1bYx2v30zXN4b.jpg", rating: "14", year: 2009, genres: ["Ação", "Ficção Científica"], cast: ["Hugh Jackman", "Liev Schreiber"], director: "Gavin Hood" },
    { id: 'p6', title: "The Boy Next Door", description: "Uma professora divorciada se envolve com um jovem vizinho, mas o relacionamento toma um rumo perigoso.", image: "https://image.tmdb.org/t/p/w500/pA5t6s3iVj5n63lWn2A3PjUq3.jpg", rating: "16", year: 2015, genres: ["Suspense"], cast: ["Jennifer Lopez", "Ryan Guzman"], director: "Rob Cohen" },
];

function createMockSchedule(channels: Channel[]): ScheduleItem[] {
  const now = new Date();
  return channels.map((channel, index) => {
    const programIndex = index % mockPrograms.length;
    const program = mockPrograms[programIndex];
    const startTime = new Date(now.getTime() - Math.floor(Math.random() * 30) * 60000); // Inicia nos últimos 30 min
    const endTime = new Date(startTime.getTime() + (90 + Math.floor(Math.random() * 60)) * 60000); // Dura entre 90 e 150 min
    return { channel, program: { ...program, startTime, endTime, id: `${channel.id}-${program.id}` } };
  });
}

// --- COMPONENTES DA UI ---
const EpgChannelRow = ({ item, isSelected, onSelect }: { item: ScheduleItem, isSelected: boolean, onSelect: () => void }) => {
  const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-center gap-4 p-3 border-b-2 transition-all duration-300 cursor-pointer",
        isSelected ? "bg-white/10 border-primary" : "border-transparent hover:bg-white/5"
      )}
    >
      <span className="w-10 text-right text-lg font-light text-neutral-400">{146 + item.channel.id.charCodeAt(0) % 50}</span>
      <div className="w-12 h-8 rounded-md bg-white/10 flex items-center justify-center">
        <Image src={item.channel.logo_url} alt={item.channel.name} width={32} height={32} className="object-contain max-h-6" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white">{item.channel.name}</p>
        <p className="text-xs text-neutral-400">{formatTime(item.program.startTime)} - {formatTime(item.program.endTime)}</p>
      </div>
    </div>
  );
};

const EpgProgramDetail = ({ item }: { item: ScheduleItem }) => {
  const now = Date.now();
  const progress = Math.min(100, ((now - item.program.startTime.getTime()) / (item.program.endTime.getTime() - item.program.startTime.getTime())) * 100);
  const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-4">
        <Image src={item.channel.logo_url} alt={item.channel.name} width={40} height={40} className="object-contain" />
        <span className="font-bold text-lg">{item.channel.name}</span>
        <div className="flex items-center gap-2 text-red-500">
            <Radio size={16} />
            <span className="text-sm font-semibold">LIVE</span>
        </div>
      </div>
      <h2 className="text-4xl font-bold text-white mb-2">{item.program.title}</h2>
      <div className="mb-6">
        <p className="text-sm text-neutral-400">Agora {formatTime(item.program.startTime)} - {formatTime(item.program.endTime)}</p>
        <div className="w-full bg-white/10 rounded-full h-1 mt-2">
            <div className="bg-primary h-1 rounded-full" style={{ width: `${progress}%` }}/>
        </div>
      </div>
      <p className="text-neutral-300 leading-relaxed">{item.program.description}</p>
      <div className="mt-6 text-sm text-neutral-400 space-y-2">
        <p>{item.program.rating} • {item.program.year} • {item.program.genres.join(', ')}</p>
        <p><strong>Direção:</strong> {item.program.director}</p>
        <p><strong>Elenco:</strong> {item.program.cast.join(', ')}</p>
      </div>
    </div>
  );
};

const EpgTimelineItem = ({ item, isSelected, onSelect }: { item: ScheduleItem, isSelected: boolean, onSelect: () => void }) => (
    <div 
      onClick={onSelect}
      className={cn(
        "relative w-48 shrink-0 rounded-lg overflow-hidden cursor-pointer group transition-all duration-300",
        isSelected ? "border-2 border-white shadow-2xl" : "border-2 border-transparent hover:border-white/50"
      )}
    >
        <Image src={item.program.image} alt={item.program.title} width={200} height={112} className="w-full h-28 object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/>
        <div className="absolute bottom-0 left-0 right-0 p-2">
            <p className="text-sm font-semibold text-white truncate">{item.program.title}</p>
            <div className="w-full bg-white/20 rounded-full h-1 mt-1 group-hover:bg-white/40">
                <div className="bg-primary h-1 rounded-full" style={{width: `${Math.random() * 80 + 10}%`}}/>
            </div>
        </div>
    </div>
)

// --- COMPONENTE PRINCIPAL ---
export function TVGuide() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      setLoading(true);
      const { data, error } = await supabase
        .from("tv_channels")
        .select("id, name, logo_url")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching channels:", error);
      } else {
        const mockSchedule = createMockSchedule(data);
        setSchedule(mockSchedule);
        setSelectedItem(mockSchedule[Math.floor(mockSchedule.length / 2)]); // Seleciona um item do meio
      }
      setLoading(false);
    }
    fetchAllChannels();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-2 gap-8">
        {/* Coluna de Canais */}
        <div className="lg:col-span-1 xl:col-span-1 bg-neutral-900/50 rounded-xl overflow-y-auto max-h-[85vh] no-scrollbar">
            {schedule.map(item => (
                <EpgChannelRow 
                    key={item.channel.id} 
                    item={item}
                    isSelected={selectedItem?.channel.id === item.channel.id}
                    onSelect={() => setSelectedItem(item)}
                />
            ))}
        </div>
        
        {/* Coluna de Detalhes e Timeline */}
        <div className="lg:col-span-2 xl:col-span-1 flex flex-col gap-8">
          <div className="flex-grow bg-neutral-900/50 rounded-xl relative overflow-hidden">
            <AnimatePresence mode="wait">
                {selectedItem && (
                     <motion.div
                        key={selectedItem.program.id}
                        className="w-full h-full"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                         <Image src={selectedItem.program.image} alt={selectedItem.program.title} fill className="object-cover opacity-20"/>
                         <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"/>
                         <div className="relative z-10 h-full overflow-y-auto">
                            <EpgProgramDetail item={selectedItem} />
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
          <div className="flex-shrink-0">
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                 {schedule.map(item => (
                    <EpgTimelineItem 
                        key={`timeline-${item.channel.id}`}
                        item={item}
                        isSelected={selectedItem?.channel.id === item.channel.id}
                        onSelect={() => setSelectedItem(item)}
                    />
                 ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
