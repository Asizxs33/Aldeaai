const db = require('./db.cjs');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) };
    }

    try {
        const { code, playerId, questionIndex, answerIndex, timeLeft, maxTime } = JSON.parse(event.body);

        if (!code || !playerId || questionIndex === undefined || answerIndex === undefined) {
            return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing required fields' }) };
        }

        // Get session
        const sessionResult = await db.query(
            `SELECT s.*, q.questions FROM tapqyr_sessions s 
             JOIN tapqyr_quizzes q ON s.quiz_id = q.id 
             WHERE s.code = $1 AND s.status = 'playing'`,
            [code.toUpperCase()]
        );

        if (sessionResult.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Game not found or not playing' }) };
        }

        const session = sessionResult.rows[0];
        // Parse questions if it's a string, otherwise use as is (JSONB returns as object)
        const questions = typeof session.questions === 'string'
            ? JSON.parse(session.questions)
            : session.questions;

        // Check if already answered
        const existingAnswer = await db.query(
            'SELECT id FROM tapqyr_answers WHERE session_id = $1 AND player_id = $2 AND question_index = $3',
            [session.id, playerId, questionIndex]
        );

        if (existingAnswer.rows.length > 0) {
            return { statusCode: 400, headers, body: JSON.stringify({ message: 'Already answered' }) };
        }

        // Check if correct
        const correctIndex = questions[questionIndex]?.correctIndex;
        const isCorrect = answerIndex === correctIndex;

        // Calculate points based on speed
        let points = 0;
        if (isCorrect) {
            const speedBonus = timeLeft && maxTime ? (timeLeft / maxTime) : 0.5;
            points = Math.round(500 + (500 * speedBonus)); // 500-1000 points based on speed
        }

        // Save answer
        await db.query(
            'INSERT INTO tapqyr_answers (session_id, player_id, question_index, answer_index, is_correct, points, answered_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
            [session.id, playerId, questionIndex, answerIndex, isCorrect, points]
        );

        // Update player score
        if (points > 0) {
            await db.query(
                'UPDATE tapqyr_players SET score = score + $1 WHERE id = $2',
                [points, playerId]
            );
        }

        // Get updated player
        const playerResult = await db.query('SELECT * FROM tapqyr_players WHERE id = $1', [playerId]);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                isCorrect,
                correctIndex,
                points,
                totalScore: playerResult.rows[0]?.score || 0
            })
        };

    } catch (err) {
        console.error('Tapqyr answer error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Server error: ' + err.message }),
        };
    }
};
