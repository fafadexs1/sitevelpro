
"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Tv, Search, ArrowLeft, Package, Sparkles } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

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

const ChannelGridCard = ({ channel }: { channel: Channel }) => (
    <div className="relative aspect-square w-full rounded-xl bg-card border border-border flex items-center justify-center p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
        <Image
            src={channel.logo_url}
            alt={channel.name}
            width={80}
            height={80}
            className="object-contain"
            unoptimized
        />
        <p className="absolute bottom-2 text-center text-[10px] text-muted-foreground">{channel.name}</p>
    </div>
);


const ChannelGuideView = ({ pkg, allChannels, packageChannels, onBack }: { pkg: TvPackage, allChannels: Channel[], packageChannels: PackageChannel[], onBack: () => void }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const channelsForPackage = useMemo(() => {
        const channelIdsInPackage = packageChannels
            .filter(pc => pc.package_id === pkg.id)
            .map(pc => pc.channel_id);
        
        return allChannels.filter(channel => channelIdsInPackage.includes(channel.id));
    }, [pkg.id, allChannels, packageChannels]);

    const filteredChannels = useMemo(() => {
        if (!searchTerm) return channelsForPackage;
        return channelsForPackage.filter(channel =>
            channel.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [channelsForPackage, searchTerm]);

    return (
        <div className="bg-background text-foreground flex-grow flex flex-col overflow-hidden w-full p-4 sm:p-8">
             <div className="flex-shrink-0 mb-8">
                 <Button variant="ghost" onClick={onBack} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2"/>
                    Ver outros pacotes
                </Button>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold">{pkg.name}</h1>
                        <p className="text-muted-foreground">{filteredChannels.length} canais inclusos</p>
                    </div>
                     <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar canal no pacote..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-secondary"
                        />
                    </div>
                </div>
            </div>

             <ScrollArea className="flex-grow">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 pr-4">
                    {filteredChannels.length > 0 ? filteredChannels.map(channel => (
                        <ChannelGridCard key={channel.id} channel={channel} />
                    )) : (
                        <p className="col-span-full text-center text-muted-foreground py-16">Nenhum canal encontrado com esse nome.</p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export function TvPage() {
    const [allChannels, setAllChannels] = useState<Channel[]>([]);
    const [packages, setPackages] = useState<TvPackage[]>([]);
    const [packageChannels, setPackageChannels] = useState<PackageChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<TvPackage | null>(null);
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

    const PackageCard = ({ pkg }: { pkg: TvPackage }) => {
        const channelCount = packageChannels.filter(pc => pc.package_id === pkg.id).length;
        return (
             <motion.button
                onClick={() => setSelectedPackage(pkg)}
                className="group relative text-left w-full h-full rounded-2xl border border-border bg-card p-6 overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
                whileHover={{ scale: 1.03 }}
            >
                <div className="relative z-10">
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-4">
                        <Tv className="w-6 h-6 text-primary"/>
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
    }

    if (loading) {
        return null;
    }
    
    if (selectedPackage) {
        return <ChannelGuideView pkg={selectedPackage} allChannels={allChannels} packageChannels={packageChannels} onBack={() => setSelectedPackage(null)} />;
    }

    return (
        <div className="flex-grow flex flex-col items-center p-4 sm:p-8 bg-secondary overflow-y-auto">
             <div className="text-center mb-12 w-full">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Nossos Pacotes de TV</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Escolha um pacote para explorar a lista completa de canais e descobrir um universo de entretenimento.
                </p>
            </div>
             
             {isMobile ? (
                <Carousel className="w-full max-w-sm">
                    <CarouselContent className="-ml-2">
                        {packages.map(pkg => (
                            <CarouselItem key={pkg.id} className="pl-2 basis-3/4">
                                <div className="p-1 h-full">
                                    <PackageCard pkg={pkg} />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                    {packages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
                </div>
             )}
        </div>
    );
}
