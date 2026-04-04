import { API_BASE as _BASE } from './api';
const API_BASE = `${_BASE}/api`;

export const presentationApi = {
    // Get all presentations for a user
    getAll: async (userId) => {
        const res = await fetch(`${API_BASE}/presentation-api?userId=${userId}`);
        if (!res.ok) {
            throw new Error('Failed to fetch presentations');
        }
        return res.json();
    },

    // Get a specific presentation
    getById: async (id) => {
        const res = await fetch(`${API_BASE}/presentation-api/${id}`);
        if (!res.ok) {
            throw new Error('Failed to fetch presentation');
        }
        return res.json();
    },

    // Create a new presentation
    create: async (presentationData) => {
        const res = await fetch(`${API_BASE}/presentation-api`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(presentationData)
        });
        if (!res.ok) {
            let errorMessage = 'Failed to create presentation';
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

    // Update a presentation
    update: async (id, presentationData) => {
        const res = await fetch(`${API_BASE}/presentation-api/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(presentationData)
        });
        if (!res.ok) {
            let errorMessage = 'Failed to update presentation';
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

    // Delete a presentation
    delete: async (id) => {
        const res = await fetch(`${API_BASE}/presentation-api/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            throw new Error('Failed to delete presentation');
        }
        return res.json();
    }
};
