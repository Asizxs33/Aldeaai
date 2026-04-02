import pool from './db.js';

async function testConnection() {
    try {
        console.log('Testing database connection...');
        const res = await pool.query('SELECT NOW()');
        console.log('Connection successful!', res.rows[0]);

        console.log('Checking users table...');
        const tableCheck = await pool.query("SELECT * FROM information_schema.tables WHERE table_name = 'users'");
        if (tableCheck.rows.length > 0) {
            console.log('Users table exists.');
        } else {
            console.error('Users table does NOT exist!');
        }

    } catch (err) {
        console.error('Database connection failed:', err);
    } finally {
        pool.end();
    }
}

testConnection();
