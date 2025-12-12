
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

const messages = ["Assine agora", "Saiba Mais", "Venha conhecer"];

export function FloatingWhatsApp() {
    const [index, setIndex] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Initial delay before showing first time
        const initialTimeout = setTimeout(() => setIsVisible(true), 1000);

        // Message rotation logic
        const messageInterval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 4000);

        // Visibility toggle logic (15s cycle)
        // Show for 6s, Hide for 9s
        const visibilityInterval = setInterval(() => {
            setIsVisible(true);
            setTimeout(() => {
                setIsVisible(false);
            }, 6000); // Stay visible for 6 seconds
        }, 15000); // Repeat every 15 seconds

        // Handle the first cycle manually to start properly after initial timeout
        const firstCycleHide = setTimeout(() => setIsVisible(false), 7000); // 1s initial delay + 6s visible

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(messageInterval);
            clearInterval(visibilityInterval);
            clearTimeout(firstCycleHide);
        };
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">
            {/* Message Bubble - Conditionally Rendered */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="pointer-events-auto bg-white/90 backdrop-blur-md text-neutral-800 px-4 py-3 rounded-2xl rounded-tr-sm shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-white/50 mb-2 max-w-[200px] relative origin-bottom-right"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600">Consultor Online</span>
                        </div>
                        <div className="h-5 overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-sm font-medium leading-relaxed absolute top-0 left-0 w-full"
                                >
                                    {messages[index]}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Button */}
            <Link
                id="floating-whatsapp-button"
                href="https://wa.me/5508003810404?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20planos."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setHasInteracted(true)}
                className="pointer-events-auto group relative flex items-center justify-center w-16 h-16 bg-[#25D366] rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-110 active:scale-95"
                data-track-event="cta_click"
                data-track-prop-button-id="floating-whatsapp"
            >
                {/* Ripple Effect */}
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />

                {/* Notification Badge */}
                {!hasInteracted && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm border-2 border-white z-10 animate-bounce">
                        1
                    </div>
                )}

                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white relative z-10" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
            </Link>
        </div>
    );
}
