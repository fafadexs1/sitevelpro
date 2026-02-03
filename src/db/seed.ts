import * as dotenv from 'dotenv';
dotenv.config();

import { db } from './index';
import { plans, system_settings, games, faqs, testimonials, popups, hero_slides, cities } from './schema';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
    console.log('🌱 Seeding database...');

    // 1. System Settings
    // 0. Clean up (Optional, be careful in prod)
    console.log('Cleaning up existing data...');
    // Delete validation strict order for foreign keys
    await db.delete(popups);
    await db.delete(system_settings);
    await db.delete(plans);
    await db.delete(hero_slides);
    await db.delete(faqs);

    // 1. System Settings
    console.log('Populating system settings...');
    await db.insert(system_settings).values([
        {
            key: 'company_logo_url',
            value: '/images/logo.png', // Placeholder
            description: 'URL of the company logo',
        },
        {
            key: 'commemorative_theme_enabled',
            value: 'false',
            description: 'Enable commemorative theme',
        },
    ]).onConflictDoNothing();

    // 2. Plans (Enterprise & Residential basic seeds)
    console.log('Populating plans...');
    // Add some sample plans to avoid empty pages
    await db.insert(plans).values([
        {
            type: 'residencial',
            speed: '100 Mega',
            price: 99.90,
            features: ['Wifi Grátis', 'Instalação Grátis'],
            highlight: false,
            has_tv: false,
            sort_order: 1,
        },
        {
            type: 'empresarial',
            speed: 'Link Dedicado 100MB',
            price: 299.90,
            features: ['SLA 4h', 'IP Fixo'],
            highlight: true,
            has_tv: false,
            sort_order: 1,
        }
    ]).onConflictDoNothing();

    // 3. FAQs
    console.log('Populating FAQs...');
    await db.insert(faqs).values([
        {
            question: 'Como contrato?',
            answer: 'Entre em contato pelo WhatsApp.',
            sort_order: 1,
        }
    ]).onConflictDoNothing();

    // 4. Hero Slides
    console.log('Populating Hero Slides...');
    await db.insert(hero_slides).values([
        {
            title_regular: 'Velocidade que Impressiona',
            subtitle: 'Conheça nossos planos de fibra óptica',
            is_active: true,
            sort_order: 1,
            image_url: '/images/hero-bg.jpg',
            slide_type: 'content',
            button_primary_text: 'Assinar Agora',
            button_primary_link: '/assinar',
        }
    ]).onConflictDoNothing();

    console.log('✅ Seeding complete!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
