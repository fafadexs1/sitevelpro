
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wifi, Upload, Download, Check, Star, ArrowRight, Smartphone } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import type { ConversionEvent } from '@/app/admin/google-ads/page';

type Plan = {
  id: string;
  type: 'residencial' | 'empresarial';
  speed: string;
  upload_speed: string | null;
  download_speed: string | null;
  price: number;
  original_price: number | null;
  first_month_price: number | null;
  features: string[] | null;
  whatsapp_number: string | null;
  whatsapp_message: string | null;
};

type Popup = {
  id: string;
  name: string;
  plan_id: string | null;
  title: string | null;
  content: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  button_action_type: 'link' | 'whatsapp' | 'phone';
  button_whatsapp_message: string | null;
  display_on: 'sales_page' | 'main_site';
  trigger_type: 'delay' | 'exit_intent';
  trigger_value: number;
  frequency: 'once_per_session' | 'once_per_day' | 'always';
  is_active: boolean;
  plans: Plan | null;
};

interface PopupManagerProps {
    domainType: 'sales_page' | 'main_site' | null;
}

const ICONS: { [key: string]: React.ElementType } = {
  check: Check,
  wifi: Wifi,
  upload: Upload,
  download: Download,
};

const getFeatureIcon = (feature: string) => {
    const parts = feature.split(':');
    const iconName = parts.length > 1 ? parts[0].trim().toLowerCase() : 'check';
    const IconComponent = ICONS[iconName] || Check;
    const text = parts.length > 1 ? parts.slice(1).join(':').trim() : feature;
    return { Icon: IconComponent, text };
};

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const generatePlanSlug = (plan: Pick<Plan, 'type' | 'speed'>) => {
    return `${plan.type}-${plan.speed.replace(/\s+/g, '-').toLowerCase()}`;
}

const PlanPopupContent = ({ plan }: { plan: Plan }) => {
    const priceBRL = formatBRL(plan.price);
    const firstMonthPriceBRL = plan.first_month_price ? formatBRL(plan.first_month_price) : null;
    const slug = generatePlanSlug({type: plan.type, speed: plan.speed});
    const planName = `${plan.speed}`;
    const hasWhatsapp = !!plan.whatsapp_number;
    const whatsappMessage = plan.whatsapp_message?.replace('{{VELOCIDADE}}', plan.speed) || `Olá, gostaria de mais informações sobre o plano de ${plan.speed}.`;
    const whatsappUrl = `https://wa.me/${plan.whatsapp_number}?text=${encodeURIComponent(whatsappMessage)}`;

    const CtaButton = () => {
        if (hasWhatsapp) {
            return (
                <Dialog>
                    <DialogTrigger asChild>
                         <Button 
                            id={`popup-cta-saiba-mais-${slug}`}
                            size="lg" 
                            className="w-full mt-6"
                            data-track-event="cta_click"
                            data-track-prop-button-id={`cta-saiba-mais-${slug}`}
                            data-track-prop-plan-name={planName}
                            data-track-prop-plan-price={plan.price}
                         >
                            Assinar Agora <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card text-card-foreground">
                        <DialogHeader>
                            <DialogTitle>Como você prefere contratar?</DialogTitle>
                            <DialogDescription>
                                Escolha a melhor forma de contratar o plano de {planName}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 pt-4">
                             <Button 
                                id={`cta-site-${slug}`}
                                asChild 
                                variant="default" 
                                size="lg"
                                data-track-event="cta_click"
                                data-track-prop-button-id={`cta-site-${slug}`}
                                data-track-prop-plan-name={planName}
                            >
                                <Link href="/assinar">
                                    Continuar pelo site
                                    <ArrowRight className="ml-2 h-4 w-4"/>
                                </Link>
                            </Button>
                            <Button 
                                id={`whatsapp-plano-${slug}`}
                                asChild 
                                variant="outline" 
                                size="lg" 
                                className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                                data-track-event="cta_click"
                                data-track-prop-button-id={`whatsapp-plano-${slug}`}
                                data-track-prop-plan-name={planName}
                            >
                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                    Falar no WhatsApp
                                    <Smartphone className="ml-2 h-4 w-4"/>
                                </a>
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            );
        }

        return (
            <Button 
                asChild size="lg" 
                className="w-full mt-6"
                id={`popup-cta-site-${slug}`}
                data-track-event="cta_click"
                data-track-prop-button-id={`cta-site-${slug}`}
                data-track-prop-plan-name={planName}
                data-track-prop-plan-price={plan.price}
            >
                <Link href="/assinar">Assinar Agora <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
        )
    }

    return (
        <div className="p-6 sm:p-8 text-center">
            <h2 className="text-xl font-bold mb-1 text-primary">Oferta Especial!</h2>
            <p className="text-muted-foreground mb-4">Confira este plano que separamos para você:</p>
            <div className="rounded-2xl border bg-secondary p-6 text-left">
                <div className="text-center mb-4">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">{plan.speed.replace(/\D/g, '')}</span>
                    <span className="text-2xl font-bold text-foreground">MEGA</span>
                </div>
                <ul className="mb-6 space-y-2">
                    {(plan.features ?? []).map((feature, i) => {
                    const { Icon, text } = getFeatureIcon(feature);
                    return (
                        <li key={i} className="flex items-center gap-3 text-sm">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{text}</span>
                        </li>
                    );
                    })}
                </ul>
                <div className="text-center">
                    {firstMonthPriceBRL ? (
                        <>
                            <p className="font-bold text-yellow-600 flex items-center justify-center gap-1"><Star className="w-4 w-4 text-yellow-500 fill-yellow-500"/> 1º MÊS POR</p>
                            <div className="flex items-baseline justify-center gap-1 whitespace-nowrap text-foreground">
                                <span className="font-bold text-2xl">R$</span>
                                <span className="font-bold text-4xl">{firstMonthPriceBRL.split(',')[0]}</span>
                                <span className="font-bold text-xl">,{firstMonthPriceBRL.split(',')[1]}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-baseline justify-center gap-1 whitespace-nowrap text-foreground">
                            <span className="font-bold text-2xl">R$</span>
                            <span className="font-bold text-4xl">{priceBRL.split(',')[0]}</span>
                            <span className="font-bold text-xl">,{priceBRL.split(',')[1]}</span>
                            <span className="text-muted-foreground text-sm">/mês</span>
                        </div>
                    )}
                </div>
            </div>
            <CtaButton />
        </div>
    );
};

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

export function PopupManager({ domainType }: PopupManagerProps) {
    const [popup, setPopup] = useState<Popup | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const [conversionEvents, setConversionEvents] = useState<ConversionEvent[]>([]);

    const trackGtagConversion = useCallback((event: ConversionEvent) => {
        if (typeof window.gtag === 'function') {
            try {
                const snippetFunc = new Function('gtag', event.event_snippet);
                snippetFunc(window.gtag);
                 console.log(`[Popup] Conversion event tracked: ${event.name}`);
            } catch (e) {
                console.error(`[Popup] Error executing event snippet for "${event.name}":`, e);
            }
        } else {
            console.warn(`[Popup] gtag not found. Could not track event: ${event.name}`);
        }
    }, []);
    
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (conversionEvents.length === 0) return;
            const target = e.target as Element | null;
            if (!target) return;

            conversionEvents.forEach((event) => {
            if (event.selector && target.closest(event.selector)) {
                trackGtagConversion(event);
            }
            });
        };

        document.addEventListener('click', handler, { capture: true });
        return () => document.removeEventListener('click', handler, { capture: true } as any);
    }, [conversionEvents, trackGtagConversion]);
    
    useEffect(() => {
        const fetchEvents = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('conversion_events')
                .select('*')
                .eq('is_active', true);
            if (!error) {
                setConversionEvents(data);
            }
        };
        fetchEvents();
    }, []);


    const checkAndSetPopup = useCallback(async () => {
        if (!domainType || pathname !== '/') {
            setPopup(null);
            return;
        }

        const supabase = createClient();
        const { data: popupData, error } = await supabase
            .from("popups")
            .select("*, plans!inner(*)")
            .eq("is_active", true)
            .eq("display_on", domainType)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Popup fetch error:", error);
        }

        if (popupData) {
            setPopup(popupData as Popup);
        }
    }, [domainType, pathname]);

    useEffect(() => {
        checkAndSetPopup();
    }, [pathname, checkAndSetPopup]);

    const handleClose = () => {
        setIsOpen(false);
        if (popup) {
            if (popup.frequency === 'once_per_session') {
                sessionStorage.setItem(`popup_${popup.id}_shown`, 'true');
            } else if (popup.frequency === 'once_per_day') {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + 1);
                localStorage.setItem(`popup_${popup.id}_shown`, expiry.toISOString());
            } else if (popup.frequency === 'always') {
                sessionStorage.setItem(`popup_${popup.id}_closed`, 'true');
            }
        }
    };

    useEffect(() => {
        if (!popup || pathname !== '/') return;

        const hasBeenShown = () => {
             if (sessionStorage.getItem(`popup_${popup.id}_closed`) === 'true') return true;

            if (popup.frequency === 'once_per_session') {
                return sessionStorage.getItem(`popup_${popup.id}_shown`) === 'true';
            }
            if (popup.frequency === 'once_per_day') {
                const expiry = localStorage.getItem(`popup_${popup.id}_shown`);
                if (expiry && new Date(expiry) > new Date()) {
                    return true;
                }
                localStorage.removeItem(`popup_${popup.id}_shown`);
                return false;
            }
            return false;
        };

        if (isOpen || hasBeenShown()) return;

        let timer: NodeJS.Timeout;
        const handleMouseOut = (e: MouseEvent) => {
            if (e.clientY <= 0 && !isOpen && !hasBeenShown()) {
                setIsOpen(true);
            }
        };

        if (popup.trigger_type === 'delay') {
            timer = setTimeout(() => {
                if (!hasBeenShown()) {
                    setIsOpen(true);
                }
            }, popup.trigger_value * 1000);
        } else if (popup.trigger_type === 'exit_intent') {
            document.addEventListener('mouseout', handleMouseOut);
        }
        
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mouseout', handleMouseOut);
        };
    }, [popup, pathname, isOpen]);
    
    const getButtonLink = (): string => {
        if (!popup || !popup.button_link) return "#";
        switch(popup.button_action_type) {
            case 'whatsapp':
                const message = popup.button_whatsapp_message ? `?text=${encodeURIComponent(popup.button_whatsapp_message)}` : '';
                return `https://wa.me/${popup.button_link.replace(/\D/g, '')}${message}`;
            case 'phone':
                return `tel:${popup.button_link.replace(/\D/g, '')}`;
            default:
                return popup.button_link;
        }
    };

    const handlePopupClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    if (!popup) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="relative w-full max-w-sm rounded-2xl bg-card text-card-foreground shadow-2xl overflow-hidden"
                        onClick={handlePopupClick}
                    >
                        
                        {popup.plan_id && popup.plans ? (
                            <PlanPopupContent plan={popup.plans}/>
                        ) : (
                            <>
                                {popup.image_url && (
                                    <div className="relative w-full aspect-video">
                                        <Image src={popup.image_url} alt={popup.title || 'Popup Image'} layout="fill" objectFit="cover" />
                                    </div>
                                )}
                                <div className="p-6 sm:p-8 text-center">
                                    {popup.title && <h2 className="text-2xl font-bold mb-2">{popup.title}</h2>}
                                    {popup.content && <p className="text-muted-foreground mb-6">{popup.content}</p>}
                                    {popup.button_text && popup.button_link && (
                                        <Button asChild size="lg" id={`cta-popup-custom-${popup.id}`} data-track-event="cta_click" data-track-prop-button-id={`cta-popup-custom-${popup.id}`}>
                                            <a href={getButtonLink()} target={popup.button_action_type === 'link' ? '_blank' : undefined} rel="noopener noreferrer">
                                                {popup.button_text}
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                        <div className="px-6 pb-6 text-center">
                            <Button variant="destructive" size="sm" onClick={handleClose}>
                                Fechar
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
