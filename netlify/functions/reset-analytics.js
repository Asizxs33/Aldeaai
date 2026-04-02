const db = require('./db.cjs');

exports.handler = async (event, context) => {
    try {
        // 1. Drop the existing table if it exists
        await db.query('DROP TABLE IF EXISTS analytics_events CASCADE');

        // 2. Recreate the table with correct schema
        await db.query(`
            CREATE TABLE analytics_events (
                id SERIAL PRIMARY KEY,
                user_id INTEGER, 
                event_type VARCHAR(50) NOT NULL,
                event_data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Add some test data
        await db.query(`
            INSERT INTO analytics_events (event_type, event_data) 
            VALUES ('system_init', '{"message": "Analytics system initialized"}')
        `);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Analytics database table recreated successfully!' }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error: ' + err.message }),
        };
    }
};
