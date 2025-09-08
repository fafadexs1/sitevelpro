
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, Server, Wifi, Gamepad2, MapPin, RadioTower } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Status = "operational" | "degraded" | "outage";

interface ServiceStatus {
  name: string;
  status: Status;
  latency?: number;
}

const statusConfig = {
  operational: {
    icon: <CheckCircle className="h-5 w-5 text-green-400" />,
    text: "Operacional",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20",
    pingColor: "text-green-300",
  },
  degraded: {
    icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    text: "Performance Degradada",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/20",
    pingColor: "text-yellow-300",
  },
  outage: {
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    text: "Indisponibilidade",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    pingColor: "text-red-400",
  },
};

const initialRegions: ServiceStatus[] = [
    { name: "Valparaíso", status: "operational", latency: 5 },
    { name: "Cidade Ocidental", status: "operational", latency: 7 },
    { name: "Luziânia", status: "operational", latency: 6 },
    { name: "Ponte Alta Norte", status: "degraded", latency: 22 },
];

const initialGames: ServiceStatus[] = [
    { name: "Valorant (SP)", status: "operational", latency: 12 },
    { name: "CS2 (SP)", status: "operational", latency: 15 },
    { name: "League of Legends (SP)", status: "operational", latency: 18 },
];

const initialServices: ServiceStatus[] = [
    { name: "Website", status: "operational" },
    { name: "Área do Cliente", status: "operational" },
    { name: "Autenticação (PPPoE)", status: "operational" },
    { name: "Servidores DNS", status: "operational" },
];

const incidents = [
    { date: "2025-09-08", title: "Manutenção programada em Luziânia", description: "Realizamos uma atualização em nossa infraestrutura de fibra em Luziânia para aumentar a capacidade. O serviço foi normalizado às 04:00.", status: "resolved" },
    { date: "2025-09-08", title: "Instabilidade em Ponte Alta Norte", description: "Identificamos uma degradação de performance em Ponte Alta Norte devido a um equipamento de distribuição. Nossos engenheiros estão atuando no local.", status: "monitoring" },
];

const Globe = () => (
     <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" style={{stopColor: "rgba(4, 189, 3, 0.15)", stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: "rgba(4, 189, 3, 0)", stopOpacity: 1}} />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad1)" />
        </svg>
    </div>
)


export default function StatusPage() {
    const [regions, setRegions] = useState(initialRegions);
    const [games, setGames] = useState(initialGames);

    useEffect(() => {
        const interval = setInterval(() => {
            const jitter = () => Math.floor(Math.random() * 5) - 2;
            setRegions(prev => prev.map(r => ({...r, latency: Math.max(5, (r.latency ?? 0) + jitter())})));
            setGames(prev => prev.map(g => ({...g, latency: Math.max(10, (g.latency ?? 0) + jitter())})));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const overallStatus = regions.some(r => r.status === 'outage') ? 'outage' : regions.some(r => r.status === 'degraded') ? 'degraded' : 'operational';

    const renderStatusCard = (item: ServiceStatus, isGame = false) => (
        <div key={item.name} className={cn("p-4 rounded-lg flex items-center justify-between border", statusConfig[item.status].borderColor, statusConfig[item.status].bgColor)}>
            <div className="flex items-center gap-3">
                {isGame ? <Gamepad2 className="h-5 w-5 text-white/60"/> : <MapPin className="h-5 w-5 text-white/60"/>}
                <span className="font-medium text-white/90">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
                {item.latency && (
                    <span className={cn("font-mono text-lg", statusConfig[item.status].pingColor)}>
                        {item.latency}ms
                    </span>
                )}
                {statusConfig[item.status].icon}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            <Header />
            <main className="flex-grow">
                 <div className="relative border-b border-white/5 py-16 sm:py-24 overflow-hidden">
                    <Globe />
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                         <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm" style={{
                            backgroundColor: statusConfig[overallStatus].bgColor.replace('bg-',''),
                            color: statusConfig[overallStatus].color.replace('text-','')
                         }}>
                            {statusConfig[overallStatus].icon}
                            <span>{statusConfig[overallStatus].text}</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Status da Rede</h1>
                        <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
                            Acompanhe em tempo real a performance da nossa infraestrutura, latência para jogos e o status dos serviços em sua região.
                        </p>
                    </div>
                </div>

                <div className="py-12 sm:py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Coluna Esquerda: Games e Regiões */}
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4"><Gamepad2 className="text-primary"/>Latência para Jogos</h2>
                                    <div className="space-y-3">
                                        {games.map(game => renderStatusCard(game, true))}
                                    </div>
                                </div>
                                 <div>
                                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4"><MapPin className="text-primary"/>Status por Região</h2>
                                    <div className="space-y-3">
                                        {regions.map(region => renderStatusCard(region))}
                                    </div>
                                </div>
                            </div>

                            {/* Coluna Direita: Serviços e Incidentes */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-semibold flex items-center gap-3 mb-4"><Server className="text-primary"/>Serviços da Plataforma</h2>
                                    <div className="space-y-3">
                                        {initialServices.map(service => (
                                             <div key={service.name} className="flex items-center justify-between text-sm p-3 rounded-lg bg-neutral-900 border border-white/10">
                                                <span className="text-white/80">{service.name}</span>
                                                <div className={cn("flex items-center gap-2", statusConfig[service.status].color)}>
                                                    {statusConfig[service.status].icon}
                                                    <span className="text-xs">{statusConfig[service.status].text}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold flex items-center gap-3 mb-4"><RadioTower className="text-primary"/>Histórico de Incidentes</h2>
                                    <div className="space-y-4">
                                        {incidents.map(incident => (
                                            <div key={incident.title} className="relative pl-8">
                                                <div className={cn(
                                                    "absolute left-3 top-1.5 h-full w-px",
                                                    incident.status === "resolved" ? "bg-green-400/20" : "bg-yellow-400/20"
                                                )}/>
                                                <div className={cn(
                                                    "absolute left-[6.5px] top-1.5 h-3.5 w-3.5 rounded-full border-2",
                                                    incident.status === "resolved" ? "bg-green-400/20 border-green-400" : "bg-yellow-400/20 border-yellow-400 animate-pulse"
                                                )}/>
                                                <p className="text-xs text-white/60">{incident.date}</p>
                                                <h3 className="font-semibold text-white/90">{incident.title}</h3>
                                                <p className="text-sm text-white/70">{incident.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
