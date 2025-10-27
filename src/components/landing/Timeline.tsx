
"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { Radio, CircuitBoard, Wifi, Building, Target, Users, MessageCircle, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
        description: "Passamos a interligar matriz e filiais, entregando acesso em alta velocidade e soluções sob medida para empresas.",
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


const TimelineItem = ({ item, index }: { item: typeof timelineData[0]; index: number }) => {
  const isLeft = index % 2 === 0;

  const contentVariants = {
    hidden: { opacity: 0, x: isLeft ? -50 : 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.2 },
    },
  };

  return (
    <div className="grid md:grid-cols-[1fr_auto_1fr] items-start gap-x-8">
      {/* Conteúdo (lado esquerdo em desktop) */}
      <motion.div
        variants={contentVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        className={cn(
          "md:text-right",
          isLeft ? "md:col-start-1 md:row-start-1" : "md:col-start-3 md:row-start-1"
        )}
      >
        <p className="text-sm font-semibold text-primary">{item.year}</p>
        <h3 className="mt-1 text-2xl font-bold text-foreground">{item.title}</h3>
        <p className="mt-2 text-muted-foreground">{item.description}</p>
      </motion.div>

      {/* Ícone e Linha */}
      <div className="relative flex flex-col items-center justify-start h-full md:col-start-2 md:row-start-1">
        <motion.div
          variants={iconVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          className="z-10 grid h-14 w-14 place-items-center rounded-full border-2 border-primary bg-background text-primary"
        >
          <item.icon className="h-6 w-6" />
        </motion.div>
      </div>
      
       {/* Espaço Vazio para alinhar a grid */}
       <div className={cn("hidden md:block", isLeft ? "md:col-start-3" : "md:col-start-1")}></div>
    </div>
  );
};


export function Timeline() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start center", "end center"],
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <section ref={ref} className="py-16 sm:py-24 bg-background">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="relative space-y-12 md:space-y-0">
                    <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-border md:block" />
                    <motion.div
                        className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-primary origin-top"
                        style={{ scaleY }}
                    />

                    {timelineData.map((item, index) => (
                        <TimelineItem key={index} item={item} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
