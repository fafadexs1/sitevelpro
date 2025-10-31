
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Popup = {
  id: string;
  name: string;
  title: string;
  content: string;
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

export function PopupManager({ domainType }: PopupManagerProps) {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const checkAndSetPopup = useCallback(async () => {
    if (!domainType) return;

    const supabase = createClient();
    const { data } = await supabase
      .from("popups")
      .select("*")
      .eq("is_active", true)
      .eq("display_on", domainType)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setPopup(data as Popup);
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
