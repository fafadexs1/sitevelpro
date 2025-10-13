
"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Tv, Smartphone, Laptop, Clapperboard, Loader2, Computer, AlertTriangle, X } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "../ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";


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


export function TVGuide() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [showPerformanceTip, setShowPerformanceTip] = useState(true);
    const [showAccessButton, setShowAccessButton] = useState(false);
    const [showAccessModal, setShowAccessModal] = useState(false);

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

    const handleClosePerformanceTip = () => {
        setShowPerformanceTip(false);
        setShowAccessButton(true);
    }
    
    const handleOpenAccessModal = () => {
        setShowAccessButton(false);
        setShowAccessModal(true);
    }


    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh] bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <div className="bg-background text-foreground h-[calc(100vh-80px)] flex flex-col overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-grow flex overflow-hidden">
                    {/* Channel List (Sidebar) */}
                    <aside className="w-64 border-r border-border p-2 hidden md:flex flex-col">
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
                                    <div className="w-20 h-20 rounded-xl bg-secondary p-2 border border-border flex items-center justify-center">
                                        <Image src={selectedChannel.logo_url} alt={selectedChannel.name} width={64} height={64} className="object-contain" unoptimized />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl font-bold">{selectedChannel.name}</h1>
                                    </div>
                                </div>

                                <div className="text-muted-foreground text-base leading-relaxed flex-grow">
                                    <p>{selectedChannel.description || "Descrição não disponível para este canal."}</p>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>Selecione um canal para ver os detalhes.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            
            {/* Performance Tip Modal */}
            <Dialog open={showPerformanceTip} onOpenChange={(open) => !open && handleClosePerformanceTip()}>
                 <DialogContent className="sm:max-w-md bg-card text-card-foreground">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-yellow-500" /> Dica de Performance</DialogTitle>
                    </DialogHeader>
                     <DialogDescription className="mt-2 text-muted-foreground">
                        Para a melhor experiência, conecte sua TV ou dispositivo de streaming diretamente ao roteador com um cabo de rede.
                    </DialogDescription>
                    <div className="flex justify-end mt-4">
                         <Button onClick={handleClosePerformanceTip}>Entendi</Button>
                    </div>
                 </DialogContent>
            </Dialog>

            {/* Access Instructions Modal */}
            <Dialog open={showAccessModal} onOpenChange={setShowAccessModal}>
                 <DialogContent className="max-w-3xl bg-card text-card-foreground">
                    <DialogHeader>
                        <DialogTitle>Como Acessar</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="rounded-2xl border border-border bg-secondary p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Computer className="h-6 w-6 text-primary" />
                                <h4 className="text-lg font-bold text-card-foreground">Computador</h4>
                            </div>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>Google Chrome</li>
                                <li>Mozilla Firefox</li>
                                <li>Microsoft Edge</li>
                            </ul>
                        </div>
                        <div className="rounded-2xl border border-border bg-secondary p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Tv className="h-6 w-6 text-primary" />
                                <h4 className="text-lg font-bold text-card-foreground">TV</h4>
                            </div>
                            <ul className="space-y-2 text-muted-foreground">
                                <li><b>LG (WebOS):</b> Versão 4.5.0+, modelos Série 7 em diante.</li>
                                <li><b>Samsung (Tizen):</b> Modelos Série 7 em diante.</li>
                                <li>Amazon Fire TV</li>
                                <li>Android TV & Roku</li>
                                <li>Chromecast</li>
                            </ul>
                        </div>
                        <div className="rounded-2xl border border-border bg-secondary p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Smartphone className="h-6 w-6 text-primary" />
                                <h4 className="text-lg font-bold text-card-foreground">Celulares e Tablets</h4>
                            </div>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>Celulares e Tablets Android</li>
                                <li>iPhone e iPad (iOS)</li>
                            </ul>
                            <p className="text-xs text-muted-foreground/80 mt-4">
                                Baixe nosso app na sua loja de aplicativos.
                            </p>
                        </div>
                    </div>
                 </DialogContent>
            </Dialog>
            
            {/* Floating "Veja como acessar" button */}
            {showAccessButton && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <Button onClick={handleOpenAccessModal} size="lg">Veja como acessar</Button>
                </motion.div>
            )}
        </>
    );
}

