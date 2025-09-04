"use client";

import { motion } from "framer-motion";
import { Wifi, Router, Smartphone, Laptop, Tablet, Home, ChevronRight, Share2 } from "lucide-react";

export function Mesh() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const benefits = [
    { icon: <Home className="h-5 w-5 text-primary"/>, title: "Cobertura Total", desc: "Sinal forte e estável em todos os cômodos, sem pontos cegos." },
    { icon: <Share2 className="h-5 w-5 text-primary"/>, title: "Roaming Inteligente", desc: "Seu dispositivo conecta-se ao melhor sinal automaticamente, sem interrupções." },
    { icon: <Smartphone className="h-5 w-5 text-primary"/>, title: "Fácil de Gerenciar", desc: "Controle toda a sua rede de forma simples através de um aplicativo." },
  ]

  return (
    <section id="mesh" className="border-t border-white/5 bg-neutral-950/40 py-16 sm:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight sm:text-4xl">
              Wi-Fi que cobre sua casa inteira com a Rede Mesh
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-white/70">
              A tecnologia MESH cria uma rede unificada e inteligente. Vários pontos de Wi-Fi trabalham juntos para garantir uma conexão perfeita e de alta velocidade em cada canto da sua casa ou escritório.
            </motion.p>
            <div className="mt-8 space-y-6">
              {benefits.map(benefit => (
                <motion.div key={benefit.title} variants={itemVariants} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 grid h-10 w-10 place-items-center rounded-lg bg-primary/15">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="text-white/70">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
             <motion.a 
                href="#planos"
                variants={itemVariants}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                Ver planos com Mesh <ChevronRight className="h-4 w-4" />
              </motion.a>
          </motion.div>
          
          <div className="relative flex items-center justify-center min-h-[400px]">
            <motion.div 
              className="absolute w-full h-full"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ type: "spring", stiffness: 50, delay: 0.2 }}
            >
              {/* Central Router */}
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="grid place-items-center w-24 h-24 rounded-full bg-primary/20 border border-primary/50 shadow-lg shadow-primary/20">
                  <Router className="w-10 h-10 text-primary"/>
                </div>
              </motion.div>
              
              {/* Satellite nodes */}
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    rotate: i * (360 / 5),
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <motion.div 
                    className="grid place-items-center w-16 h-16 rounded-full bg-neutral-800 border border-white/10" 
                    style={{ transform: "translateY(-150px) rotate(0deg)"}}
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div style={{ transform: `rotate(-${i * (360/5)}deg)`}}>
                       {[<Smartphone/>, <Laptop/>, <Tablet/>, <Wifi/>, <Wifi/>][i]}
                    </div>
                  </motion.div>
                </motion.div>
              ))}

              {/* Connection lines */}
              <svg className="absolute w-full h-full opacity-20" viewBox="0 0 300 300" style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '300px'}}>
                  {[...Array(5)].map((_, i) => (
                      <motion.line 
                        key={i}
                        x1="150" y1="150" 
                        x2={150 + 75 * Math.cos(i * 2 * Math.PI / 5)} 
                        y2={150 + 75 * Math.sin(i * 2 * Math.PI / 5)} 
                        stroke="white" 
                        strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
                      />
                  ))}
                   {[...Array(5)].map((_, i) => (
                      <motion.line 
                        key={`outer-${i}`}
                        x1={150 + 75 * Math.cos(i * 2 * Math.PI / 5)} 
                        y1={150 + 75 * Math.sin(i * 2 * Math.PI / 5)}
                        x2={150 + 75 * Math.cos((i + 1) * 2 * Math.PI / 5)} 
                        y2={150 + 75 * Math.sin((i + 1) * 2 * Math.PI / 5)} 
                        stroke="white" 
                        strokeWidth="0.5"
                        strokeDasharray="4 2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 1.2, ease: "easeInOut" }}
                      />
                  ))}
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
