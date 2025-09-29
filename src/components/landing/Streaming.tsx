
"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const streamingServices = [
  {
    bgImage: "https://s3.glbimg.com/v1/AUTH_c7def7ff66fe4b13beac0810ffbf780f/secure/now-at-globo-share-d5539fc.jpg",
    logo: "https://velpro.net.br/wp-content/uploads/2025/06/48D087-1.png",
    logoAlt: "Globoplay",
    title: "Velpro + Globoplay, isso é entretenimento",
    description: "A diversão no entretenimento, a informação do jornalismo e muita emoção nos esportes.",
  },
  {
    bgImage: "https://i0.wp.com/cloud.estacaonerd.com/wp-content/uploads/2019/10/06213603/telecine.jpg?fit=1920%2C1080&ssl=1",
    logo: "https://velpro.net.br/wp-content/uploads/2025/06/48D087-2.png",
    logoAlt: "Telecine",
    title: "Tenha os maiores sucessos do cinema com a Velpro + Telecine",
    description: "Assista aos maiores lançamentos de Hollywood e clássicos do cinema com qualidade e exclusividade.",
  },
  {
    bgImage: "https://www.claro.com.br/files/104379/1920x600/6eeab4eba7/img-banner-custom-brasileirao-2025-premiere-desk.jpg?sq=75",
    logo: "https://velpro.net.br/wp-content/uploads/2025/06/48D087.jpg",
    logoAlt: "Premiere",
    title: "Futebol ao vivo é com a Velpro + Premiere",
    description: "Acompanhe seu time do coração em todos os jogos do Brasileirão com emoção e transmissão ao vivo.",
  },
];

export function Streaming() {
    const [selectedService, setSelectedService] = useState(streamingServices[0]);

  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden border-t border-border bg-background flex items-end">
       {/* Background Image */}
       <AnimatePresence>
            <motion.div
                key={selectedService.bgImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 streaming-background"
                style={{ backgroundImage: `url('${selectedService.bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
        </AnimatePresence>

      <div className="relative z-10 w-full p-4 sm:p-8 lg:p-12 text-foreground">
        <div className="mx-auto max-w-7xl">
            {/* Content Display */}
            <motion.div 
                 key={selectedService.title}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                 className="max-w-2xl"
            >
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-md">
                    {selectedService.title}
                </h2>
                <p className="mt-4 text-lg text-white/80 drop-shadow-sm">
                    {selectedService.description}
                </p>
            </motion.div>
            
            {/* Logo Grid */}
            <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-6 max-w-md">
                {streamingServices.map((service) => (
                    <motion.div
                        key={service.logoAlt}
                        onMouseEnter={() => setSelectedService(service)}
                        className={`relative aspect-video cursor-pointer rounded-lg border-2 transition-all duration-300 ease-out ${
                            selectedService.logoAlt === service.logoAlt
                            ? 'border-primary/80 scale-105 shadow-2xl shadow-primary/20'
                            : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                         whileHover={{ scale: 1.05 }}
                    >
                         <Image
                            src={service.logo}
                            alt={service.logoAlt}
                            fill
                            className="object-contain p-2 sm:p-4 bg-black/30 backdrop-blur-sm rounded-lg"
                         />
                    </motion.div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}
