"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

import { Button } from "@/components/ui/button";

function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];

    while (c.charAt(0) === " ") {
      c = c.substring(1, c.length);
    }

    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }

  return null;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    if (getCookie("user_consent")) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    const syncPopupState = () => {
      setIsPopupOpen(document.body.hasAttribute("data-popup-open"));
    };

    syncPopupState();

    const observer = new MutationObserver(syncPopupState);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-popup-open"] });

    return () => observer.disconnect();
  }, []);

  const handleConsent = (consent: "granted" | "denied") => {
    window.gtag?.("consent", "update", {
      ad_storage: consent,
      analytics_storage: consent,
      ad_user_data: consent,
      ad_personalization: consent,
    });

    setCookie("user_consent", consent, 365);
    setIsVisible(false);
  };

  if (!isVisible || isPopupOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 p-4 shadow-lg backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Cookie className="h-5 w-5 flex-shrink-0 text-primary" />
          <p>
            Usamos cookies para analisar o tráfego e melhorar sua experiência.{" "}
            <Link href="/politica-de-privacidade" className="underline hover:text-foreground">
              Saiba mais
            </Link>
            .
          </p>
        </div>
        <Button variant="default" onClick={() => handleConsent("granted")}>
          Aceitar tudo
        </Button>
      </div>
    </div>
  );
}
