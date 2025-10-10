
"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Tv, Smartphone, Laptop, Clapperboard, Loader2, Computer } from "lucide-react";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

type Channel = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string;
};

// Componente para um único card de canal na lista lateral
const ChannelListItem = ({ channel, isSelected, onSelect }: { channel: Channel, isSelected: boolean, onSelect: () => void }) => (
    <button
        onClick={onSelect}
        className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
            isSelected ? "bg-primary/10 text-primary" : "hover:bg-accent"
        }`}
    >
        <div className="w-10 h-10 rounded-md bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden">
            <Image src={channel.logo_url} alt={channel.name} width={32} height={32} className="object-contain" unoptimized/>
        </div>
        <span className="font-medium text-sm truncate text-foreground">{channel.name}</span>
    </button>
);

// Componente para o card de canal na barra inferior
const BottomChannelCard = ({ channel, isSelected, onSelect }: { channel: Channel, isSelected: boolean, onSelect: () => void }) => (
    <button onClick={onSelect} className={`relative rounded-md aspect-video h-16 sm:h-20 transition-all duration-300 ${isSelected ? 'border-2 border-primary scale-105' : 'opacity-60 hover:opacity-100'}`}>
        <Image src={channel.logo_url} alt={channel.name} fill className="object-contain bg-foreground/10 rounded-md p-1" unoptimized/>
    </button>
)

export function TVGuide() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const supabase = createClient();
            const { data, error } = await supabase
                .from("tv_channels")
                .select("id, name, description, logo_url")
                .order("name", { ascending: true });

            if (error) {
                console.error("Error fetching channels:", error);
            } else {
                setChannels(data);
                if (data.length > 0) {
                    setSelectedChannel(data[0]);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const selectedChannelIndex = useMemo(() => {
        if (!selectedChannel) return -1;
        return channels.findIndex(c => c.id === selectedChannel.id);
    }, [channels, selectedChannel]);


    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh] bg-black">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="bg-black text-white h-[calc(100vh-80px)] flex flex-col overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-grow flex overflow-hidden">
                {/* Channel List (Sidebar) */}
                <aside className="w-64 border-r border-white/10 p-2 hidden md:flex flex-col">
                    <h2 className="text-lg font-semibold p-2 mb-2">Canais</h2>
                    <ScrollArea className="flex-grow">
                        <div className="space-y-1">
                            {channels.map(channel => (
                                <ChannelListItem
                                    key={channel.id}
                                    channel={channel}
                                    isSelected={selectedChannel?.id === channel.id}
                                    onSelect={() => setSelectedChannel(channel)}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                </aside>

                {/* Program Details View */}
                <main className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto">
                    {selectedChannel ? (
                        <motion.div 
                            key={selectedChannel.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col h-full"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-20 h-20 rounded-xl bg-foreground/10 p-2 border border-white/10 flex items-center justify-center">
                                    <Image src={selectedChannel.logo_url} alt={selectedChannel.name} width={64} height={64} className="object-contain" unoptimized />
                                </div>
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-bold">{selectedChannel.name}</h1>
                                </div>
                            </div>

                            <div className="text-white/70 text-base leading-relaxed flex-grow">
                                <p>{selectedChannel.description || "Descrição não disponível para este canal."}</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <h3 className="text-xl font-semibold mb-4">Dispositivos Compatíveis</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                                     <div className="flex items-center gap-3"><Tv className="h-6 w-6 text-primary" /><span>Smart TVs e Set-top boxes</span></div>
                                     <div className="flex items-center gap-3"><Smartphone className="h-6 w-6 text-primary" /><span>Celulares e Tablets</span></div>
                                     <div className="flex items-center gap-3"><Computer className="h-6 w-6 text-primary" /><span>Computadores (via navegador)</span></div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-white/50">
                            <p>Selecione um canal para ver os detalhes.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Bottom Bar: Timeline / Channel Switcher */}
            <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm p-4">
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex items-center gap-4">
                         {channels.map(channel => (
                            <BottomChannelCard
                                key={channel.id}
                                channel={channel}
                                isSelected={selectedChannel?.id === channel.id}
                                onSelect={() => setSelectedChannel(channel)}
                            />
                         ))}
                    </div>
                     <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </footer>
        </div>
    );
}
