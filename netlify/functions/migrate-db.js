import db from './db.js';

export const handler = async (event, context) => {
    try {
        console.log('Starting migration...');

        // 1. Add subscription_plan column
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free'
        `);

        // 2. Add logs/usage tracking columns
        await db.query(`
             ALTER TABLE users 
             ADD COLUMN IF NOT EXISTS daily_generations_count INTEGER DEFAULT 0,
             ADD COLUMN IF NOT EXISTS last_generation_date TIMESTAMP
        `);

        // 3. Add subscription_end_date (optional, for expiry)
        await db.query(`
             ALTER TABLE users 
             ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP
        `);

        // 4. Create presentations table
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

        // 5. Create indexes for presentations
        await db.query(`CREATE INDEX IF NOT EXISTS idx_presentations_user ON presentations(user_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_presentations_created ON presentations(created_at DESC);`);

        // 6. Create Tapqyr quizzes table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tapqyr_quizzes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                questions JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 7. Create Tapqyr sessions table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tapqyr_sessions (
                id SERIAL PRIMARY KEY,
                code VARCHAR(6) UNIQUE NOT NULL,
                quiz_id INTEGER REFERENCES tapqyr_quizzes(id) ON DELETE CASCADE,
                host_id INTEGER REFERENCES users(id),
                status VARCHAR(20) DEFAULT 'waiting',
                current_question INTEGER DEFAULT -1,
                game_state JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT NOW(),
                started_at TIMESTAMP,
                finished_at TIMESTAMP
            );
        `);

        // 8. Create Tapqyr players table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tapqyr_players (
                id SERIAL PRIMARY KEY,
                session_id INTEGER REFERENCES tapqyr_sessions(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                avatar VARCHAR(500),
                score INTEGER DEFAULT 0,
                joined_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 9. Create Tapqyr answers table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tapqyr_answers (
                id SERIAL PRIMARY KEY,
                session_id INTEGER REFERENCES tapqyr_sessions(id) ON DELETE CASCADE,
                player_id INTEGER REFERENCES tapqyr_players(id) ON DELETE CASCADE,
                question_index INTEGER NOT NULL,
                answer_index INTEGER NOT NULL,
                is_correct BOOLEAN DEFAULT FALSE,
                points INTEGER DEFAULT 0,
                answered_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 10. Create Tapqyr indexes
        await db.query(`CREATE INDEX IF NOT EXISTS idx_tapqyr_quizzes_user ON tapqyr_quizzes(user_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_tapqyr_sessions_code ON tapqyr_sessions(code);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_tapqyr_sessions_status ON tapqyr_sessions(status);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_tapqyr_players_session ON tapqyr_players(session_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_tapqyr_answers_session ON tapqyr_answers(session_id);`);

        console.log('Migration completed successfully');
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Migration executed successfully' }),
        };
    } catch (err) {
        console.error('Migration error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Migration failed: ' + err.message }),
        };
    }
};
