
"use client";

import { usePathname } from 'next/navigation';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';
import { VisitTracker } from './analytics/VisitTracker';
import { EventTracker } from './analytics/EventTracker';
import { ConversionTracker } from './analytics/ConversionTracker';
import Script from 'next/script';
import { ScrollDepthTracker } from './analytics/ScrollDepthTracker';
import { FloatingWhatsApp } from '@/components/landing/FloatingWhatsApp';
import { PopupManager, Popup } from './landing/PopupManager';
import { ConversionEvent } from '@/types/admin';

// Re-defining or importing types. schema tracking_tags
type TrackingTag = {
    id: string;
    script_content: string;
    placement: string | null;
};

type DomainType = 'main_site' | 'sales_page';

// Helper para sanitizar o conteúdo de scripts para o next/script
const sanitizeScriptContent = (content: string): string => {
    // Remove <script> e </script> tags, mas mantém o conteúdo
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    return scriptMatch ? scriptMatch[1] : '';
};

// Helper para renderizar noscript tags de forma segura
const TrackingNoScript = ({ tags }: { tags: TrackingTag[] }) => {
    return (
        <>
            {tags.map((tag, index) => {
                const noScriptMatch = tag.script_content.match(/<noscript>([\s\S]*?)<\/noscript>/);
                if (!noScriptMatch) return null;
                return (
                    <noscript
                        key={`noscript-${tag.id}-${index}`}
                        dangerouslySetInnerHTML={{ __html: noScriptMatch[1] }}
                    />
                )
            })}
        </>
    );
};

// Helper para renderizar scripts com next/script
function TrackingScripts({
    tags,
    position,
}: {
    tags: TrackingTag[];
    position: 'head_start' | 'body_end';
}) {
    const strategy = position === 'head_start' ? 'afterInteractive' : 'afterInteractive';

    return (
        <>
            {tags
                .filter(t => t.placement === position)
                .map((tag, index) => (
                    <Script
                        id={`tracking-tag-${position}-${tag.id}-${index}`}
                        key={`script-${position}-${tag.id}-${index}`}
                        strategy={strategy}
                        dangerouslySetInnerHTML={{ __html: sanitizeScriptContent(tag.script_content) }}
                    />
                ))}
        </>
    );
}

interface ConditionalLayoutElementsProps {
    domainType: DomainType;
    tags?: TrackingTag[];
    popups?: Popup[];
    conversionEvents?: ConversionEvent[];
}

export function ConditionalLayoutElements({ domainType, tags = [], popups = [], conversionEvents = [] }: ConditionalLayoutElementsProps) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/colaborador') || pathname.startsWith('/colaboracao');

    if (isAdminPage) {
        return null;
    }

    const headScripts = tags.filter(t => t.placement === 'head_start');
    const bodyStartNoScripts = tags.filter(t => t.placement === 'body_start');
    const bodyEndScripts = tags.filter(t => t.placement === 'body_end');

    return (
        <>
            {/* Rastreamento interno (cliques, visitas) */}
            <VisitTracker />
            <EventTracker />
            <ScrollDepthTracker />

            {/* Gerenciador de Pop-ups */}
            <PopupManager domainType={domainType} popups={popups} conversionEvents={conversionEvents} />

            {/* Componentes e tags de marketing para páginas de vendas */}
            {domainType === 'sales_page' && (
                <>
                    <TrackingScripts tags={headScripts} position="head_start" />
                    <TrackingNoScript tags={bodyStartNoScripts} />
                    <TrackingScripts tags={bodyEndScripts} position="body_end" />

                    <FloatingWhatsApp />
                    <ConsentBanner />
                    <ConversionTracker />
                </>
            )}
        </>
    );
}
