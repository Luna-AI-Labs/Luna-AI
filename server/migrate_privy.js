import { db } from './src/db/database.js';

const migrate = async () => {
    try {
        console.log('🔄 Running migration...');

        // Add privy_id column if it doesn't exist
        await db.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='privy_id') THEN 
          ALTER TABLE users ADD COLUMN privy_id VARCHAR(255) UNIQUE; 
        END IF; 
      END $$;
    `);

        // Make email nullable
        await db.query('ALTER TABLE users ALTER COLUMN email DROP NOT NULL;');

        // Make password_hash nullable
        await db.query('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;');

        console.log('✅ Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrate();
