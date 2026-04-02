const db = require('./db.cjs');

// Generate random 6-character game code
const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const path = event.path.replace('/.netlify/functions/tapqyr-sessions', '');
        const segments = path.split('/').filter(Boolean);

        // GET /tapqyr-sessions/:code - Get session by code
        if (event.httpMethod === 'GET') {
            if (!segments[0]) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Session code is required' }) };
            }

            const code = segments[0].toUpperCase();

            const result = await db.query(
                `SELECT s.*, q.title as quiz_title, q.questions 
                 FROM tapqyr_sessions s 
                 JOIN tapqyr_quizzes q ON s.quiz_id = q.id 
                 WHERE s.code = $1 AND s.status != 'finished'`,
                [code]
            );

            if (result.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ message: 'Session not found or finished' }) };
            }

            // Get players
            const playersResult = await db.query(
                'SELECT * FROM tapqyr_players WHERE session_id = $1 ORDER BY joined_at',
                [result.rows[0].id]
            );

            const session = {
                ...result.rows[0],
                players: playersResult.rows
            };

            return { statusCode: 200, headers, body: JSON.stringify(session) };
        }

        // POST /tapqyr-sessions - Create new session
        if (event.httpMethod === 'POST') {
            const { quizId, hostId } = JSON.parse(event.body);

            if (!quizId || !hostId) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'quizId and hostId are required' }) };
            }

            // Generate unique code
            let code;
            let attempts = 0;
            while (attempts < 10) {
                code = generateCode();
                const existing = await db.query('SELECT id FROM tapqyr_sessions WHERE code = $1 AND status != $2', [code, 'finished']);
                if (existing.rows.length === 0) break;
                attempts++;
            }

            const result = await db.query(
                `INSERT INTO tapqyr_sessions (code, quiz_id, host_id, status, current_question, game_state) 
                 VALUES ($1, $2, $3, 'waiting', -1, '{}') RETURNING *`,
                [code, quizId, hostId]
            );

            // Get quiz data
            const quizResult = await db.query('SELECT * FROM tapqyr_quizzes WHERE id = $1', [quizId]);

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    ...result.rows[0],
                    quiz: quizResult.rows[0]
                })
            };
        }

        // PUT /tapqyr-sessions/:code - Update session (next question, show answer, etc.)
        if (event.httpMethod === 'PUT') {
            if (!segments[0]) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Session code is required' }) };
            }

            const code = segments[0].toUpperCase();
            const { action, data } = JSON.parse(event.body);

            let query, params;

            switch (action) {
                case 'start':
                    query = `UPDATE tapqyr_sessions SET status = 'playing', current_question = 0, started_at = NOW() WHERE code = $1 RETURNING *`;
                    params = [code];
                    break;

                case 'nextQuestion':
                    query = `UPDATE tapqyr_sessions SET current_question = current_question + 1, game_state = jsonb_set(COALESCE(game_state, '{}')::jsonb, '{showAnswer}', 'false') WHERE code = $1 RETURNING *`;
                    params = [code];
                    break;

                case 'showAnswer':
                    query = `UPDATE tapqyr_sessions SET game_state = jsonb_set(COALESCE(game_state, '{}')::jsonb, '{showAnswer}', 'true') WHERE code = $1 RETURNING *`;
                    params = [code];
                    break;

                case 'finish':
                    query = `UPDATE tapqyr_sessions SET status = 'finished', finished_at = NOW() WHERE code = $1 RETURNING *`;
                    params = [code];
                    break;

                case 'updateState':
                    query = `UPDATE tapqyr_sessions SET game_state = $2 WHERE code = $1 RETURNING *`;
                    params = [code, JSON.stringify(data)];
                    break;

                default:
                    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid action' }) };
            }

            const result = await db.query(query, params);

            if (result.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ message: 'Session not found' }) };
            }

            return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
        }

        // DELETE /tapqyr-sessions/:code - Delete/end session
        if (event.httpMethod === 'DELETE') {
            if (!segments[0]) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Session code is required' }) };
            }

            const code = segments[0].toUpperCase();

            // Delete players first
            const sessionResult = await db.query('SELECT id FROM tapqyr_sessions WHERE code = $1', [code]);
            if (sessionResult.rows.length > 0) {
                await db.query('DELETE FROM tapqyr_players WHERE session_id = $1', [sessionResult.rows[0].id]);
                await db.query('DELETE FROM tapqyr_answers WHERE session_id = $1', [sessionResult.rows[0].id]);
            }

            await db.query('DELETE FROM tapqyr_sessions WHERE code = $1', [code]);

            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Session deleted' }) };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) };

    } catch (err) {
        console.error('Tapqyr sessions error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Server error: ' + err.message }),
        };
    }
};
