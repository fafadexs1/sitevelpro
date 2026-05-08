"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

function WhatsAppIcon({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="currentColor">
            <path d="M16.02 3.2c-7.02 0-12.72 5.63-12.72 12.57 0 2.22.6 4.39 1.72 6.29L3.2 28.8l6.93-1.78a12.87 12.87 0 0 0 5.89 1.48c7.02 0 12.72-5.63 12.72-12.57S23.04 3.2 16.02 3.2Zm0 22.98c-1.92 0-3.8-.52-5.43-1.49l-.39-.23-4.11 1.06 1.09-3.96-.26-.41a10.18 10.18 0 0 1-1.58-5.38c0-5.65 4.65-10.24 10.38-10.24s10.38 4.59 10.38 10.24-4.65 10.41-10.08 10.41Zm5.69-7.66c-.31-.15-1.84-.9-2.12-1-.28-.1-.49-.15-.7.15-.2.3-.8 1-.98 1.2-.18.2-.36.23-.67.08-.31-.15-1.31-.48-2.49-1.52-.92-.81-1.54-1.81-1.72-2.11-.18-.3-.02-.46.14-.61.14-.14.31-.36.46-.53.15-.18.2-.3.31-.51.1-.2.05-.38-.03-.53-.08-.15-.7-1.66-.95-2.27-.25-.59-.5-.51-.7-.52h-.6c-.2 0-.53.08-.81.38-.28.3-1.06 1.02-1.06 2.49s1.09 2.9 1.24 3.1c.15.2 2.15 3.24 5.2 4.54.73.31 1.29.5 1.73.64.73.23 1.39.2 1.91.12.58-.09 1.84-.74 2.1-1.46.26-.71.26-1.32.18-1.46-.08-.13-.28-.2-.59-.35Z" />
        </svg>
    );
}

export function FloatingWhatsApp() {
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [showLabel, setShowLabel] = useState(false);

    useEffect(() => {
        const syncPopupState = () => {
            setIsPopupOpen(document.body.hasAttribute('data-popup-open'));
        };

        syncPopupState();

        const observer = new MutationObserver(syncPopupState);
        observer.observe(document.body, { attributes: true, attributeFilter: ['data-popup-open'] });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (isPopupOpen) {
            setShowLabel(false);
            return;
        }

        setShowLabel(true);
        const timer = window.setTimeout(() => setShowLabel(false), 2000);

        return () => window.clearTimeout(timer);
    }, [isPopupOpen]);

    if (isPopupOpen) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">
            {showLabel && (
                <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-3 py-2 text-neutral-800 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-md">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#03BF03]">Consultor</span>
                    <span className="text-sm font-medium">Fale pelo WhatsApp</span>
                </div>
            )}

            <Link
                id="floating-whatsapp-button"
                href="https://wa.me/5508003810404?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20os%20planos."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setHasInteracted(true)}
                className="pointer-events-auto group relative flex items-center justify-center w-16 h-16 bg-[#03BF03] rounded-full shadow-[0_4px_20px_rgba(3,191,3,0.4)] hover:shadow-[0_8px_30px_rgba(3,191,3,0.5)] transition-transform duration-200 hover:scale-105 active:scale-95"
                data-track-event="cta_click"
                data-track-prop-button-id="floating-whatsapp"
                aria-label="Conversar no WhatsApp"
            >
                {!hasInteracted && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm border-2 border-white z-10">
                        1
                    </div>
                )}

                <WhatsAppIcon className="h-8 w-8 text-white" />
            </Link>
        </div>
    );
}
