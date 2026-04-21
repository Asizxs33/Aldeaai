/**
 * AI Content Generation Service
 * Generate presentation slide content using AI with Edge Function streaming
 */
import { API_BASE as _BASE } from './api';

/**
 * Generate presentation slide content using AI
 * @param {string} topic - The presentation topic
 * @param {number} slideCount - Number of slides to generate
 * @param {string} language - Target language ('kk', 'ru', 'en')
 * @param {string} presentationType - Type of presentation
 * @param {string} ktp - KTP reference (optional)
 * @param {Array<string>} uploadedImages - Array of image data URLs (optional)
 * @returns {Promise<Array>} Array of slide objects
 */
export const generateSlideContent = async (
    topic,
    slideCount,
    language = 'kk',
    presentationType = 'academic',
    ktp = null,
    uploadedImages = []
) => {
    const endpoint = `${_BASE}/api/ai/generate-presentation`;

    let userId = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) userId = JSON.parse(userStr).id;
    } catch (e) {}

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: topic, topic, slideCount, language, presentationType, ktp, userId })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || 'AI generation failed');
    }

    const data = await response.json();
    if (!data.slides || !Array.isArray(data.slides)) throw new Error('Invalid response from server');

    data.slides.forEach((slide, index) => {
        if (uploadedImages[index]) slide.imageUrl = uploadedImages[index];
    });

    return data.slides;
};

/**
 * Generate slides with real-time progress callback using Edge Function streaming
 * @param {Object} options - Generation options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} Array of slide objects
 */
export const generateSlideContentWithProgress = async (options, onProgress) => {
    const { topic, slideCount, language, presentationType, ktp, uploadedImages = [] } = options;
    const endpoint = `${_BASE}/api/ai/generate-presentation`;

    let userId = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) userId = JSON.parse(userStr).id;
    } catch (e) {}

    onProgress?.({ type: 'progress', message: 'Генерация слайдов...', progress: 20 });

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: topic, topic, slideCount, language, presentationType, ktp, userId })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.detail || 'Generation failed');
        }

        onProgress?.({ type: 'progress', message: 'Обработка слайдов...', progress: 80 });
        const data = await response.json();

        if (!data.slides || !Array.isArray(data.slides)) throw new Error('Invalid response');

        data.slides.forEach((slide, index) => {
            if (uploadedImages[index]) slide.imageUrl = uploadedImages[index];
        });

        onProgress?.({ type: 'complete', message: 'Готово!', progress: 100, slides: data.slides });
        return data.slides;
    } catch (error) {
        onProgress?.({ type: 'error', message: error.message, progress: 0 });
        throw error;
    }
};
