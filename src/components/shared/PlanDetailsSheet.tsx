"use client";

import { useState } from "react";
import {
    Wifi, Upload, Download, Tv, Smartphone, Check, Star, ArrowRight,
    Server, Shield, Phone
} from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

// Re-export type if needed or just use it here
export type Plan = {
    id: string;
    type: 'residencial' | 'empresarial';
    speed: string;
    upload_speed: string | null;
    download_speed: string | null;
    price: number;
    original_price: number | null;
    first_month_price: number | null;
    features: string[] | null;
    highlight: boolean;
    has_tv: boolean;
    featured_channel_ids: string[] | null;
    whatsapp_number: string | null;
    whatsapp_message: string | null;
    conditions: string | null;
};

// Hardcoded Enterprise Plans removed - data is now in DB

const ICONS: { [key: string]: React.ElementType } = {
    check: Check,
    wifi: Wifi,
    upload: Upload,
    download: Download,
    tv: Tv,
    smartphone: Smartphone,
};

const addons = [
    { name: "IP Fixo", price: "50,00", icon: Server },
    { name: "Upload 50%", price: "9,90", icon: Upload },
    { name: "Filtro de Conteúdo", price: "9,90", icon: Shield },
    { name: "Garantia de Banda Monitorada", price: "Consulte", icon: Server },
];

const formatBRL = (value: number) =>
    value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const getFeatureIcon = (feature: string) => {
    const parts = feature.split(':');
    const iconName = parts.length > 1 ? parts[0].trim().toLowerCase() : 'check';
    const IconComponent = ICONS[iconName] || Check;
    const text = parts.length > 1 ? parts.slice(1).join(':').trim() : feature;

    return {
        Icon: IconComponent,
        text: text,
    };
};

export const PlanDetailsSheet = ({ plan, children }: { plan: Plan, children: React.ReactNode }) => {
    const isEmpresarial = plan.type === 'empresarial';
    const bgColor = isEmpresarial ? "bg-neutral-950" : "bg-white";
    const textColor = isEmpresarial ? "text-white" : "text-neutral-900";
    const subTextColor = isEmpresarial ? "text-neutral-400" : "text-neutral-500";
    const borderColor = isEmpresarial ? "border-white/5" : "border-neutral-200";
    const cardBg = isEmpresarial ? "bg-neutral-900/50 border-white/5" : "bg-neutral-50 border-neutral-100";

    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

    // Toggle addon selection
    const toggleAddon = (addonName: string) => {
        setSelectedAddons(prev =>
            prev.includes(addonName)
                ? prev.filter(a => a !== addonName)
                : [...prev, addonName]
        );
    };

    // Generate WhatsApp Link with Addons
    const getWhatsappLink = () => {
        let message = plan.whatsapp_message || '';

        if (isEmpresarial && selectedAddons.length > 0) {
            message += `\n\nTenho interesse também nos adicionais:\n${selectedAddons.map(a => `- ${a}`).join('\n')}`;
        }

        return `https://wa.me/${plan.whatsapp_number}?text=${encodeURIComponent(message)}`;
    };

    // Helper to format the condition text
    const formatConditions = (text: string) => {
        // Split by common dividers used in legal text
        return text.split(/(?<=[.!?])\s+(?=[A-Z])|(?=📌)|(?=♦)|(?=•)|(?=Obs:)/g).map((part, index) => {
            const trimmed = part.trim();
            if (!trimmed) return null;
            return (
                <p key={index} className={`mb-1.5 ${trimmed.length < 50 ? 'font-medium' : ''}`}>
                    {trimmed}
                </p>
            );
        });
    };

    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className={`w-[400px] sm:w-[540px] border-l ${borderColor} ${bgColor} ${textColor} overflow-y-auto z-[9999] p-0 flex flex-col h-full`}>
                <SheetHeader className="p-6 pb-2 text-left shrink-0">
                    <SheetTitle className={`text-xl font-bold flex items-center gap-2 ${textColor}`}>
                        Detalhes do Plano
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-4">
                    {/* Main Card - Compact */}
                    <div className={`p-5 rounded-2xl border ${cardBg} relative overflow-hidden shrink-0`}>
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                            <Wifi className={`w-24 h-24 ${isEmpresarial ? 'text-white' : 'text-neutral-900'}`} />
                        </div>
                        <div className="flex flex-col gap-0.5 mb-4 relative z-10">
                            <span className="text-xs text-green-500 font-bold tracking-wider uppercase">Plano Selecionado</span>
                            <h3 className={`text-4xl font-black ${textColor}`}>{plan.speed.replace(/\D/g, '')} MEGA</h3>
                        </div>

                        <Separator className={`${isEmpresarial ? 'bg-white/5' : 'bg-neutral-200'} my-4`} />

                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative z-10">
                            {plan.features?.map(f => {
                                const { Icon, text } = getFeatureIcon(f);
                                return (
                                    <li key={f} className={`flex items-center gap-2 text-sm ${isEmpresarial ? 'text-neutral-300' : 'text-neutral-600'}`}>
                                        <Icon className="w-4 h-4 text-green-500 shrink-0" />
                                        <span className="line-clamp-1">{text}</span>
                                    </li>
                                );
                            })}
                            <li className={`flex items-center gap-2 text-sm ${isEmpresarial ? 'text-neutral-300' : 'text-neutral-600'}`}>
                                <Check className="w-4 h-4 text-green-500 shrink-0" />
                                <span className="line-clamp-1">Link 100% Fibra Óptica</span>
                            </li>
                            {!isEmpresarial && plan.download_speed && (
                                <li className="flex items-center gap-2 text-sm text-neutral-600">
                                    <Download className="w-4 h-4 text-green-500 shrink-0" />
                                    <span className="line-clamp-1">Download {plan.download_speed}</span>
                                </li>
                            )}
                            {!isEmpresarial && plan.upload_speed && (
                                <li className="flex items-center gap-2 text-sm text-neutral-600">
                                    <Upload className="w-4 h-4 text-green-500 shrink-0" />
                                    <span className="line-clamp-1">Upload {plan.upload_speed}</span>
                                </li>
                            )}
                        </ul>

                        <div className={`mt-4 pt-4 border-t ${isEmpresarial ? 'border-white/5' : 'border-neutral-200'} flex flex-col gap-1`}>
                            {plan.first_month_price ? (
                                <div className="flex flex-col items-center justify-center py-2">
                                    <div className="flex items-center gap-1.5 mb-1 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-bold text-yellow-600 uppercase tracking-wide">1º Mês Por</span>
                                    </div>
                                    <div className={`text-4xl font-black ${textColor} leading-tight`}>
                                        R$ {formatBRL(plan.first_month_price)}
                                    </div>
                                    <div className={`text-xs ${subTextColor} mt-1 font-medium`}>
                                        Após, R$ {formatBRL(plan.price)}/mês
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full py-1">
                                    <div className={`text-sm font-medium ${subTextColor}`}>Mensalidade</div>
                                    <div className="flex flex-col items-end">
                                        {plan.original_price && (
                                            <span className={`text-xs line-through ${subTextColor}`}>
                                                De R$ {formatBRL(plan.original_price)}
                                            </span>
                                        )}
                                        <div className={`text-3xl font-black ${textColor} leading-none`}>
                                            R$ {formatBRL(plan.price)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {isEmpresarial && (
                        <div className="shrink-0">
                            <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${textColor}`}>
                                Adicionais (Selecione)
                            </h4>
                            <div className="flex flex-col gap-2">
                                {addons.map((addon) => {
                                    const isSelected = selectedAddons.includes(addon.name);
                                    return (
                                        <div
                                            key={addon.name}
                                            onClick={() => toggleAddon(addon.name)}
                                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200
                        ${isSelected
                                                    ? 'bg-green-500/10 border-green-500/50'
                                                    : `${isEmpresarial ? 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]' : 'border-neutral-200'}`
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                          ${isSelected ? 'bg-green-500 border-green-500' : 'border-neutral-600'}`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-md ${isEmpresarial ? 'bg-neutral-900' : 'bg-neutral-100'} text-green-500`}>
                                                        <addon.icon className="w-4 h-4" />
                                                    </div>
                                                    <p className={`text-sm font-medium ${isSelected ? 'text-green-500' : textColor}`}>{addon.name}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-semibold ${isSelected ? 'text-green-500' : 'text-neutral-500'}`}>
                                                {addon.price === 'Consulte' ? 'Consulte' : `+ ${addon.price}`}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Conditions Section - Scrollable if needed */}
                    {plan.conditions && (
                        <div className={`p-3 rounded-xl border ${isEmpresarial ? 'border-white/5 bg-white/[0.02]' : 'border-neutral-100 bg-neutral-50'}`}>
                            <h4 className={`font-semibold text-xs mb-2 ${textColor} flex items-center gap-2 uppercase tracking-wider opacity-80`}>
                                <div className="w-1 h-3 bg-green-500 rounded-full" />
                                Condições da Oferta
                            </h4>
                            <div className={`text-[11px] leading-relaxed ${subTextColor} space-y-1`}>
                                {formatConditions(plan.conditions)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions - Fixed at bottom */}
                <div className={`p-6 pt-2 mt-auto border-t ${isEmpresarial ? 'border-white/5' : 'border-neutral-100'} bg-transparent sm:bg-transparent`}>
                    <div className="space-y-2">
                        {!isEmpresarial ? (
                            <Button
                                id={`cta-site-${plan.type}-${plan.speed.replace(/\s+/g, '-').toLowerCase()}`}
                                data-track-event="cta_click"
                                data-track-prop-button-id={`cta-site-${plan.type}-${plan.speed.replace(/\s+/g, '-').toLowerCase()}`}
                                data-track-prop-plan-name={plan.speed}
                                className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition-all"
                                asChild
                            >
                                <Link href="/assinar">
                                    Contratar pelo Site
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                id={`cta-whatsapp-${plan.type}-${plan.speed.replace(/\s+/g, '-').toLowerCase()}`}
                                data-track-event="cta_click"
                                data-track-prop-button-id={`cta-whatsapp-${plan.type}-${plan.speed.replace(/\s+/g, '-').toLowerCase()}`}
                                data-track-prop-plan-name={plan.speed}
                                className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-lg transition-all"
                                asChild
                            >
                                <a href={getWhatsappLink()} target="_blank" rel="noopener noreferrer">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Contratar Agora
                                    {selectedAddons.length > 0 && <span className="ml-1 text-xs font-normal opacity-80">({selectedAddons.length} opcionais)</span>}
                                </a>
                            </Button>
                        )}

                        {!isEmpresarial && (
                            <Button
                                variant="outline"
                                id={`whatsapp-plano-${plan.type}-${plan.speed.replace(/\s+/g, '-').toLowerCase()}`}
                                data-track-event="cta_click"
                                data-track-prop-button-id={`cta-whatsapp-${plan.type}-${plan.speed.replace(/\s+/g, '-').toLowerCase()}`}
                                data-track-prop-plan-name={plan.speed}
                                className={`w-full h-10 text-sm font-semibold ${textColor} border-border hover:bg-neutral-100`}
                                asChild
                            >
                                <a href={`https://wa.me/${plan.whatsapp_number || '5508003810404'}?text=${encodeURIComponent(plan.whatsapp_message || 'Olá, tenho interesse neste plano.')}`} target="_blank" rel="noopener noreferrer">
                                    <Smartphone className="w-4 h-4 mr-2" />
                                    Falar no WhatsApp
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
