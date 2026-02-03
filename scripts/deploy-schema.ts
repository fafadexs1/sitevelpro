
import 'dotenv/config';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function deploy() {
    console.log('Deploying new tables...');

    // Testimonials
    console.log('Creating testimonials table...');
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      role text,
      text text NOT NULL,
      stars integer DEFAULT 5 NOT NULL,
      avatar_url text,
      created_at timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

    // FAQs
    console.log('Creating faqs table...');
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS faqs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      question text NOT NULL,
      answer text NOT NULL,
      sort_order integer DEFAULT 0,
      created_at timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

    // Games
    console.log('Creating games table...');
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS games (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      description text NOT NULL,
      image_url text NOT NULL,
      ping_label text,
      stability_label text,
      color_gradient text,
      sort_order integer DEFAULT 0
    );
  `);

    // Popups
    console.log('Creating popups table...');
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS popups (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      plan_id uuid REFERENCES plans(id),
      title text,
      content text,
      image_url text,
      button_text text,
      button_link text,
      button_action_type text DEFAULT 'link',
      button_whatsapp_message text,
      display_on text DEFAULT 'main_site',
      trigger_type text DEFAULT 'delay',
      trigger_value integer DEFAULT 5,
      frequency text DEFAULT 'once_per_session',
      is_active boolean DEFAULT true,
      created_at timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

    // Conversion Events
    console.log('Creating conversion_events table...');
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS conversion_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      event_snippet text NOT NULL,
      selector text,
      is_active boolean DEFAULT true,
      created_at timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

    // Hero Slides (if missing)
    console.log('Creating hero_slides table...');
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      desktop_image_url text NOT NULL,
      mobile_image_url text NOT NULL,
      title text,
      subtitle text,
      button_text text,
      button_link text,
      sort_order integer DEFAULT 0,
      is_active boolean DEFAULT true
    );
  `);

    // Cities (if missing)
    console.log('Creating cities table...');
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS cities (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      slug text NOT NULL UNIQUE,
      active boolean DEFAULT true NOT NULL
    );
    `);


    console.log('Deployment completed!');
    process.exit(0);
}

deploy().catch((err) => {
    console.error('Deployment failed:', err);
    process.exit(1);
});
