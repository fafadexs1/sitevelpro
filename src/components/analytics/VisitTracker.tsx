
"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

const VISITOR_ID_KEY = 'velpro_visitor_id';

export function VisitTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Roda apenas no cliente
        if (typeof window === 'undefined') {
            return;
        }

        // Não rastreia as páginas do admin
        if (pathname.startsWith('/admin') || pathname.startsWith('/colaborador') || pathname.startsWith('/colaboracao')) {
            return;
        }

        let visitorId = localStorage.getItem(VISITOR_ID_KEY);
        let isNewVisitor = false;

        if (!visitorId) {
            visitorId = uuidv4();
            localStorage.setItem(VISITOR_ID_KEY, visitorId);
            isNewVisitor = true;
        }

        const trackVisit = async () => {
            try {
                await fetch('/api/track-visit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        visitorId: visitorId,
                        hostname: window.location.hostname,
                        pathname: pathname,
                        isNewVisitor: isNewVisitor,
                    }),
                });
            } catch (error) {
                console.error('Failed to track visit:', error);
            }
        };

        trackVisit();
    }, [pathname]);

    return null; // Este componente não renderiza nada
}
