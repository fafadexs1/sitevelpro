
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

const messages = ["Assine agora", "Saiba Mais", "Venha conhecer"];

export function FloatingWhatsApp() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 3000); // Change message every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <Link 
            href="https://wa.me/5508003810404?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20planos."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3 group cursor-pointer"
            data-track-event="cta_click"
            data-track-prop-button-id="floating-whatsapp"
        >
            <div className="relative bg-background/80 backdrop-blur-sm p-3 rounded-2xl border border-border shadow-lg flex items-center gap-2 overflow-hidden h-12">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="text-sm font-medium text-foreground whitespace-nowrap"
                    >
                        {messages[index]}
                    </motion.div>
                </AnimatePresence>
            </div>
             <div className="relative w-16 h-16 grid place-items-center bg-green-500 rounded-full shadow-xl transition-transform group-hover:scale-110">
                <MessageCircle className="w-8 h-8 text-white" />
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"/>
             </div>
        </Link>
    );
}
