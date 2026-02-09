
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env from server/.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const { Pool } = pg;

async function verify() {
    console.log('🔌 Testing PostgreSQL Connection...');
    console.log('   URL:', process.env.DATABASE_URL);

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Connection Successful!');
        console.log('   Server Time:', res.rows[0].now);

        console.log('\n🔍 Checking Schema...');
        try {
            const tables = await pool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);
            console.log('   Tables found:', tables.rows.map(r => r.table_name).join(', '));

            const required = ['users', 'periods', 'daily_logs', 'predictions'];
            const found = tables.rows.map(r => r.table_name);
            const missing = required.filter(t => !found.includes(t));

            if (missing.length === 0) {
                console.log('✅ All core tables present.');
            } else {
                console.log('⚠️  Missing tables:', missing.join(', '));
                console.log('   (They should be created when the server starts via initDb)');
            }

        } catch (e) {
            console.error('   Failed to query schema:', e.message);
        }

    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        console.error('   Make sure PostgreSQL is running and DATABASE_URL is correct.');
    } finally {
        await pool.end();
    }
}

verify();
