/**
 * Generate content for tools using AI
 */
import { generateToolPrompt } from './toolPrompts';

/**
 * Generate content for a tool
 * @param {string} toolId - Tool ID (lesson-plan, test, essay, etc.)
 * @param {string} topic - Topic
 * @param {string} subjectTitle - Subject title
 * @param {string} grade - Grade level
 * @param {string} language - Language ('kk', 'ru', 'en')
 * @returns {Promise<string>} Generated content
 */
export const generateContent = async (toolId, topic, subjectTitle, grade, language = 'kk', options = {}) => {
    const { questionCount, difficulty, showExplanations, customPrompt, onUpdate } = options;

    const prompt = customPrompt || generateToolPrompt(toolId, topic, subjectTitle, grade, language, {
        questionCount,
        difficulty,
        showExplanations
    });

    const API_BASE = import.meta.env.DEV
        ? 'http://localhost:5000/api'
        : '/.netlify/functions';

    const endpoint = import.meta.env.DEV
        ? '/ai/generate-content'
        : '/generate-content';

    // Get user ID from localStorage
    let userId = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            userId = JSON.parse(userStr).id;
        }
    } catch (e) {
        console.error('Error reading user from localStorage', e);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt,
            toolId,
            topic,
            subjectTitle,
            grade,
            language,
            userId, // Pass userId for subscription check
            responseFormat: toolId === 'test' ? 'json_object' : undefined
        })
    });

    if (!response.ok) {
        let errorMessage = 'AI generation failed';
        try {
            const data = await response.json();
            errorMessage = data.message || errorMessage;
        } catch (e) {
            errorMessage = `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
    }

    // Handle Streaming Response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let resultText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        resultText += chunk;

        // Optional: If you had a callback to update UI in real-time, call it here
        // if (options.onUpdate) options.onUpdate(resultText);
    }

    return resultText;
};
