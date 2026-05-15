"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Check,
  Download,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Upload,
  Wifi,
  X,
} from "lucide-react";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type Plan = {
  id: string;
  type: "residencial" | "empresarial";
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

export type Popup = {
  id: string;
  name: string;
  plan_id: string | null;
  title: string | null;
  content: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  button_action_type: "link" | "whatsapp" | "phone";
  button_whatsapp_message: string | null;
  display_on: "sales_page" | "main_site";
  trigger_type: "delay" | "exit_intent";
  trigger_value: number;
  frequency: "once_per_session" | "once_per_day" | "always";
  is_active: boolean;
  plans: Plan | null;
};

export interface PopupManagerProps {
  domainType: "sales_page" | "main_site" | null;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const ICONS: Record<string, React.ElementType> = {
  check: Check,
  wifi: Wifi,
  upload: Upload,
  download: Download,
};

const formatBRL = (value: number | string | null) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0,00";
  }

  return numericValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const generatePlanSlug = (plan: Pick<Plan, "type" | "speed">) =>
  `${plan.type}-${plan.speed.replace(/\s+/g, "-").toLowerCase()}`;

const getFeatureIcon = (feature: string) => {
  const parts = feature.split(":");
  const iconName = parts.length > 1 ? parts[0].trim().toLowerCase() : "check";
  const IconComponent = ICONS[iconName] || Check;
  const text = parts.length > 1 ? parts.slice(1).join(":").trim() : feature;

  return { Icon: IconComponent, text };
};

function PlanPopupContent({ plan }: { plan: Plan }) {
  const priceBRL = formatBRL(plan.price);
  const firstMonthPriceBRL = plan.first_month_price ? formatBRL(plan.first_month_price) : null;
  const displayPrice = firstMonthPriceBRL || priceBRL;
  const [priceInteger, priceDecimal = "00"] = displayPrice.split(",");
  const slug = generatePlanSlug({ type: plan.type, speed: plan.speed });
  const planName = `${plan.speed}`;
  const features = (plan.features ?? []).slice(0, 4);

  const hasWhatsapp = Boolean(plan.whatsapp_number);
  const whatsappMessage =
    plan.whatsapp_message?.replace("{{VELOCIDADE}}", plan.speed) ||
    `Olá, gostaria de mais informações sobre o plano de ${plan.speed}.`;
  const whatsappUrl = `https://wa.me/${plan.whatsapp_number}?text=${encodeURIComponent(whatsappMessage)}`;

  const CtaButton = () => {
    if (hasWhatsapp) {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              id={`popup-cta-saiba-mais-${slug}`}
              size="lg"
              className="h-12 w-full rounded-lg bg-[#03BF03] text-base font-bold text-slate-950 hover:bg-[#029E02]"
              data-track-event="cta_click"
              data-track-prop-button-id={`cta-saiba-mais-${slug}`}
              data-track-prop-plan-name={planName}
              data-track-prop-plan-price={plan.price}
            >
              Assinar agora <ArrowRight className="ml-2 h-4 w-4" />
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
                size="lg"
                data-track-event="cta_click"
                data-track-prop-button-id={`cta-site-${slug}`}
                data-track-prop-plan-name={planName}
              >
                <Link href="/assinar">
                  Continuar pelo site
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                id={`whatsapp-plano-${slug}`}
                asChild
                variant="outline"
                size="lg"
                className="border-[#03BF03] text-[#03BF03] hover:bg-[#03BF03]/10 hover:text-[#03BF03]"
                data-track-event="cta_click"
                data-track-prop-button-id={`whatsapp-plano-${slug}`}
                data-track-prop-plan-name={planName}
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  Falar no WhatsApp
                  <Smartphone className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Button
        asChild
        size="lg"
        className="h-12 w-full rounded-lg bg-[#03BF03] text-base font-bold text-slate-950 hover:bg-[#029E02]"
        id={`popup-cta-site-${slug}`}
        data-track-event="cta_click"
        data-track-prop-button-id={`cta-site-${slug}`}
        data-track-prop-plan-name={planName}
        data-track-prop-plan-price={plan.price}
      >
        <Link href="/assinar">
          Assinar agora <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    );
  };

  return (
    <div className="grid max-h-[calc(100svh-1rem)] bg-background text-foreground sm:max-h-[calc(100svh-2rem)] md:grid-cols-[0.88fr_1.12fr]">
      <div className="relative overflow-hidden bg-[#07100d] p-4 text-white min-[420px]:p-5 sm:p-7 md:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:38px_38px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(3,191,3,0.28),transparent_28%),radial-gradient(circle_at_90%_70%,rgba(34,211,238,0.18),transparent_30%)]" />

        <div className="relative z-10 flex h-full min-h-[190px] flex-col justify-between sm:min-h-[230px] md:min-h-[330px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#03BF03]/25 bg-[#03BF03]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#03BF03] sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Oferta especial
            </div>
            <h2 className="mt-4 text-4xl font-black leading-none tracking-tight sm:mt-5 sm:text-5xl md:text-6xl">
              {plan.speed.replace(/\D/g, "")}
              <span className="ml-1 text-xl text-[#03BF03] sm:text-3xl">MEGA</span>
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/75 sm:mt-4 sm:text-base">
              Internet fibra Velpro com velocidade para streaming, jogos, trabalho remoto e casa conectada.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 text-xs sm:mt-8 sm:gap-3 sm:text-sm">
            <div className="rounded-lg border border-white/10 bg-white/10 p-2.5 backdrop-blur-md sm:p-3">
              <Wifi className="mb-1.5 h-4 w-4 text-[#03BF03] sm:mb-2 sm:h-5 sm:w-5" />
              Wi-Fi pronto
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-2.5 backdrop-blur-md sm:p-3">
              <ShieldCheck className="mb-1.5 h-4 w-4 text-cyan-200 sm:mb-2 sm:h-5 sm:w-5" />
              Fibra estável
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-col p-4 min-[420px]:p-5 sm:p-6 md:p-7">
        <div className="rounded-lg border border-border bg-secondary/70 p-4 sm:p-5">
          {firstMonthPriceBRL && (
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 sm:mb-3 sm:text-xs">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              1º mês por
            </div>
          )}

          <div className="flex items-end gap-1 text-foreground">
            <span className="pb-1.5 text-xl font-black sm:pb-2 sm:text-2xl">R$</span>
            <span className="text-5xl font-black leading-none tracking-tight sm:text-6xl">{priceInteger}</span>
            <span className="pb-1.5 text-xl font-black sm:pb-2 sm:text-2xl">,{priceDecimal}</span>
            <span className="pb-1.5 text-xs font-medium text-muted-foreground sm:pb-2 sm:text-sm">/mês</span>
          </div>

          {firstMonthPriceBRL && (
            <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">Depois, R$ {priceBRL}/mês.</p>
          )}
        </div>

        <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2">
          {features.map((feature, i) => {
            const { Icon, text } = getFeatureIcon(feature);
            return (
              <div key={i} className="flex min-h-10 items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm sm:min-h-12">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-card-foreground">{text}</span>
              </div>
            );
          })}
          {plan.download_speed && (
            <div className="flex min-h-10 items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm sm:min-h-12">
              <Download className="h-4 w-4 shrink-0 text-primary" />
              <span>Download {plan.download_speed}</span>
            </div>
          )}
          {plan.upload_speed && (
            <div className="flex min-h-10 items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm sm:min-h-12">
              <Upload className="h-4 w-4 shrink-0 text-primary" />
              <span>Upload {plan.upload_speed}</span>
            </div>
          )}
        </div>

        <div className="mt-4 sm:mt-5">
          <CtaButton />
          <p className="mt-2 text-center text-[11px] leading-4 text-muted-foreground sm:mt-3 sm:text-xs sm:leading-5">
            Consulte disponibilidade no seu endereço. Oferta sujeita à viabilidade técnica.
          </p>
        </div>
      </div>
    </div>
  );
}

function CustomPopupContent({ popup, getButtonLink }: { popup: Popup; getButtonLink: () => string }) {
  return (
    <div className="max-h-[min(92vh,720px)] overflow-y-auto bg-background">
      {popup.image_url && (
        <div className="relative aspect-video w-full">
          <Image src={popup.image_url} alt={popup.title || "Oferta Velpro"} fill className="object-cover" />
        </div>
      )}
      <div className="p-6 text-center sm:p-8">
        {popup.title && <h2 className="text-3xl font-black tracking-tight">{popup.title}</h2>}
        {popup.content && <p className="mx-auto mt-3 max-w-md text-muted-foreground">{popup.content}</p>}
        {popup.button_text && popup.button_link && (
          <Button asChild size="lg" className="mt-6 h-12 rounded-lg px-8 font-bold" id={`cta-popup-custom-${popup.id}`} data-track-event="cta_click" data-track-prop-button-id={`cta-popup-custom-${popup.id}`}>
            <a href={getButtonLink()} target={popup.button_action_type === "link" ? "_blank" : undefined} rel="noopener noreferrer">
              {popup.button_text}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export function PopupManager({
  domainType,
  popups,
}: PopupManagerProps & { popups: Popup[] }) {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedPopupId, setDismissedPopupId] = useState<string | null>(null);
  const pathname = usePathname();

  const checkAndSetPopup = useCallback(() => {
    if (!domainType || pathname !== "/") {
      setPopup(null);
      return;
    }

    const validPopup = popups.find((p) => p.display_on === domainType && p.is_active);
    setPopup(validPopup || null);
  }, [domainType, pathname, popups]);

  useEffect(() => {
    checkAndSetPopup();
  }, [pathname, checkAndSetPopup]);

  const handleClose = () => {
    setIsOpen(false);

    if (!popup) return;

    if (popup.frequency === "once_per_session") {
      sessionStorage.setItem(`popup_${popup.id}_shown`, "true");
    } else if (popup.frequency === "once_per_day") {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 1);
      localStorage.setItem(`popup_${popup.id}_shown`, expiry.toISOString());
    } else if (popup.frequency === "always") {
      setDismissedPopupId(popup.id);
    }
  };

  useEffect(() => {
    if (!popup || pathname !== "/") return;

    const hasBeenShown = () => {
      if (popup.frequency === "once_per_session") {
        return sessionStorage.getItem(`popup_${popup.id}_shown`) === "true";
      }
      if (popup.frequency === "once_per_day") {
        const expiry = localStorage.getItem(`popup_${popup.id}_shown`);
        if (expiry && new Date(expiry) > new Date()) {
          return true;
        }
        localStorage.removeItem(`popup_${popup.id}_shown`);
        return false;
      }
      if (popup.frequency === "always") {
        return dismissedPopupId === popup.id;
      }
      return false;
    };

    if (isOpen || hasBeenShown()) return;

    let timer: NodeJS.Timeout | undefined;
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isOpen && !hasBeenShown()) {
        setIsOpen(true);
      }
    };

    if (popup.trigger_type === "delay") {
      const delaySeconds = Math.max(popup.trigger_value || 0, 0);
      timer = setTimeout(() => {
        if (!hasBeenShown()) {
          setIsOpen(true);
        }
      }, delaySeconds * 1000);
    } else if (popup.trigger_type === "exit_intent") {
      document.addEventListener("mouseout", handleMouseOut);
    }

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [popup, pathname, isOpen, dismissedPopupId]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-popup-open", isOpen);
    document.body.toggleAttribute("data-popup-open", isOpen);

    return () => {
      document.documentElement.removeAttribute("data-popup-open");
      document.body.removeAttribute("data-popup-open");
    };
  }, [isOpen]);

  const getButtonLink = (): string => {
    if (!popup || !popup.button_link) return "#";
    switch (popup.button_action_type) {
      case "whatsapp": {
        const message = popup.button_whatsapp_message ? `?text=${encodeURIComponent(popup.button_whatsapp_message)}` : "";
        return `https://wa.me/${popup.button_link.replace(/\D/g, "")}${message}`;
      }
      case "phone":
        return `tel:${popup.button_link.replace(/\D/g, "")}`;
      default:
        return popup.button_link;
    }
  };

  if (!popup) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 p-2 backdrop-blur-sm sm:p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative w-full max-w-[calc(100vw-1rem)] overflow-hidden rounded-lg bg-card text-card-foreground shadow-2xl sm:max-w-4xl"
            data-popup-dialog="plan-offer"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Fechar popup"
              className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-300/70 bg-red-600 text-white shadow-[0_0_22px_rgba(220,38,38,0.45)] backdrop-blur transition-colors hover:bg-red-700"
            >
              <X className="h-4 w-4" />
            </button>

            {popup.plan_id && popup.plans ? (
              <PlanPopupContent plan={popup.plans} />
            ) : (
              <CustomPopupContent popup={popup} getButtonLink={getButtonLink} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
