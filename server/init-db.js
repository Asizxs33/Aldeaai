import * as db from './db.js';

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
`;

async function initDb() {
    try {
        await db.query(createTableQuery);
        console.log("Users table created successfully (or already exists).");
    } catch (err) {
        console.error("Error creating users table:", err);
    } finally {
        process.exit();
    }
}

initDb();
