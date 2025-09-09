
"use client";

import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AdvantageIcon = ({ icon }: { icon: 'shield' | 'gauge' | 'zap' | 'rocket' | 'wifi' | 'phone' }) => {
    const icons = {
        shield: (
            <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_1_1)">
                    <path d="M64 4L16 24V64C16 93.38 36.38 120.33 64 124C91.62 120.33 112 93.38 112 64V24L64 4Z" fill="url(#paint0_linear_1_1)" />
                    <path d="M64 4L16 24V64C16 93.38 36.38 120.33 64 124C91.62 120.33 112 93.38 112 64V24L64 4Z" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
                    <path d="M48 62L60 74L84 50" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <defs>
                    <filter id="filter0_d_1_1" x="0" y="0" width="128" height="136" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <feOffset dy="8" />
                        <feGaussianBlur stdDeviation="8" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0.0117647 0 0 0 0 0.74902 0 0 0 0 0.0117647 0 0 0 0.2 0" />
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_1" />
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_1" result="shape" />
                    </filter>
                    <linearGradient id="paint0_linear_1_1" x1="64" y1="4" x2="64" y2="124" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#34D399" />
                        <stop offset="1" stopColor="#03BF03" />
                    </linearGradient>
                </defs>
            </svg>
        ),
        gauge: (
            <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter_gauge)">
                    <path d="M102 78C108.3 68.9 108.43 57.53 102.51 48.24C96.59 38.95 85.5 34 74 34C51.5 34 34 51.5 34 74C34 85.5 38.95 96.59 48.24 102.51C57.53 108.43 68.9 108.3 78 102" stroke="url(#paint_gauge_stroke)" strokeWidth="16" strokeLinecap="round" />
                    <circle cx="64" cy="64" r="12" fill="url(#paint_gauge_center)" />
                    <line x1="64" y1="64" x2="90" y2="40" stroke="white" strokeWidth="6" strokeLinecap="round" />
                </g>
                <defs>
                    <filter id="filter_gauge" x="0" y="0" width="128" height="128" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <feOffset dy="4" />
                        <feGaussianBlur stdDeviation="8" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0.0117647 0 0 0 0 0.74902 0 0 0 0 0.0117647 0 0 0 0.2 0" />
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_1" />
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_1" result="shape" />
                    </filter>
                    <linearGradient id="paint_gauge_stroke" x1="50" y1="30" x2="90" y2="100" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#34D399" /><stop offset="1" stopColor="#03BF03" />
                    </linearGradient>
                    <linearGradient id="paint_gauge_center" x1="64" y1="52" x2="64" y2="76" gradientUnits="userSpaceOnUse">
                         <stop stopColor="#34D399" /><stop offset="1" stopColor="#03BF03" />
                    </linearGradient>
                </defs>
            </svg>
        ),
        zap: (
            <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter_zap)">
                    <path d="M44 4L84 56H56L72 108L32 52H60L44 4Z" fill="url(#paint_zap_fill)" />
                    <path d="M44 4L84 56H56L72 108L32 52H60L44 4Z" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
                </g>
                <defs>
                    <filter id="filter_zap" x="-10" y="-10" width="148" height="148" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="4"/>
                        <feGaussianBlur stdDeviation="8"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0.0117647 0 0 0 0 0.74902 0 0 0 0 0.0117647 0 0 0 0.2 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_1"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_1" result="shape"/>
                    </filter>
                    <linearGradient id="paint_zap_fill" x1="58" y1="4" x2="58" y2="108" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#34D399"/><stop offset="1" stopColor="#03BF03"/>
                    </linearGradient>
                </defs>
            </svg>
        ),
        rocket: (
            <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter_rocket)" transform="rotate(-45 64 64)">
                    <path d="M94 44C94 55.0457 85.0457 64 74 64H54C42.9543 64 34 55.0457 34 44V24C34 12.9543 42.9543 4 54 4H74C85.0457 4 94 12.9543 94 24V44Z" fill="url(#paint_rocket_body)"/>
                    <path d="M64 64V94L80 110V70" fill="url(#paint_rocket_wing_right)"/>
                    <path d="M64 64V94L48 110V70" fill="url(#paint_rocket_wing_left)"/>
                    <circle cx="64" cy="34" r="14" fill="white" fillOpacity="0.8"/>
                    <circle cx="64" cy="34" r="8" fill="url(#paint_rocket_window)"/>
                    <path d="M54 94H74L64 124L54 94Z" fill="url(#paint_rocket_flame)"/>
                </g>
                <defs>
                     <filter id="filter_rocket" x="-10" y="-10" width="148" height="148" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="4" dx="4"/>
                        <feGaussianBlur stdDeviation="8"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0.0117647 0 0 0 0 0.74902 0 0 0 0 0.0117647 0 0 0 0.2 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_1"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_1" result="shape"/>
                    </filter>
                    <linearGradient id="paint_rocket_body" x1="64" y1="4" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop stopColor="#34D399"/><stop offset="1" stopColor="#03BF03"/></linearGradient>
                    <linearGradient id="paint_rocket_wing_right" x1="72" y1="64" x2="72" y2="110" gradientUnits="userSpaceOnUse"><stop stopColor="#2DD4BF"/><stop offset="1" stopColor="#34D399"/></linearGradient>
                    <linearGradient id="paint_rocket_wing_left" x1="56" y1="64" x2="56" y2="110" gradientUnits="userSpaceOnUse"><stop stopColor="#2DD4BF"/><stop offset="1" stopColor="#34D399"/></linearGradient>
                     <linearGradient id="paint_rocket_window" x1="64" y1="26" x2="64" y2="42" gradientUnits="userSpaceOnUse"><stop stopColor="#2DD4BF"/><stop offset="1" stopColor="#03BF03"/></linearGradient>
                    <linearGradient id="paint_rocket_flame" x1="64" y1="94" x2="64" y2="124" gradientUnits="userSpaceOnUse"><stop stopColor="#FBBF24"/><stop offset="1" stopColor="#F59E0B"/></linearGradient>
                </defs>
            </svg>
        ),
        wifi: (
             <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter_wifi)">
                    <circle cx="64" cy="80" r="8" fill="url(#paint_wifi_dot)"/>
                    <path d="M24 56C42.12 37.88 77.88 37.88 96 56" stroke="url(#paint_wifi_lg)" strokeWidth="12" strokeLinecap="round"/>
                    <path d="M44 72C53.94 62.06 74.06 62.06 84 72" stroke="url(#paint_wifi_sm)" strokeWidth="12" strokeLinecap="round"/>
                </g>
                 <defs>
                     <filter id="filter_wifi" x="-10" y="-10" width="148" height="148" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="4"/>
                        <feGaussianBlur stdDeviation="8"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0.0117647 0 0 0 0 0.74902 0 0 0 0 0.0117647 0 0 0 0.2 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_1"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_1" result="shape"/>
                    </filter>
                    <linearGradient id="paint_wifi_dot" x1="64" y1="72" x2="64" y2="88" gradientUnits="userSpaceOnUse"><stop stopColor="#34D399"/><stop offset="1" stopColor="#03BF03"/></linearGradient>
                    <linearGradient id="paint_wifi_lg" x1="60" y1="40" x2="60" y2="70" gradientUnits="userSpaceOnUse"><stop stopColor="#34D399"/><stop offset="1" stopColor="#03BF03"/></linearGradient>
                    <linearGradient id="paint_wifi_sm" x1="64" y1="62" x2="64" y2="82" gradientUnits="userSpaceOnUse"><stop stopColor="#34D399"/><stop offset="1" stopColor="#03BF03"/></linearGradient>
                </defs>
            </svg>
        ),
        phone: (
            <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter_phone)">
                    <path d="M102.78 89.29L90.87 77.38C87.49 74 82.51 74.45 79.71 77.25L72.22 84.74C56.33 76.71 43.29 63.67 35.26 47.78L42.75 40.29C45.55 37.49 46 32.51 42.62 29.13L30.71 17.22C27.33 13.84 21.84 14.19 18.89 17.14L10.29 25.74C6.54 29.49 7.72 35.49 11.23 40.35C24.47 58.46 41.54 75.53 59.65 88.77C64.51 92.28 70.51 93.46 74.26 89.71L82.86 81.11C85.81 78.16 90.16 77.67 93.12 79.54L101.46 84.88C104.99 87.05 107.51 84.34 105.82 81.12L102.78 89.29Z" transform="translate(10, 10) scale(0.9)" fill="url(#paint_phone_fill)"/>
                </g>
                <defs>
                     <filter id="filter_phone" x="-10" y="-10" width="148" height="148" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="4"/>
                        <feGaussianBlur stdDeviation="8"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0.0117647 0 0 0 0 0.74902 0 0 0 0 0.0117647 0 0 0 0.2 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_1"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_1" result="shape"/>
                    </filter>
                    <linearGradient id="paint_phone_fill" x1="58" y1="17" x2="58" y2="90" gradientUnits="userSpaceOnUse">
                         <stop stopColor="#34D399"/><stop offset="1" stopColor="#03BF03"/>
                    </linearGradient>
                </defs>
            </svg>
        ),
    };
    return (
      <div className="absolute -top-10 -right-10 w-40 h-40 opacity-90 transition-transform group-hover:scale-110 group-hover:-translate-x-2 group-hover:-translate-y-2">
        {icons[icon]}
      </div>
    );
};


const AdvantageCard = ({ item }: { item: { icon: 'shield' | 'gauge' | 'zap' | 'rocket' | 'wifi' | 'phone'; title: string; desc: string; }}) => (
    <div className="group relative rounded-2xl border border-border bg-card p-6 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10">
        <AdvantageIcon icon={item.icon} />
        <div className="relative z-10">
            <h3 className="text-xl font-bold text-card-foreground">{item.title}</h3>
            <p className="mt-2 text-muted-foreground pr-12">{item.desc}</p>
        </div>
    </div>
);


export function Advantages() {
  const isMobile = useIsMobile();
  const advantages = [
    { icon: 'shield' as const, title: "Estabilidade", desc: "Rede de fibra com backbone redundante e QoS." },
    { icon: 'gauge' as const, title: "Baixa latência", desc: "Jogos e chamadas sem travar, com pings baixíssimos." },
    { icon: 'zap' as const, title: "Wi‑Fi 6", desc: "Mais alcance, mais dispositivos e menos interferência." },
    { icon: 'rocket' as const, title: "Instalação express", desc: "Agendamento rápido e instalação sem complicação." },
    { icon: 'wifi' as const, title: "Cobertura inteligente", desc: "Mesh opcional para casas e empresas maiores." },
    { icon: 'phone' as const, title: "Suporte qualificado", desc: "Atendimento humano e eficiente quando você precisa." },
  ];

  if (isMobile === undefined) {
    return <div className="h-[200px]" />; // Placeholder or loader
  }

  return (
    <section id="vantagens" className="border-t border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl lg:mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Por que você vai amar a Velpro?</h2>
          <p className="mt-2 text-muted-foreground">Tecnologia de ponta, atendimento humano e performance real no seu dia a dia.</p>
        </div>
        
        {isMobile ? (
          <Carousel opts={{ loop: true }} className="w-full">
            <CarouselContent>
              {advantages.map((item, index) => (
                <CarouselItem key={index}>
                  <div className="p-1 pt-12 pr-8">
                    <AdvantageCard item={item} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-background/50 border-border hover:bg-accent" />
            <CarouselNext className="right-2 bg-background/50 border-border hover:bg-accent" />
          </Carousel>
        ) : (
          <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((item, index) => (
               <AdvantageCard key={index} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
