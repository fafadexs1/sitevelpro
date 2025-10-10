
"use client";

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_ID_KEY = 'velpro_visitor_id';

// Helper function para disparar o evento
const trackEvent = async (eventName: string, properties: Record<string, any>) => {
    const visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) return;

    try {
        await fetch('/api/track-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                visitorId,
                hostname: window.location.hostname,
                pathname: window.location.pathname,
                eventName,
                properties,
            }),
        });
    } catch (error) {
        console.error('Failed to track scroll event:', error);
    }
};

export function ScrollDepthTracker() {
    const pathname = usePathname();
    const trackedSections = useRef(new Set<string>());

    const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                // Apenas rastreia a seção uma vez por visita de página
                if (!trackedSections.current.has(sectionId)) {
                    trackedSections.current.add(sectionId);
                    trackEvent('scroll_depth_reach', { section_id: sectionId });
                }
            }
        });
    }, []);

    useEffect(() => {
        // Limpa as seções rastreadas a cada mudança de rota
        trackedSections.current.clear();

        const observer = new IntersectionObserver(observerCallback, {
            root: null,
            rootMargin: '0px',
            threshold: 0.5 // A seção deve estar 50% visível
        });

        // Encontra todas as seções com um ID e as observa
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => observer.observe(section));

        // Limpeza: para de observar as seções quando o componente é desmontado
        return () => {
            sections.forEach(section => observer.unobserve(section));
        };
    }, [pathname, observerCallback]); // Re-executa o efeito quando o caminho da URL muda

    return null; // Este componente não renderiza nada
}
