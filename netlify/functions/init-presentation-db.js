const db = require('./db.cjs');

exports.handler = async (event, context) => {
    try {
        console.log('Starting presentation tables initialization...');

        // Create presentations table
        await db.query(`
            CREATE TABLE IF NOT EXISTS presentations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                topic TEXT,
                template_id VARCHAR(50) NOT NULL,
                language VARCHAR(10) DEFAULT 'kk',
                slide_count INTEGER NOT NULL,
                slides JSONB NOT NULL,
                presentation_type VARCHAR(50),
                ktp VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Create indexes
        await db.query(`CREATE INDEX IF NOT EXISTS idx_presentations_user ON presentations(user_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_presentations_created ON presentations(created_at DESC);`);

        console.log('Presentation tables initialized successfully');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Presentation database initialized successfully' }),
        };
    } catch (err) {
        console.error('Initialization error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Initialization failed: ' + err.message }),
        };
    }
};
