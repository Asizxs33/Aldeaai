-- Aldea Tapqyr Database Schema
-- Run this SQL in your Neon dashboard to create the required tables

-- Quizzes table
CREATE TABLE IF NOT EXISTS tapqyr_quizzes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    questions JSONB NOT NULL, -- Array of {question, answers[], correctIndex, timeLimit}
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS tapqyr_sessions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(6) UNIQUE NOT NULL,
    quiz_id INTEGER REFERENCES tapqyr_quizzes(id) ON DELETE CASCADE,
    host_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'waiting', -- waiting, playing, finished
    current_question INTEGER DEFAULT -1,
    game_state JSONB DEFAULT '{}', -- {showAnswer: boolean, etc}
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    finished_at TIMESTAMP
);

-- Players table (for each game session)
CREATE TABLE IF NOT EXISTS tapqyr_players (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES tapqyr_sessions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(500),
    score INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT NOW()
);

-- Answers table (track each answer)
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_code ON tapqyr_sessions(code);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON tapqyr_sessions(status);
CREATE INDEX IF NOT EXISTS idx_players_session ON tapqyr_players(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_session ON tapqyr_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user ON tapqyr_quizzes(user_id);

-- Clean up old finished sessions (run periodically)
-- DELETE FROM tapqyr_sessions WHERE status = 'finished' AND finished_at < NOW() - INTERVAL '24 hours';
