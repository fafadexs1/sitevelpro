"use client";

import { usePathname } from 'next/navigation';
import { FloatingWhatsApp } from '@/components/landing/FloatingWhatsApp';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';

export function ConditionalLayoutElements() {
    const pathname = usePathname();

    const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/colaborador') || pathname.startsWith('/colaboracao');

    if (isAdminPage) {
        return null;
    }

    return (
        <>
            <FloatingWhatsApp />
            <ConsentBanner />
        </>
    );
}
