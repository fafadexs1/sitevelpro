
"use client";

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_ID_KEY = 'velpro_visitor_id';

export function EventTracker() {
    const pathname = usePathname();

    const trackEvent = useCallback(async (eventName: string, properties: Record<string, any>) => {
        const visitorId = localStorage.getItem(VISITOR_ID_KEY);
        if (!visitorId) return;

        // Não rastreia eventos em páginas de admin/colaborador
        if (pathname.startsWith('/admin') || pathname.startsWith('/colaborador') || pathname.startsWith('/colaboracao')) {
            return;
        }

        try {
            await fetch('/api/track-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitorId,
                    hostname: window.location.hostname,
                    pathname,
                    eventName,
                    properties,
                }),
            });
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }, [pathname]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const targetElement = e.target as Element;
            // Encontra o elemento rastreável mais próximo do clique
            const trackedElement = targetElement.closest('[data-track-event]');

            if (trackedElement) {
                const eventName = trackedElement.getAttribute('data-track-event');
                if (!eventName) return;

                const properties: Record<string, any> = {};
                // Coleta todas as propriedades data-track-prop-* do elemento
                for (const attr of trackedElement.attributes) {
                    if (attr.name.startsWith('data-track-prop-')) {
                        const propName = attr.name.substring(16).replace(/-/g, '_');
                        properties[propName] = attr.value;
                    }
                }
                
                trackEvent(eventName, properties);
            }
        };
        
        // Adiciona um único listener no documento
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [trackEvent]);

    return null; // This component does not render anything
}
