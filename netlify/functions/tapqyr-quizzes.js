const db = require('./db.cjs');

exports.handler = async (event, context) => {
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

    try {
        const path = event.path.replace('/.netlify/functions/tapqyr-quizzes', '');
        const segments = path.split('/').filter(Boolean);

        // GET /tapqyr-quizzes - Get all quizzes for a user
        // GET /tapqyr-quizzes/:id - Get specific quiz
        if (event.httpMethod === 'GET') {
            const userId = event.queryStringParameters?.userId;

            if (segments[0]) {
                // Get specific quiz
                const result = await db.query(
                    'SELECT * FROM tapqyr_quizzes WHERE id = $1',
                    [segments[0]]
                );

                if (result.rows.length === 0) {
                    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Quiz not found' }) };
                }

                return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
            }

            if (!userId) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'userId is required' }) };
            }

            const result = await db.query(
                'SELECT * FROM tapqyr_quizzes WHERE user_id = $1 ORDER BY created_at DESC',
                [userId]
            );

            return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
        }

        // POST /tapqyr-quizzes - Create new quiz
        if (event.httpMethod === 'POST') {
            const { userId, title, questions } = JSON.parse(event.body);

            if (!userId || !title || !questions) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'userId, title and questions are required' }) };
            }

            const result = await db.query(
                'INSERT INTO tapqyr_quizzes (user_id, title, questions) VALUES ($1, $2, $3) RETURNING *',
                [userId, title, JSON.stringify(questions)]
            );

            return { statusCode: 201, headers, body: JSON.stringify(result.rows[0]) };
        }

        // PUT /tapqyr-quizzes/:id - Update quiz
        if (event.httpMethod === 'PUT') {
            if (!segments[0]) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Quiz ID is required' }) };
            }

            const { title, questions } = JSON.parse(event.body);

            const result = await db.query(
                'UPDATE tapqyr_quizzes SET title = COALESCE($1, title), questions = COALESCE($2, questions), updated_at = NOW() WHERE id = $3 RETURNING *',
                [title, questions ? JSON.stringify(questions) : null, segments[0]]
            );

            if (result.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ message: 'Quiz not found' }) };
            }

            return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
        }

        // DELETE /tapqyr-quizzes/:id - Delete quiz
        if (event.httpMethod === 'DELETE') {
            if (!segments[0]) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Quiz ID is required' }) };
            }

            await db.query('DELETE FROM tapqyr_quizzes WHERE id = $1', [segments[0]]);

            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Quiz deleted' }) };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) };

    } catch (err) {
        console.error('Tapqyr quizzes error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Server error: ' + err.message }),
        };
    }
};
