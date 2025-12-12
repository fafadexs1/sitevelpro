"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MonitorPlay } from "lucide-react";

export function Streaming() {
    const services = [
        {
            name: "Globoplay",
            description: "Novelas, jornalismo e o melhor do conteúdo brasileiro.",
            bgImage: "https://s3.glbimg.com/v1/AUTH_c7def7ff66fe4b13beac0810ffbf780f/secure/now-at-globo-share-d5539fc.jpg",
            colorConfig: "bg-gradient-to-t from-gray-900 via-transparent to-transparent",
            logo: "https://bqxdyinyzfxqghyuzsbs.supabase.co/storage/v1/object/public/site-assets/Streamings/Globoplay.webp"
        },
        {
            name: "Premiere",
            description: "Acompanhe seu time do coração em todos os jogos.",
            bgImage: "https://www.claro.com.br/files/104379/1920x600/6eeab4eba7/img-banner-custom-brasileirao-2025-premiere-desk.jpg?sq=75",
            colorConfig: "bg-gradient-to-t from-green-900 via-transparent to-transparent",
            logo: "https://bqxdyinyzfxqghyuzsbs.supabase.co/storage/v1/object/public/site-assets/Streamings/Premiere.webp"
        },
        {
            name: "Telecine",
            description: "Os maiores sucessos de Hollywood e do cinema mundial.",
            bgImage: "https://i0.wp.com/cloud.estacaonerd.com/wp-content/uploads/2019/10/06213603/telecine.jpg?fit=1920%2C1080&ssl=1",
            colorConfig: "bg-gradient-to-t from-red-900 via-transparent to-transparent",
            logo: "https://bqxdyinyzfxqghyuzsbs.supabase.co/storage/v1/object/public/site-assets/Streamings/Telecine.webp"
        },
        {
            name: "App de Canais",
            description: "Diversos canais de TV aberta e fechada para assistir onde quiser.",
            bgImage: "https://images.unsplash.com/photo-1593784997486-da2d96214f42?q=80&w=1000",
            colorConfig: "bg-gradient-to-t from-purple-900 via-transparent to-transparent",
            logo: null,
            icon: MonitorPlay
        }
    ];

    return (
        <section className="relative py-24 bg-neutral-950 overflow-hidden border-t border-white/5">
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 to-neutral-950" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                        Entretenimento <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Premium</span>
                    </h2>
                    <p className="text-neutral-400 text-lg">
                        Turbine seu plano com os melhores apps de filmes, séries e esportes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ margin: "-10% 0px -10% 0px", amount: 0.2 }}
                            transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                            className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-white/30 transition-all"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                                <img
                                    src={service.bgImage}
                                    alt={service.name}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                />
                            </div>

                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 ${service.colorConfig} opacity-90 group-hover:opacity-80 transition-opacity mix-blend-multiply`} />

                            {/* Hover Reveal Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                                {service.logo ? (
                                    <div className="relative w-32 h-16 mb-2 transition-transform duration-300 group-hover:-translate-y-2">
                                        <Image
                                            src={service.logo}
                                            alt={service.name}
                                            fill
                                            className="object-contain drop-shadow-md"
                                        />
                                    </div>
                                ) : service.icon ? (
                                    <div className="mb-2 transition-transform duration-300 group-hover:-translate-y-2">
                                        <service.icon className="w-12 h-12 text-white drop-shadow-lg" />
                                        <h3 className="text-2xl font-black text-white tracking-tight mt-2">{service.name}</h3>
                                    </div>
                                ) : (
                                    <h3 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-lg transition-transform duration-300 group-hover:-translate-y-2">
                                        {service.name}
                                    </h3>
                                )}

                                <p className="text-white/90 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 max-w-[90%] mx-auto leading-relaxed">
                                    {service.description}
                                </p>

                                <div className="mt-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                    Adicional Opcional
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
