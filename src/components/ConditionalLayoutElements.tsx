
"use client";

import { usePathname } from 'next/navigation';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { VisitTracker } from './analytics/VisitTracker';
import { EventTracker } from './analytics/EventTracker';
import { ConversionTracker } from './analytics/ConversionTracker';
import Script from 'next/script';
import { ScrollDepthTracker } from './analytics/ScrollDepthTracker';
import { FloatingWhatsApp } from '@/components/landing/FloatingWhatsApp';
import { PopupManager } from './landing/PopupManager';


type TrackingTag = {
  id: string | number;
  script_content: string;
  placement: 'head_start' | 'body_start' | 'body_end';
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


export function ConditionalLayoutElements() {
    const pathname = usePathname();
    const [tags, setTags] = useState<TrackingTag[]>([]);
    const [domainType, setDomainType] = useState<DomainType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/colaborador') || pathname.startsWith('/colaboracao');
        if (typeof window === 'undefined' || isAdminPage) {
            setLoading(false);
            return;
        }

        const getDomainInfo = async () => {
            const hostname = window.location.hostname;
            const supabase = createClient();
            
            const { data: domainData } = await supabase
                .from('domains')
                .select('type')
                .eq('hostname', hostname)
                .single();
            
            const currentDomainType = (domainData?.type as DomainType) || 'sales_page'; // Default para sales_page se não encontrado
            setDomainType(currentDomainType);

            if (currentDomainType === 'sales_page') {
                const { data: tagsData } = await supabase
                    .from('tracking_tags')
                    .select('id, script_content, placement')
                    .eq('is_active', true);
                setTags((tagsData as TrackingTag[]) ?? []);
            }
            setLoading(false);
        };
        
        getDomainInfo();
    }, [pathname]);
    
    if (loading) {
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
            <PopupManager domainType={domainType} />

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
