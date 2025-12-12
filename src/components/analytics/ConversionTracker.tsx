
"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ConversionEvent } from '@/types/admin';

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

export function ConversionTracker() {
    const [events, setEvents] = useState<ConversionEvent[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('conversion_events')
                .select('*')
                .eq('is_active', true);
            if (error) {
                console.error("Error fetching conversion events:", error);
                return;
            }
            setEvents(data);
        };
        fetchEvents();
    }, []);

    const trackEvent = useCallback((event: ConversionEvent) => {
        if (typeof window.gtag === 'function') {
            try {
                // This is a simplified way to execute the snippet.
                // It assumes gtag is on the window and the snippet is valid JS.
                // A more robust solution might parse the snippet, but this covers many cases.
                const snippetFunc = new Function('gtag', event.event_snippet);
                snippetFunc(window.gtag);
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
