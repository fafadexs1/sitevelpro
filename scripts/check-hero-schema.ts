
import 'dotenv/config';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function checkColumns() {
    console.log('Checking hero_slides columns...');
    try {
        const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'hero_slides';
    `);
        console.log('Columns:', result);
    } catch (e) {
        console.error('Error:', e);
    }
    process.exit(0);
}

checkColumns();
