
"use client";

import { useEffect, useState, useCallback } from 'react';
import { getConversionEvents } from "@/actions/get-conversion-events";
import { ConversionEvent } from '@/types/admin';

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

const getDeduplicationKey = (event: ConversionEvent) => {
    const eventKey = event.id || `${event.name}-${event.selector || "no-selector"}`;
    return `gads_conversion_${eventKey}`;
};

const hasTrackedInSession = (event: ConversionEvent) => {
    try {
        return window.sessionStorage.getItem(getDeduplicationKey(event)) === "true";
    } catch {
        return false;
    }
};

const markTrackedInSession = (event: ConversionEvent) => {
    try {
        window.sessionStorage.setItem(getDeduplicationKey(event), "true");
    } catch {
        // Ignore storage errors. Tracking should not break user interactions.
    }
};

export function ConversionTracker({ initialEvents = [] }: { initialEvents?: ConversionEvent[] }) {
    const [events, setEvents] = useState<ConversionEvent[]>(initialEvents);

    useEffect(() => {
        if (initialEvents.length > 0) {
            setEvents(initialEvents);
            return;
        }

        const fetchEvents = async () => {
            const data = await getConversionEvents();
            setEvents(data);
        };
        fetchEvents();
    }, [initialEvents]);

    const trackEvent = useCallback((event: ConversionEvent) => {
        if (hasTrackedInSession(event)) {
            console.debug(`Conversion event skipped due to session dedupe: ${event.name}`);
            return;
        }

        if (typeof window.gtag === 'function') {
            try {
                // This is a simplified way to execute the snippet.
                // It assumes gtag is on the window and the snippet is valid JS.
                // A more robust solution might parse the snippet, but this covers many cases.
                const snippetFunc = new Function('gtag', event.event_snippet);
                snippetFunc(window.gtag);
                markTrackedInSession(event);
                console.log(`Conversion event tracked: ${event.name}`);
            } catch (e) {
                console.error(`Error executing event snippet for "${event.name}":`, e);
            }
        } else {
            console.warn(`gtag not found. Could not track event: ${event.name}`);
        }
    }, []);

    useEffect(() => {
        if (events.length === 0) return;

        const handleClick = (e: MouseEvent) => {
            events.forEach(event => {
                if (event.selector && (e.target as Element).closest(event.selector)) {
                    trackEvent(event);
                }
            });
        };

        const handleFormSubmit = (e: Event) => {
            events.forEach(event => {
                if (event.selector && (e.target as Element).matches(event.selector)) {
                    trackEvent(event);
                }
            });
        }

        // We listen on the document to capture all relevant events.
        document.addEventListener('click', handleClick);
        document.addEventListener('submit', handleFormSubmit);

        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('submit', handleFormSubmit);
        };
    }, [events, trackEvent]);

    return null; // This component does not render anything
}
