require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const query = (text, params) => pool.query(text, params);

const migrate = async () => {
    try {
        console.log('Starting migration...');

        // 1. Add subscription_plan column
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free'
        `);

        // 2. Add logs/usage tracking columns
        await query(`
             ALTER TABLE users 
             ADD COLUMN IF NOT EXISTS daily_generations_count INTEGER DEFAULT 0,
             ADD COLUMN IF NOT EXISTS last_generation_date TIMESTAMP
        `);

        // 3. Add subscription_end_date (optional, for expiry)
        await query(`
             ALTER TABLE users 
             ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP
        `);

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
};

migrate();
