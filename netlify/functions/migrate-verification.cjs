const db = require('./db.cjs');

async function migrate() {
    try {
        console.log('Starting migration for email verification...');

        // Add verification_code column if it doesn't exist
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verification_code') THEN
                    ALTER TABLE users ADD COLUMN verification_code VARCHAR(6);
                END IF;
            END $$;
        `);

        // Add email_verified column if it doesn't exist
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
                    ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
                END IF;
            END $$;
        `);

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
