
"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Tv, Smartphone, Loader2, Computer, AlertTriangle, Search, ArrowLeft, Package, Sparkles } from "lucide-react";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Input } from "../ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";


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

const MainContent = ({ selectedChannel }: { selectedChannel: Channel | null }) => (
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
                <p>Nenhum canal encontrado para os filtros selecionados.</p>
            </div>
        )}
    </main>
);

const ChannelGuideView = ({ pkg, allChannels, packageChannels, onBack }: { pkg: TvPackage, allChannels: Channel[], packageChannels: PackageChannel[], onBack: () => void }) => {
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const isMobile = useIsMobile();

    const channelsForPackage = useMemo(() => {
        const channelIdsInPackage = packageChannels
            .filter(pc => pc.package_id === pkg.id)
            .map(pc => pc.channel_id);
        
        return allChannels.filter(channel => channelIdsInPackage.includes(channel.id));
    }, [pkg.id, allChannels, packageChannels]);

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

    return (
        <div className="bg-background text-foreground flex-grow flex flex-col overflow-hidden">
             {isMobile ? (
                 <div className="flex flex-col flex-grow overflow-hidden">
                    <div className="p-2 border-b border-border">
                        <Button variant="ghost" onClick={onBack} className="mb-2">
                            <ArrowLeft className="w-4 h-4 mr-2"/>
                            Ver outros pacotes
                        </Button>
                    </div>
                    <MobileChannelScroller channels={filteredChannels} selectedChannel={selectedChannel} onSelect={setSelectedChannel} />
                    <div className="flex-grow overflow-y-auto">
                        <MainContent selectedChannel={selectedChannel} />
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex overflow-hidden">
                    <aside className="w-72 border-r border-border p-2 flex flex-col">
                        <div className="p-2">
                             <Button variant="ghost" onClick={onBack} className="mb-2 w-full justify-start">
                                <ArrowLeft className="w-4 h-4 mr-2"/>
                                Outros Pacotes
                            </Button>
                        </div>
                        <div className="relative my-2 px-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar no pacote..."
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
                     <MainContent selectedChannel={selectedChannel}/>
                </div>
            )}
        </div>
    );
};

export function TvPage() {
    const [allChannels, setAllChannels] = useState<Channel[]>([]);
    const [packages, setPackages] = useState<TvPackage[]>([]);
    const [packageChannels, setPackageChannels] = useState<PackageChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<TvPackage | null>(null);
    
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

    if (loading) {
        return (
            <div className="flex items-center justify-center flex-grow bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    if (selectedPackage) {
        return <ChannelGuideView pkg={selectedPackage} allChannels={allChannels} packageChannels={packageChannels} onBack={() => setSelectedPackage(null)} />;
    }

    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 bg-secondary">
             <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Nossos Pacotes de TV</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Escolha um pacote para explorar a lista completa de canais e descobrir um universo de entretenimento.
                </p>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                {packages.map(pkg => {
                    const channelCount = packageChannels.filter(pc => pc.package_id === pkg.id).length;
                    return (
                        <motion.button
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg)}
                            className="group relative text-left w-full rounded-2xl border border-border bg-card p-6 overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
                            whileHover={{ scale: 1.03 }}
                        >
                            <div className="relative z-10">
                                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-4">
                                    <Package className="w-6 h-6 text-primary"/>
                                </div>
                                <h2 className="text-2xl font-bold text-card-foreground">{pkg.name}</h2>
                                <p className="text-muted-foreground mt-2">{channelCount} canais inclusos</p>
                                <div className="mt-4 text-primary font-semibold flex items-center gap-2">
                                    Ver canais do pacote
                                    <ArrowLeft className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1 rotate-180" />
                                </div>
                            </div>
                           <Sparkles className="absolute -bottom-8 -right-8 w-32 h-32 text-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        </motion.button>
                    )
                })}
            </div>
        </div>
    );
}

