-- Aldea Presentation Database Schema
-- Run this SQL in your Neon dashboard to create the required tables

-- Presentations table
CREATE TABLE IF NOT EXISTS presentations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    topic TEXT,
    template_id VARCHAR(50) NOT NULL,
    language VARCHAR(10) DEFAULT 'kk', -- 'kk', 'ru', 'en'
    slide_count INTEGER NOT NULL,
    slides JSONB NOT NULL, -- Array of {id, title, content, bulletPoints[], imageUrl}
    presentation_type VARCHAR(50), -- 'academic', 'open', 'science', 'educational', 'parent'
    ktp VARCHAR(255), -- KTP reference if selected
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_presentations_user ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_created ON presentations(created_at DESC);
