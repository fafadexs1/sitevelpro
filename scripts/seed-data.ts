
import 'dotenv/config';
import { db } from '../src/db';
import { plans, testimonials, faqs, games } from '../src/db/schema';
import { sql } from 'drizzle-orm';

async function seed() {
    console.log('Seeding data...');

    // 1. Enterprise Plans (from PlanDetailsSheet.tsx)
    console.log('Inserting Enterprise Plans...');
    await db.insert(plans).values([
        {
            type: 'empresarial',
            speed: '500 MEGA',
            price: 299.90,
            original_price: 349.90,
            features: ["Wifi 6 Up", "Instalação grátis", "Suporte Prioritário"],
            highlight: false,
            whatsapp_number: '5508003810404',
            whatsapp_message: 'Olá! Tenho interesse no plano Empresarial de 500 MEGA.',
            sort_order: 1
        },
        {
            type: 'empresarial',
            speed: '700 MEGA',
            price: 399.90,
            original_price: 449.90,
            features: ["Wifi 6 Up", "Instalação grátis", "Suporte Premium", "IP Dinâmico"],
            highlight: true,
            whatsapp_number: '5508003810404',
            whatsapp_message: 'Olá! Tenho interesse no plano Empresarial de 700 MEGA.',
            sort_order: 2
        },
        {
            type: 'empresarial',
            speed: '900 MEGA',
            price: 599.90,
            original_price: 649.90,
            features: ["Wifi 6 Up", "Instalação grátis", "SLA Garantido", "Gestor de Conta"],
            highlight: false,
            whatsapp_number: '5508003810404',
            whatsapp_message: 'Olá! Tenho interesse no plano Empresarial de 900 MEGA.',
            sort_order: 3
        }
    ]).onConflictDoNothing(); // Prevent duplicates on re-run

    // 2. Testimonials (from Testimonials.tsx)
    console.log('Inserting Testimonials...');
    await db.insert(testimonials).values([
        {
            name: "Ana",
            role: "Criadora",
            text: "Upload rápido e live sem travar. Suporte me atendeu em minutos!",
            stars: 5,
        },
        {
            name: "Marcos",
            role: "Gamer",
            text: "Ping baixíssimo nos servers. Mudou meu competitivo.",
            stars: 5,
        },
        {
            name: "Luciana",
            role: "Home Office",
            text: "Chamadas perfeitas e redundância bem configurada.",
            stars: 5,
        }
    ]);

    // 3. FAQs (from Faq.tsx)
    console.log('Inserting FAQs...');
    await db.insert(faqs).values([
        {
            question: "Tem fidelidade?",
            answer: "Todos os planos tem fidelidade, verificar o tempo de fidelidade na contratação ou contrato.",
            sort_order: 1
        },
        {
            question: "Qual roteador vem incluso?",
            answer: "O modelo do roteador pode variar. Planos de alta performance geralmente incluem equipamentos com tecnologia Wi-Fi 6, mas o modelo exato dependerá do plano contratado e da viabilidade técnica.",
            sort_order: 2
        },
        {
            question: "Em quanto tempo é a instalação?",
            answer: "Na maioria das regiões, em até 48h após a confirmação de cobertura.",
            sort_order: 3
        },
        {
            question: "Oferecem IP fixo?",
            answer: "Sim, como adicional para planos empresariais e sob solicitação em residenciais.",
            sort_order: 4
        }
    ]);

    // 4. Games (from Games.tsx)
    // Needs images locally or generic URL. User said they will put images "again". 
    // I will assume they will be in public/images/games/... or similar.
    // For now I use the URLs from placeholder-images.json as a fallback or placeholder path.
    console.log('Inserting Games...');
    await db.insert(games).values([
        {
            name: "Valorant",
            description: "Zero packet loss para seus headshots contarem sempre.",
            image_url: "/images/games/valorant.jpg", // Placeholder path for local hosting
            ping_label: "Ping Baixo",
            stability_label: "100% Fibra",
            color_gradient: "from-rose-500 to-red-600",
            sort_order: 1
        },
        {
            name: "PUBG",
            description: "Renderização rápida e resposta imediata em mundo aberto.",
            image_url: "/images/games/pubg.jpg",
            ping_label: "Sem Lag",
            stability_label: "Cabo",
            color_gradient: "from-amber-400 to-orange-500",
            sort_order: 2
        },
        {
            name: "Call of Duty",
            description: "Domine o lobby com a vantagem da conexão fibra óptica.",
            image_url: "/images/games/cod.jpg",
            ping_label: "Otimizado",
            stability_label: "Estável",
            color_gradient: "from-emerald-400 to-green-600",
            sort_order: 3
        }
    ]);

    console.log('Seeding completed!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
