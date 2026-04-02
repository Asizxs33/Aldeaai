import express from 'express';
import * as db from '../db.js';

const router = express.Router();

// Generate random 6-character game code
const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// ==================== QUIZZES ====================
// GET /tapqyr-quizzes?userId=123
router.get('/tapqyr-quizzes', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const result = await db.query(
            'SELECT * FROM tapqyr_quizzes WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Tapqyr quizzes GET error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// GET /tapqyr-quizzes/:id
router.get('/tapqyr-quizzes/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tapqyr_quizzes WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Tapqyr quiz GET error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// POST /tapqyr-quizzes
router.post('/tapqyr-quizzes', async (req, res) => {
    try {
        const { userId, title, questions } = req.body;
        if (!userId || !title || !questions) {
            return res.status(400).json({ message: 'userId, title and questions are required' });
        }

        const result = await db.query(
            'INSERT INTO tapqyr_quizzes (user_id, title, questions) VALUES ($1, $2, $3) RETURNING *',
            [userId, title, JSON.stringify(questions)]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Tapqyr quiz POST error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// PUT /tapqyr-quizzes/:id
router.put('/tapqyr-quizzes/:id', async (req, res) => {
    try {
        const { title, questions } = req.body;
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramCount++}`);
            values.push(title);
        }
        if (questions !== undefined) {
            updates.push(`questions = $${paramCount++}`);
            values.push(JSON.stringify(questions));
        }
        updates.push(`updated_at = NOW()`);

        values.push(req.params.id);
        const result = await db.query(
            `UPDATE tapqyr_quizzes SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Tapqyr quiz PUT error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// DELETE /tapqyr-quizzes/:id
router.delete('/tapqyr-quizzes/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM tapqyr_quizzes WHERE id = $1', [req.params.id]);
        res.json({ message: 'Quiz deleted' });
    } catch (err) {
        console.error('Tapqyr quiz DELETE error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// ==================== SESSIONS ====================
// POST /tapqyr-sessions
router.post('/tapqyr-sessions', async (req, res) => {
    try {
        const { quizId, hostId } = req.body;
        if (!quizId || !hostId) {
            return res.status(400).json({ message: 'quizId and hostId are required' });
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

        const quizResult = await db.query('SELECT * FROM tapqyr_quizzes WHERE id = $1', [quizId]);

        res.status(201).json({
            ...result.rows[0],
            quiz: quizResult.rows[0]
        });
    } catch (err) {
        console.error('Tapqyr session POST error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// GET /tapqyr-sessions/:code
router.get('/tapqyr-sessions/:code', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        const result = await db.query(
            `SELECT s.*, q.title as quiz_title, q.questions 
             FROM tapqyr_sessions s 
             JOIN tapqyr_quizzes q ON s.quiz_id = q.id 
             WHERE s.code = $1 AND s.status != 'finished'`,
            [code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found or finished' });
        }

        const playersResult = await db.query(
            'SELECT * FROM tapqyr_players WHERE session_id = $1 ORDER BY joined_at',
            [result.rows[0].id]
        );

        res.json({
            ...result.rows[0],
            players: playersResult.rows
        });
    } catch (err) {
        console.error('Tapqyr session GET error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// PUT /tapqyr-sessions/:code
router.put('/tapqyr-sessions/:code', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        const { action, data } = req.body;

        let query, params;

        switch (action) {
            case 'start':
                query = `UPDATE tapqyr_sessions SET status = 'playing', current_question = 0, started_at = NOW() WHERE code = $1 RETURNING *`;
                params = [code];
                break;
            case 'nextQuestion':
                query = `UPDATE tapqyr_sessions SET current_question = current_question + 1, game_state = jsonb_set(COALESCE(game_state, '{}')::jsonb, '{showAnswer}', '"false"') WHERE code = $1 RETURNING *`;
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
                return res.status(400).json({ message: 'Invalid action' });
        }

        const result = await db.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Tapqyr session PUT error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// DELETE /tapqyr-sessions/:code
router.delete('/tapqyr-sessions/:code', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        const sessionResult = await db.query('SELECT id FROM tapqyr_sessions WHERE code = $1', [code]);
        if (sessionResult.rows.length > 0) {
            await db.query('DELETE FROM tapqyr_players WHERE session_id = $1', [sessionResult.rows[0].id]);
            await db.query('DELETE FROM tapqyr_answers WHERE session_id = $1', [sessionResult.rows[0].id]);
        }
        await db.query('DELETE FROM tapqyr_sessions WHERE code = $1', [code]);
        res.json({ message: 'Session deleted' });
    } catch (err) {
        console.error('Tapqyr session DELETE error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// ==================== PLAYERS ====================
// POST /tapqyr-players
router.post('/tapqyr-players', async (req, res) => {
    try {
        const { code, name } = req.body;
        if (!code || !name) {
            return res.status(400).json({ message: 'code and name are required' });
        }

        const sessionResult = await db.query(
            `SELECT s.*, q.questions FROM tapqyr_sessions s 
             JOIN tapqyr_quizzes q ON s.quiz_id = q.id 
             WHERE s.code = $1 AND s.status = 'waiting'`,
            [code.toUpperCase()]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Game not found or already started' });
        }

        const session = sessionResult.rows[0];

        const existingPlayer = await db.query(
            'SELECT id FROM tapqyr_players WHERE session_id = $1 AND name = $2',
            [session.id, name.trim()]
        );

        if (existingPlayer.rows.length > 0) {
            return res.status(400).json({ message: 'Name already taken' });
        }

        const playerResult = await db.query(
            'INSERT INTO tapqyr_players (session_id, name, score, avatar) VALUES ($1, $2, 0, $3) RETURNING *',
            [session.id, name.trim(), `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name.trim())}`]
        );

        let questions = [];
        try {
            questions = typeof session.questions === 'string' 
                ? JSON.parse(session.questions) 
                : (session.questions || []);
        } catch (parseErr) {
            console.error('Error parsing questions:', parseErr);
            questions = [];
        }

        res.status(201).json({
            player: playerResult.rows[0],
            session: {
                code: session.code,
                status: session.status,
                quizTitle: session.quiz_title || 'Quiz',
                questionCount: Array.isArray(questions) ? questions.length : 0
            }
        });
    } catch (err) {
        console.error('Tapqyr player POST error:', err);
        const errorMessage = err.message || String(err);
        res.status(500).json({ message: 'Server error: ' + errorMessage });
    }
});

// GET /tapqyr-players/:code
router.get('/tapqyr-players/:code', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        const playerId = req.query.playerId;

        const sessionResult = await db.query(
            `SELECT s.*, q.questions FROM tapqyr_sessions s 
             JOIN tapqyr_quizzes q ON s.quiz_id = q.id 
             WHERE s.code = $1`,
            [code]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const session = sessionResult.rows[0];
        const playersResult = await db.query(
            'SELECT * FROM tapqyr_players WHERE session_id = $1 ORDER BY score DESC',
            [session.id]
        );

        let answers = [];
        if (session.status === 'playing' && session.current_question >= 0) {
            const answersResult = await db.query(
                'SELECT player_id, answer_index FROM tapqyr_answers WHERE session_id = $1 AND question_index = $2',
                [session.id, session.current_question]
            );
            answers = answersResult.rows;
        }

        const questions = typeof session.questions === 'string' 
            ? JSON.parse(session.questions) 
            : session.questions;

        res.json({
            status: session.status,
            currentQuestion: session.current_question,
            gameState: session.game_state || {},
            players: playersResult.rows,
            answeredCount: answers.length,
            questions: session.status === 'playing' ? questions : null
        });
    } catch (err) {
        console.error('Tapqyr players GET error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// ==================== ANSWERS ====================
// POST /tapqyr-answer
router.post('/tapqyr-answer', async (req, res) => {
    try {
        const { code, playerId, questionIndex, answerIndex, timeLeft, maxTime } = req.body;
        if (!code || !playerId || questionIndex === undefined || answerIndex === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const sessionResult = await db.query(
            `SELECT s.*, q.questions FROM tapqyr_sessions s 
             JOIN tapqyr_quizzes q ON s.quiz_id = q.id 
             WHERE s.code = $1 AND s.status = 'playing'`,
            [code.toUpperCase()]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Game not found or not playing' });
        }

        const session = sessionResult.rows[0];
        const questions = typeof session.questions === 'string' 
            ? JSON.parse(session.questions) 
            : (session.questions || []);

        const existingAnswer = await db.query(
            'SELECT id FROM tapqyr_answers WHERE session_id = $1 AND player_id = $2 AND question_index = $3',
            [session.id, playerId, questionIndex]
        );

        if (existingAnswer.rows.length > 0) {
            return res.status(400).json({ message: 'Already answered' });
        }

        const correctIndex = questions[questionIndex]?.correctIndex;
        const isCorrect = answerIndex === correctIndex;
        let points = 0;
        if (isCorrect) {
            const speedBonus = timeLeft && maxTime ? (timeLeft / maxTime) : 0.5;
            points = Math.round(500 + (500 * speedBonus));
        }

        await db.query(
            'INSERT INTO tapqyr_answers (session_id, player_id, question_index, answer_index, is_correct, points, answered_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
            [session.id, playerId, questionIndex, answerIndex, isCorrect, points]
        );

        if (points > 0) {
            await db.query('UPDATE tapqyr_players SET score = score + $1 WHERE id = $2', [points, playerId]);
        }

        const playerResult = await db.query('SELECT * FROM tapqyr_players WHERE id = $1', [playerId]);

        res.json({
            isCorrect,
            correctIndex,
            points,
            totalScore: playerResult.rows[0]?.score || 0
        });
    } catch (err) {
        console.error('Tapqyr answer POST error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

export default router;
