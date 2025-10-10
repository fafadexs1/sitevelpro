
"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Tv, Smartphone, Loader2, Computer, AlertTriangle, Search } from "lucide-react";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Input } from "../ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";


type Channel = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string;
};

type TvPackage = {
    id: string;
    name: string;
};

type PackageChannel = {
    package_id: string;
    channel_id: string;
};

// Componente para um único card de canal na lista lateral (Desktop)
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

// Componente para o carrossel de logos no Mobile
const MobileChannelScroller = ({ channels, selectedChannel, onSelect }: { channels: Channel[], selectedChannel: Channel | null, onSelect: (channel: Channel) => void }) => (
    <div className="w-full border-b border-border p-2">
        <ScrollArea className="w-full whitespace-nowrap">
             <div className="flex w-max space-x-2 p-2">
                {channels.map(channel => (
                    <button
                        key={channel.id}
                        onClick={() => onSelect(channel)}
                        className={cn(
                            "w-20 h-20 rounded-xl bg-card border flex items-center justify-center p-2 transition-all duration-300",
                            selectedChannel?.id === channel.id
                                ? "border-primary scale-105 shadow-lg"
                                : "border-border hover:border-border-hover"
                        )}
                    >
                        <Image src={channel.logo_url} alt={channel.name} width={64} height={64} className="object-contain" unoptimized />
                    </button>
                ))}
            </div>
             <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
    </div>
);


export function TvPage() {
    const [allChannels, setAllChannels] = useState<Channel[]>([]);
    const [packages, setPackages] = useState<TvPackage[]>([]);
    const [packageChannels, setPackageChannels] = useState<PackageChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPackageId, setSelectedPackageId] = useState<string>('all');
    const isMobile = useIsMobile();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const supabase = createClient();
            const { data: channelsData, error: channelsError } = await supabase.from("tv_channels").select("id, name, description, logo_url").order("name", { ascending: true });
            const { data: packagesData, error: packagesError } = await supabase.from("tv_packages").select("id, name").order("name", { ascending: true });
            const { data: relationsData, error: relationsError } = await supabase.from("tv_package_channels").select("package_id, channel_id");

            if (channelsError || packagesError || relationsError) {
                console.error("Error fetching TV data:", channelsError || packagesError || relationsError);
            } else {
                setAllChannels(channelsData);
                setPackages(packagesData);
                setPackageChannels(relationsData);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const channelsForPackage = useMemo(() => {
        if (selectedPackageId === 'all') {
            return allChannels;
        }
        const channelIdsInPackage = packageChannels
            .filter(pc => pc.package_id === selectedPackageId)
            .map(pc => pc.channel_id);
        
        return allChannels.filter(channel => channelIdsInPackage.includes(channel.id));
    }, [selectedPackageId, allChannels, packageChannels]);

    const filteredChannels = useMemo(() => {
        return channelsForPackage.filter(channel =>
            channel.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [channelsForPackage, searchTerm]);

    useEffect(() => {
        if (!selectedChannel && filteredChannels.length > 0) {
            setSelectedChannel(filteredChannels[0]);
        } else if (filteredChannels.length === 0) {
            setSelectedChannel(null);
        } else if (selectedChannel && !filteredChannels.some(c => c.id === selectedChannel.id)) {
            setSelectedChannel(filteredChannels[0] || null);
        }
    }, [filteredChannels, selectedChannel]);

    if (loading) {
        return (
            <div className="flex items-center justify-center flex-grow bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    const PackageSelector = () => (
        <div className="border-b border-border px-2 py-2">
             <ScrollArea className="w-full whitespace-nowrap">
                 <div className="flex w-max space-x-2 p-1">
                    <button onClick={() => setSelectedPackageId('all')} className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors", selectedPackageId === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent')}>Todos os Canais</button>
                    {packages.map(pkg => (
                        <button key={pkg.id} onClick={() => setSelectedPackageId(pkg.id)} className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors", selectedPackageId === pkg.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent')}>{pkg.name}</button>
                    ))}
                 </div>
                 <ScrollBar orientation="horizontal" className="h-0" />
            </ScrollArea>
        </div>
    );

    const MainContent = () => (
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
                    <div className="mt-8 pt-6 border-t border-border">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold">Dispositivos Compatíveis</h3>
                            <p className="text-muted-foreground">Assista em suas telas favoritas, onde e quando quiser.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                            <div className="rounded-2xl border border-border bg-card p-6">
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
                            <div className="rounded-2xl border border-border bg-card p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Tv className="h-6 w-6 text-primary" />
                                    <h4 className="text-lg font-bold text-card-foreground">TV</h4>
                                </div>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>Amazon Fire TV</li>
                                    <li>Android TV & Roku</li>
                                    <li>LG (WebOS 4.5+)</li>
                                    <li>Samsung (Tizen, modelos 2018+)</li>
                                    <li>Chromecast</li>
                                </ul>
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-6">
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
                        <Alert variant="default" className="mt-8 mb-8 max-w-4xl mx-auto bg-yellow-500/5 border-yellow-500/20">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <AlertTitle className="text-yellow-700">Dica de Performance</AlertTitle>
                            <AlertDescription className="text-yellow-600">
                                Para a melhor experiência, conecte sua TV ou dispositivo de streaming diretamente ao roteador com um cabo de rede.
                            </AlertDescription>
                        </Alert>
                    </div>
                </motion.div>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Selecione um canal para ver os detalhes.</p>
                </div>
            )}
        </main>
    );
    

    return (
        <div className="bg-background text-foreground flex-grow flex flex-col overflow-hidden">
             {isMobile ? (
                 <div className="flex flex-col flex-grow overflow-hidden">
                    <PackageSelector />
                    <MobileChannelScroller channels={filteredChannels} selectedChannel={selectedChannel} onSelect={setSelectedChannel} />
                    <div className="flex-grow overflow-y-auto">
                        <MainContent />
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex overflow-hidden">
                    <aside className="w-72 border-r border-border p-2 flex flex-col">
                        <h2 className="text-lg font-semibold p-2 mb-2">Canais</h2>
                        <div className="px-1 mb-2">
                             <PackageSelector />
                        </div>
                        <div className="relative mb-2 px-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar canal no pacote..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-secondary"
                            />
                        </div>
                        <ScrollArea className="flex-grow">
                            <div className="space-y-1">
                                {filteredChannels.length > 0 ? filteredChannels.map(channel => (
                                    <ChannelListItem
                                        key={channel.id}
                                        channel={channel}
                                        isSelected={selectedChannel?.id === channel.id}
                                        onSelect={() => setSelectedChannel(channel)}
                                    />
                                )) : (
                                    <p className="p-4 text-center text-sm text-muted-foreground">Nenhum canal encontrado.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </aside>
                     <MainContent />
                </div>
            )}
        </div>
    );
}

