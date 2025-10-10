
"use client";

import { usePathname } from 'next/navigation';
import { FloatingWhatsApp } from '@/components/landing/FloatingWhatsApp';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { VisitTracker } from './analytics/VisitTracker';
import { EventTracker } from './analytics/EventTracker';
import { ConversionTracker } from './analytics/ConversionTracker';
import Script from 'next/script';
import { ScrollDepthTracker } from './analytics/ScrollDepthTracker';

type TrackingTag = {
  id: string | number;
  script_content: string;
  placement: 'head_start' | 'body_start' | 'body_end';
};

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
  const strategy = position === 'body_end' ? 'afterInteractive' : 'beforeInteractive';
  
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
    const [shouldTrack, setShouldTrack] = useState(false);

    const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/colaborador') || pathname.startsWith('/colaboracao');

    useEffect(() => {
        if (typeof window === 'undefined' || isAdminPage) {
            setShouldTrack(false);
            return;
        };
        
        setShouldTrack(true);

        const getTags = async () => {
            const supabase = createClient();
            const { data: tagsData } = await supabase
                .from('tracking_tags')
                .select('id, script_content, placement')
                .eq('is_active', true);
            setTags((tagsData as TrackingTag[]) ?? []);
        };
        
        getTags();
    }, [pathname, isAdminPage]);

    if (!shouldTrack) {
        return null;
    }

    const headScripts = tags.filter(t => t.placement === 'head_start');
    const bodyStartNoScripts = tags.filter(t => t.placement === 'body_start');
    const bodyEndScripts = tags.filter(t => t.placement === 'body_end');

    return (
        <>
            {/* Rastreamento interno (cliques, visitas) para todos os domínios públicos */}
            <VisitTracker />
            <EventTracker />
            <ScrollDepthTracker />

            {/* Componentes e tags de marketing */}
            <TrackingScripts tags={headScripts} position="head_start" />
            <TrackingNoScript tags={bodyStartNoScripts} />
            <TrackingScripts tags={bodyEndScripts} position="body_end" />

            <FloatingWhatsApp />
            <ConsentBanner />
            <ConversionTracker />
        </>
    );
}
