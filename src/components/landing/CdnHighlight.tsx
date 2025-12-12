"use client";

import { motion } from "framer-motion";
import { Server, Globe, Zap, Shield, Activity } from "lucide-react";

export function CdnHighlight() {
  const nodes = [
    { name: "Google GGC", icon: Globe, color: "text-blue-400", position: "top-10 left-10 md:top-20 md:left-32" },
    { name: "Netflix OCA", icon: Server, color: "text-red-500", position: "top-10 right-10 md:top-20 md:right-32" },
    { name: "Facebook FNA", icon: Activity, color: "text-blue-500", position: "bottom-10 left-10 md:bottom-20 md:left-32" },
    { name: "Akamai CDN", icon: Shield, color: "text-orange-400", position: "bottom-10 right-10 md:bottom-20 md:right-32" },
  ];

  return (
    <section className="py-24 bg-neutral-950 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Activity className="w-3 h-3" />
            Latência Zero
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            Conexão Global <span className="text-green-500">Ultra-Rápida</span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Conteúdo do Google, Netflix e Facebook hospedado dentro da nossa rede. <br className="hidden md:block" />
            Menos rotas, mais velocidade.
          </p>
        </div>

        <div className="relative h-[400px] md:h-[500px] w-full max-w-5xl mx-auto rounded-3xl border border-white/5 bg-neutral-900/50 backdrop-blur-sm overflow-hidden flex items-center justify-center">
          {/* Map Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* Connecting Lines (SVG Overlay) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
                <stop offset="50%" stopColor="#22c55e" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.line x1="50%" y1="50%" x2="20%" y2="20%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 0.3 }} transition={{ duration: 1.5 }} />
            <motion.line x1="50%" y1="50%" x2="80%" y2="20%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 0.3 }} transition={{ duration: 1.5, delay: 0.2 }} />
            <motion.line x1="50%" y1="50%" x2="20%" y2="80%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 0.3 }} transition={{ duration: 1.5, delay: 0.4 }} />
            <motion.line x1="50%" y1="50%" x2="80%" y2="80%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 0.3 }} transition={{ duration: 1.5, delay: 0.6 }} />
          </svg>

          {/* Central Hub (User) */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="relative z-20 flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-neutral-900 border-4 border-green-500 shadow-[0_0_60px_rgba(34,197,94,0.4)] flex items-center justify-center relative group cursor-pointer">
              <div className="absolute inset-0 rounded-full border border-white/20 animate-[ping_2s_ease-out_infinite]" />
              <Zap className="w-10 h-10 text-green-500 fill-current group-hover:scale-110 transition-transform" />
            </div>
          </motion.div>

          {/* Nodes */}
          {nodes.map((node, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, type: "spring", bounce: 0.4 }}
              className={`absolute ${node.position} z-10 flex flex-col items-center gap-3`}
            >
              <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 backdrop-blur border border-white/10 flex items-center justify-center shadow-lg hover:border-green-500/50 hover:shadow-green-500/10 transition-all cursor-pointer group">
                <node.icon className={`w-8 h-8 ${node.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
              </div>
              <div className="px-3 py-1 rounded-full bg-black/50 border border-white/5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest backdrop-blur-md">
                {node.name}
              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}
