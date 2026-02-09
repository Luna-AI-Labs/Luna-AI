import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper for running queries
export const db = {
  query: (text, params) => pool.query(text, params),
  
  // Shim to maintain some compatibility with better-sqlite3 style if needed, 
  // but better to refactor usage. For now, we provide a raw query interface.
  // We will refactor the calling code (routes) to use async/await and db.query
};

// Initialize DB schema
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, 'schema.sql');

export const initDb = async () => {
  try {
    if (!fs.existsSync(schemaPath)) {
        console.error('❌ Schema file not found at:', schemaPath);
        return;
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✅ PostgreSQL Schema initialized');
  } catch (err) {
    console.error('❌ Failed to initialize schema:', err);
    console.error('   Ensure DATABASE_URL is set in .env and Postgres is running.');
  }
};

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL at:', res.rows[0].now);
  }
});

export default pool;
