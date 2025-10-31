

"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wifi, Upload, Download, Check, Star, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  display_on: 'sales_page' | 'main_site';
  trigger_type: 'delay' | 'exit_intent';
  trigger_value: number;
  frequency: 'once_per_session' | 'once_per_day' | 'always';
  is_active: boolean;
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


const PlanPopupContent = ({ plan }: { plan: Plan }) => {
    const priceBRL = formatBRL(plan.price);
    const firstMonthPriceBRL = plan.first_month_price ? formatBRL(plan.first_month_price) : null;
    
    return (
        <div className="p-8 text-center">
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
                            <p className="font-bold text-yellow-600 flex items-center justify-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/> 1º MÊS POR</p>
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
             <Button asChild size="lg" className="w-full mt-6">
                <Link href="/assinar">Assinar Agora <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
        </div>
    );
};

export function PopupManager({ domainType }: PopupManagerProps) {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const checkAndSetPopup = useCallback(async () => {
    if (!domainType) return;

    const supabase = createClient();
    const { data: popupData } = await supabase
      .from("popups")
      .select("*, plans(*)")
      .eq("is_active", true)
      .eq("display_on", domainType)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (popupData) {
      setPopup(popupData as Popup);
      if (popupData.plan_id && popupData.plans) {
          setPlan(popupData.plans as Plan);
      }
    }
  }, [domainType]);

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
      }
    }
  };

  useEffect(() => {
    if (!popup) return;

    const hasBeenShown = () => {
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
      return false; // 'always'
    };

    if (hasBeenShown()) return;

    if (popup.trigger_type === 'delay') {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, popup.trigger_value * 1000);
      return () => clearTimeout(timer);
    }

    if (popup.trigger_type === 'exit_intent') {
      const handleMouseOut = (e: MouseEvent) => {
        if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth) || (e.clientY >= window.innerHeight)) {
            if (!hasBeenShown()) {
               setIsOpen(true);
            }
        }
      };
      document.addEventListener('mouseout', handleMouseOut);
      return () => document.removeEventListener('mouseout', handleMouseOut);
    }
  }, [popup]);

  if (!isOpen || !popup) {
    return null;
  }

  return (
    <AnimatePresence>
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
          className="relative w-full max-w-lg rounded-2xl bg-card text-card-foreground shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>

          {popup.plan_id && plan ? (
            <PlanPopupContent plan={plan}/>
          ) : (
            <>
              {popup.image_url && (
                <div className="relative w-full aspect-video">
                  <Image src={popup.image_url} alt={popup.title || 'Popup Image'} layout="fill" objectFit="cover" />
                </div>
              )}
              <div className="p-8 text-center">
                {popup.title && (
                  <h2 className="text-2xl font-bold mb-2">{popup.title}</h2>
                )}
                {popup.content && (
                  <p className="text-muted-foreground mb-6">{popup.content}</p>
                )}
                {popup.button_text && popup.button_link && (
                  <Button asChild size="lg">
                    <Link href={popup.button_link}>{popup.button_text}</Link>
                  </Button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
