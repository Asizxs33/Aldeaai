import db from './db.js';

// Initialize table if not exists
let tableInitialized = false;
const ensureTable = async () => {
    if (tableInitialized) return;
    try {
        console.log('Attempting to initialize presentations table...');
        // Test connection first
        const connTest = await db.testConnection();
        if (!connTest.success) {
            console.error('Database connection test failed in ensureTable:', connTest.error);
            throw new Error(`DB Connection Failed: ${connTest.error}`);
        }

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
        await db.query(`CREATE INDEX IF NOT EXISTS idx_presentations_user ON presentations(user_id);`);
        console.log('Presentations table initialization successful');
        tableInitialized = true;
    } catch (err) {
        console.error('Table init ERROR:', err);
        // We do NOT suppress the error anymore, because if this fails, the API shouldn't try to query a potentially non-existent table
        // But to avoid 502 loop on every request if DB is transiently down, we might want to let it pass if it's "already exists" (which query handles)
        // If it's a connection error, we should probably throw or handle gracefully.
        // For now, let's log and re-throw so we see the 500 error instead of 502 timeout?
        // Actually 502 mostly comes from timeout or crash.
        // If we catch it here, we proceed to main handler which will try to query and fail again.
    }
};

export const handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Ensure table exists
    await ensureTable();

    try {
        const path = event.path.replace('/.netlify/functions/presentation-api', '');
        const segments = path.split('/').filter(Boolean);

        // GET /presentation-api - Get all presentations for a user
        // GET /presentation-api/:id - Get specific presentation
        if (event.httpMethod === 'GET') {
            const userId = event.queryStringParameters?.userId;

            if (segments[0]) {
                // Get specific presentation
                const result = await db.query(
                    'SELECT * FROM presentations WHERE id = $1',
                    [segments[0]]
                );

                if (result.rows.length === 0) {
                    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Presentation not found' }) };
                }

                const presentation = result.rows[0];
                // Parse JSONB fields if needed
                presentation.slides = typeof presentation.slides === 'string'
                    ? JSON.parse(presentation.slides)
                    : presentation.slides;

                return { statusCode: 200, headers, body: JSON.stringify(presentation) };
            } else {
                // Get all presentations for user
                if (!userId) {
                    return { statusCode: 400, headers, body: JSON.stringify({ message: 'userId is required' }) };
                }

                const result = await db.query(
                    'SELECT id, title, topic, template_id, language, slide_count, presentation_type, created_at, updated_at FROM presentations WHERE user_id = $1 ORDER BY created_at DESC',
                    [userId]
                );

                return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
            }
        }

        // POST /presentation-api - Create new presentation
        if (event.httpMethod === 'POST') {
            let body;
            try {
                body = JSON.parse(event.body || '{}');
            } catch (parseError) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid JSON in request body' }) };
            }

            const { userId, title, topic, templateId, language, slideCount, slides, presentationType, ktp } = body;

            if (!userId || !title || !templateId || !slides) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'userId, title, templateId and slides are required' }) };
            }

            const result = await db.query(
                'INSERT INTO presentations (user_id, title, topic, template_id, language, slide_count, slides, presentation_type, ktp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
                [userId, title, topic || null, templateId, language || 'kk', slideCount || slides.length, JSON.stringify(slides), presentationType || null, ktp || null]
            );

            const presentation = result.rows[0];
            presentation.slides = typeof presentation.slides === 'string'
                ? JSON.parse(presentation.slides)
                : presentation.slides;

            return { statusCode: 201, headers, body: JSON.stringify(presentation) };
        }

        // PUT /presentation-api/:id - Update presentation
        if (event.httpMethod === 'PUT') {
            if (!segments[0]) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Presentation ID is required' }) };
            }

            let body;
            try {
                body = JSON.parse(event.body || '{}');
            } catch (parseError) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid JSON in request body' }) };
            }

            const { title, topic, templateId, language, slideCount, slides, presentationType, ktp } = body;

            const updates = [];
            const values = [];
            let paramIndex = 1;

            if (title !== undefined) {
                updates.push(`title = $${paramIndex++}`);
                values.push(title);
            }
            if (topic !== undefined) {
                updates.push(`topic = $${paramIndex++}`);
                values.push(topic);
            }
            if (templateId !== undefined) {
                updates.push(`template_id = $${paramIndex++}`);
                values.push(templateId);
            }
            if (language !== undefined) {
                updates.push(`language = $${paramIndex++}`);
                values.push(language);
            }
            if (slideCount !== undefined) {
                updates.push(`slide_count = $${paramIndex++}`);
                values.push(slideCount);
            }
            if (slides !== undefined) {
                updates.push(`slides = $${paramIndex++}`);
                values.push(JSON.stringify(slides));
            }
            if (presentationType !== undefined) {
                updates.push(`presentation_type = $${paramIndex++}`);
                values.push(presentationType);
            }
            if (ktp !== undefined) {
                updates.push(`ktp = $${paramIndex++}`);
                values.push(ktp);
            }

            if (updates.length === 0) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'No fields to update' }) };
            }

            updates.push(`updated_at = NOW()`);
            values.push(segments[0]);

            const result = await db.query(
                `UPDATE presentations SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ message: 'Presentation not found' }) };
            }

            const presentation = result.rows[0];
            presentation.slides = typeof presentation.slides === 'string'
                ? JSON.parse(presentation.slides)
                : presentation.slides;

            return { statusCode: 200, headers, body: JSON.stringify(presentation) };
        }

        // DELETE /presentation-api/:id - Delete presentation
        if (event.httpMethod === 'DELETE') {
            if (!segments[0]) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Presentation ID is required' }) };
            }

            const result = await db.query(
                'DELETE FROM presentations WHERE id = $1 RETURNING id',
                [segments[0]]
            );

            if (result.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ message: 'Presentation not found' }) };
            }

            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Presentation deleted', id: result.rows[0].id }) };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) };
    } catch (err) {
        console.error('Presentation API error:', err);
        let errorMessage = 'Internal server error';
        try {
            if (err && typeof err === 'object') {
                errorMessage = err.message || err.detail || err.code || 'Database error';
            } else if (err) {
                errorMessage = String(err);
            }
        } catch (stringifyError) {
            errorMessage = 'Internal server error';
        }
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Server error: ' + errorMessage }),
        };
    }
};
