"use client";

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function FloatingWhatsApp() {
    const [hasInteracted, setHasInteracted] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 backdrop-blur-md text-neutral-800 shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-white/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600">Consultor</span>
                <span className="text-sm font-medium">Fale pelo WhatsApp</span>
            </div>

            <Link
                id="floating-whatsapp-button"
                href="https://wa.me/5508003810404?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20os%20planos."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setHasInteracted(true)}
                className="pointer-events-auto group relative flex items-center justify-center w-16 h-16 bg-[#25D366] rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.5)] transition-transform duration-200 hover:scale-105 active:scale-95"
                data-track-event="cta_click"
                data-track-prop-button-id="floating-whatsapp"
                aria-label="Conversar no WhatsApp"
            >
                {!hasInteracted && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm border-2 border-white z-10">
                        1
                    </div>
                )}

                <MessageCircle className="w-7 h-7 text-white" />
            </Link>
        </div>
    );
}
