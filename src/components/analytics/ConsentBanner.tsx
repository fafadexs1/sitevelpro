
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Cookie } from "lucide-react";

// Função para definir um cookie
function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Função para obter um cookie
function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}


export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Se o cookie de consentimento já foi definido, não mostre o banner
    if (!getCookie("user_consent")) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (consent: "granted" | "denied") => {
    const consentState = {
        'ad_storage': consent,
        'analytics_storage': consent,
        'ad_user_data': consent,
        'ad_personalization': consent,
    };
    
    // @ts-ignore
    window.gtag('consent', 'update', consentState);
    
    // Salva a escolha do usuário em um cookie que expira em 1 ano
    setCookie("user_consent", consent, 365);
    
    // Esconde o banner
    setIsVisible(false);
  };
  
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900/80 backdrop-blur-sm border-t border-white/10 p-4 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-3 text-white/80">
          <Cookie className="w-5 h-5 text-primary flex-shrink-0" />
          <p>
            Usamos cookies para analisar o tráfego e melhorar sua experiência.{" "}
            <Link href="/politica-de-privacidade" className="underline hover:text-white">Saiba mais</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" onClick={() => handleConsent("denied")}>
            Recusar
          </Button>
          <Button variant="default" onClick={() => handleConsent("granted")}>
            Aceitar Tudo
          </Button>
        </div>
      </div>
    </div>
  );
}
