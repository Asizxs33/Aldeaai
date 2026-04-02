const db = require('./db.cjs');

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
        const path = event.path.replace('/.netlify/functions/tapqyr-players', '');
        const segments = path.split('/').filter(Boolean);

        // POST /tapqyr-players - Join game
        if (event.httpMethod === 'POST') {
            let code, name;
            try {
                const body = JSON.parse(event.body || '{}');
                code = body.code;
                name = body.name;
            } catch (parseError) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid JSON in request body' }) };
            }

            if (!code || !name) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'code and name are required' }) };
            }

            // Find session
            const sessionResult = await db.query(
                `SELECT s.*, q.questions, q.title as quiz_title FROM tapqyr_sessions s 
                 JOIN tapqyr_quizzes q ON s.quiz_id = q.id 
                 WHERE s.code = $1 AND s.status = 'waiting'`,
                [code.toUpperCase()]
            );

            if (sessionResult.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ message: 'Game not found or already started' }) };
            }

            const session = sessionResult.rows[0];

            // Check if name already taken in this session
            const existingPlayer = await db.query(
                'SELECT id FROM tapqyr_players WHERE session_id = $1 AND name = $2',
                [session.id, name.trim()]
            );

            if (existingPlayer.rows.length > 0) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Name already taken' }) };
            }

            // Add player
            const playerResult = await db.query(
                'INSERT INTO tapqyr_players (session_id, name, score, avatar) VALUES ($1, $2, 0, $3) RETURNING *',
                [session.id, name.trim(), `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name.trim())}`]
            );

            // Parse questions if it's a string, otherwise use as is (JSONB returns as object)
            const questions = typeof session.questions === 'string'
                ? JSON.parse(session.questions)
                : session.questions;

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    player: playerResult.rows[0],
                    session: {
                        code: session.code,
                        status: session.status,
                        quizTitle: session.quiz_title,
                        questionCount: Array.isArray(questions) ? questions.length : 0
                    }
                })
            };
        }

        // GET /tapqyr-players/:sessionCode - Get players and game state (for polling)
        if (event.httpMethod === 'GET') {
            if (!segments[0]) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Session code is required' }) };
            }

            const code = segments[0].toUpperCase();
            const playerId = event.queryStringParameters?.playerId;

            // Get session with current state
            const sessionResult = await db.query(
                `SELECT s.*, q.questions, q.title as quiz_title FROM tapqyr_sessions s 
                 JOIN tapqyr_quizzes q ON s.quiz_id = q.id 
                 WHERE s.code = $1`,
                [code]
            );

            if (sessionResult.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ message: 'Session not found' }) };
            }

            const session = sessionResult.rows[0];

            // Get all players
            const playersResult = await db.query(
                'SELECT * FROM tapqyr_players WHERE session_id = $1 ORDER BY score DESC',
                [session.id]
            );

            // Get answers for current question if playing
            let answers = [];
            if (session.status === 'playing' && session.current_question >= 0) {
                const answersResult = await db.query(
                    'SELECT player_id, answer_index FROM tapqyr_answers WHERE session_id = $1 AND question_index = $2',
                    [session.id, session.current_question]
                );
                answers = answersResult.rows;
            }

            // Parse questions if it's a string, otherwise use as is (JSONB returns as object)
            const questions = typeof session.questions === 'string'
                ? JSON.parse(session.questions)
                : session.questions;

            // Parse game_state if it's a string
            let gameState = session.game_state || {};
            if (typeof gameState === 'string') {
                try {
                    gameState = JSON.parse(gameState);
                } catch (e) {
                    gameState = {};
                }
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: session.status,
                    currentQuestion: session.current_question,
                    gameState: gameState,
                    players: playersResult.rows,
                    answeredCount: answers.length,
                    questions: session.status === 'playing' ? questions : null
                })
            };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) };

    } catch (err) {
        console.error('Tapqyr players error:', err);
        let errorMessage = 'Internal server error';
        try {
            if (err && typeof err === 'object') {
                // PostgreSQL errors have a 'message' property
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
