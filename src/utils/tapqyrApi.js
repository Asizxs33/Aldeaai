// API utility for Aldea Tapqyr
import { API_BASE as _BASE } from './api';
const API_BASE = `${_BASE}/api`;

// ==================== QUIZZES ====================
export const quizzesApi = {
    // Get all quizzes for a user
    getAll: async (userId) => {
        const res = await fetch(`${API_BASE}/tapqyr-quizzes?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch quizzes');
        return res.json();
    },

    // Get single quiz
    get: async (id) => {
        const res = await fetch(`${API_BASE}/tapqyr-quizzes/${id}`);
        if (!res.ok) throw new Error('Quiz not found');
        return res.json();
    },

    // Create quiz
    create: async (userId, title, questions) => {
        const res = await fetch(`${API_BASE}/tapqyr-quizzes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, title, questions })
        });
        if (!res.ok) throw new Error('Failed to create quiz');
        return res.json();
    },

    // Update quiz
    update: async (id, data) => {
        const res = await fetch(`${API_BASE}/tapqyr-quizzes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update quiz');
        return res.json();
    },

    // Delete quiz
    delete: async (id) => {
        const res = await fetch(`${API_BASE}/tapqyr-quizzes/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete quiz');
        return res.json();
    }
};

// ==================== SESSIONS ====================
export const sessionsApi = {
    // Create new game session
    create: async (quizId, hostId) => {
        const res = await fetch(`${API_BASE}/tapqyr-sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quizId, hostId })
        });
        if (!res.ok) throw new Error('Failed to create session');
        return res.json();
    },

    // Get session by code
    get: async (code) => {
        const res = await fetch(`${API_BASE}/tapqyr-sessions/${code}`);
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Failed to fetch session');
        }
        return res.json();
    },

    // Update session (start, next question, show answer, finish)
    update: async (code, action, data = {}) => {
        const res = await fetch(`${API_BASE}/tapqyr-sessions/${code}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, data })
        });
        if (!res.ok) throw new Error('Failed to update session');
        return res.json();
    },

    // Delete session
    delete: async (code) => {
        const res = await fetch(`${API_BASE}/tapqyr-sessions/${code}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};

// ==================== PLAYERS ====================
export const playersApi = {
    // Join game
    join: async (code, name) => {
        const res = await fetch(`${API_BASE}/tapqyr-players`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, name })
        });
        if (!res.ok) {
            let errorMessage = 'Failed to join game';
            try {
                const data = await res.json();
                errorMessage = data.message || errorMessage;
            } catch (e) {
                errorMessage = `Server error: ${res.status} ${res.statusText}`;
            }
            throw new Error(errorMessage);
        }
        return res.json();
    },

    // Poll game state (for real-time updates)
    poll: async (code, playerId = null) => {
        const url = playerId 
            ? `${API_BASE}/tapqyr-players/${code}?playerId=${playerId}`
            : `${API_BASE}/tapqyr-players/${code}`;
        const res = await fetch(url);
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Failed to poll game state');
        }
        return res.json();
    }
};

// ==================== ANSWERS ====================
export const answersApi = {
    // Submit answer
    submit: async (code, playerId, questionIndex, answerIndex, timeLeft, maxTime) => {
        const res = await fetch(`${API_BASE}/tapqyr-answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, playerId, questionIndex, answerIndex, timeLeft, maxTime })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to submit answer');
        return data;
    }
};

// ==================== POLLING HOOK ====================
export const createPoller = (code, playerId, onUpdate, interval = 1000) => {
    let active = true;
    let timeoutId = null;

    const poll = async () => {
        if (!active) return;
        
        try {
            const data = await playersApi.poll(code, playerId);
            if (active && data) {
                onUpdate(data);
            }
        } catch (err) {
            console.error('Poll error:', err);
        }
        
        if (active) {
            timeoutId = setTimeout(poll, interval);
        }
    };

    poll();

    return () => {
        active = false;
        if (timeoutId) clearTimeout(timeoutId);
    };
};
