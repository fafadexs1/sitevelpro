
"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { Radio, CircuitBoard, Wifi, Building, Target, Users, MessageCircle, Map as MapIcon } from "lucide-react";

const timelineData = [
    {
        year: "2004",
        title: "O Início de Tudo",
        description: "Começamos com um link dedicado de 64 kbps, sendo pioneiros na cidade e crescendo rápido para entregar mais qualidade.",
        icon: Radio,
    },
    {
        year: "Pouco Depois",
        title: "Expansão Wireless",
        description: "Implantamos rede wireless em alta frequência (5 GHz+), levando internet de qualidade para regiões rurais e afastadas.",
        icon: Wifi,
    },
    {
        year: "Em Seguida",
        title: "Serviços Corporativos",
        description: "Passamos a interligar matriz e filiais, entregando acesso em alta velocidade e soluções sob medida para empresas de diferentes portes e segmentos.",
        icon: Building,
    },
    {
        year: "2004-2011",
        title: "Crescimento Regional",
        description: "Seguimos investindo em infraestrutura e expandimos nossa atuação para cidades vizinhas e estados circunvizinhos.",
        icon: MapIcon,
    },
    {
        year: "Hoje",
        title: "A Era da Fibra Óptica",
        description: "Nossa rede é majoritariamente fibra (FTTH) com planos de até 1 GIGA, redundância e experiência Wi-Fi 6.",
        icon: CircuitBoard,
    },
    {
        year: "Nosso Foco",
        title: "Para Quem Entregamos",
        description: "Atendemos clientes residenciais, empresariais e rurais com a mesma dedicação e qualidade de conexão.",
        icon: Users,
    },
    {
        year: "Nossos Valores",
        title: "O Que Nos Guia",
        description: "Inovação constante, proximidade real com o cliente, transparência e um investimento incansável em qualidade.",
        icon: Target,
    },
    {
        year: "Nossa Mensagem",
        title: "De 64kbps a 1 GIGA",
        description: "Seguimos com o mesmo propósito: levar um sinal de alta qualidade com atendimento próximo e tecnologia de ponta.",
        icon: MessageCircle,
    },
];

const TimelineItem = ({ item, isLast }: { item: typeof timelineData[0], isLast: boolean }) => {
    return (
        <div className="relative flex items-start gap-6 md:gap-8">
            <div className="flex flex-col items-center">
                 <motion.div 
                    className="grid h-14 w-14 place-items-center rounded-full border-2 border-primary bg-primary/10 text-primary"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <item.icon className="h-6 w-6" />
                </motion.div>
                {!isLast && <div className="h-full w-0.5 bg-border my-2" />}
            </div>
            <motion.div 
                className="flex-1 pb-16 pt-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <p className="text-sm font-semibold text-primary">{item.year}</p>
                <h3 className="mt-1 text-2xl font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
            </motion.div>
        </div>
    );
}

export function Timeline() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start center", "end end"],
    });

    // Animação suave para a barra de progresso
    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

  return (
    <section ref={ref} className="py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
             <div className="absolute left-7 top-0 h-full w-0.5 bg-border" aria-hidden="true" />
             <motion.div 
                className="absolute left-7 top-0 h-full w-0.5 bg-primary origin-top" 
                style={{ scaleY }}
                aria-hidden="true" 
            />

            {timelineData.map((item, index) => (
                <TimelineItem key={index} item={item} isLast={index === timelineData.length - 1} />
            ))}
        </div>
      </div>
    </section>
  );
}
