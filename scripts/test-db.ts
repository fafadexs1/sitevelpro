
import * as dotenv from 'dotenv';
dotenv.config();
import postgres from 'postgres';

async function test() {
    const url = process.env.DATABASE_URL;
    console.log('Testing connection to:', url?.replace(/:([^:@]+)@/, ':****@'));

    if (!url) {
        console.error('DATABASE_URL is missing');
        return;
    }

    const sql = postgres(url, {
        prepare: false,
        debug: (connection, query, params) => {
            console.log('Query:', query);
        }
    });

    try {
        const result = await sql`SELECT 1 as val`;
        console.log('Connection successful:', result);
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await sql.end();
    }
}

test();
