import pg from 'pg';
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
    console.error('CRITICAL: DATABASE_URL environment variable is NOT defined!');
} else {
    console.log('DATABASE_URL is defined (length: ' + process.env.DATABASE_URL.length + ')');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 2, // Limit pool size to prevent exhausting DB connections in serverless
    idleTimeoutMillis: 3000, // Close idle clients after 3 seconds
    connectionTimeoutMillis: 5000 // Return an error after 5 seconds if connection could not be established
});

// Check connection
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

// Wrapper to log queries and errors
export default {
    query: async (text, params) => {
        const start = Date.now();
        try {
            if (!process.env.DATABASE_URL) {
                throw new Error('DATABASE_URL is missing in environment');
            }
            const res = await pool.query(text, params);
            const duration = Date.now() - start;
            // Only log long queries or modifications
            if (duration > 500 || (text && !text.trim().toLowerCase().startsWith('select'))) {
                console.log('Executed query', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
            }
            return res;
        } catch (error) {
            console.error('Database Query Error:', {
                message: error.message,
                code: error.code,
                detail: error.detail,
                query: text ? text.substring(0, 100) : 'unknown'
            });
            throw error; // Re-throw to be caught by the handler
        }
    },
    // Helper to test connection explicitly
    testConnection: async () => {
        try {
            const client = await pool.connect();
            const res = await client.query('SELECT NOW()');
            client.release();
            return { success: true, time: res.rows[0].now };
        } catch (err) {
            console.error('DB Connection Test Failed:', err);
            return { success: false, error: err.message };
        }
    }
};
