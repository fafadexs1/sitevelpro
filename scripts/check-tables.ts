
import 'dotenv/config';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function checkTables() {
    console.log('Checking tables...');
    try {
        const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
        console.log('Tables found:', result.map(r => r.table_name));
    } catch (e) {
        console.error('Error checking tables:', e);
    }
    process.exit(0);
}

checkTables();
