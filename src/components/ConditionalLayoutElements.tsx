
"use client";

import { usePathname } from 'next/navigation';
import { FloatingWhatsApp } from '@/components/landing/FloatingWhatsApp';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { VisitTracker } from './analytics/VisitTracker';
import { EventTracker } from './analytics/EventTracker';
import { ConversionTracker } from './analytics/ConversionTracker';

type DomainType = 'main_site' | 'sales_page';

export function ConditionalLayoutElements() {
    const pathname = usePathname();
    const [domainType, setDomainType] = useState<DomainType | null>(null);

    const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/colaborador') || pathname.startsWith('/colaboracao');

    useEffect(() => {
        // Run only on client
        if (typeof window === 'undefined') return;
        
        const getDomainType = async () => {
            const hostname = window.location.hostname;
            const supabase = createClient();
            const { data } = await supabase
                .from('domains')
                .select('type')
                .eq('hostname', hostname)
                .single();
            
            // Default to 'sales_page' if no specific rule is found
            setDomainType((data?.type as DomainType) || 'sales_page');
        };
        
        if (!isAdminPage) {
            getDomainType();
        }
    }, [pathname, isAdminPage]);

    if (isAdminPage || domainType === 'main_site') {
        // Do not render marketing/tracking components for admin or main site
        return null;
    }
    
    if (domainType === null) {
        // Still loading domain type, don't render anything yet
        return null;
    }

    // Render for sales pages
    return (
        <>
            <FloatingWhatsApp />
            <ConsentBanner />
            <VisitTracker />
            <EventTracker />
            <ConversionTracker />
        </>
    );
}
