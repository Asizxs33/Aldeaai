/**
 * AI Content Generation Service
 * Generate presentation slide content using AI with Edge Function streaming
 */

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
    // Try Edge Function streaming first (30s timeout), then fallback to regular function
    const streamEndpoint = '/api/generate-presentation-stream';
    const regularEndpoint = import.meta.env.DEV
        ? 'http://localhost:5000/api/ai/generate-presentation'
        : '/.netlify/functions/generate-presentation';

    // Get userId for subscription check
    let userId = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            userId = JSON.parse(userStr).id;
        }
    } catch (e) {
        console.error('Error reading user from localStorage', e);
    }

    const requestBody = {
        prompt: topic,
        topic,
        slideCount,
        language,
        presentationType,
        ktp,
        userId
    };

    // Try Edge Function with streaming first
    if (!import.meta.env.DEV) {
        try {
            const response = await fetch(streamEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const text = await response.text();
                const lines = text.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') break;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.type === 'complete' && parsed.slides) {
                                const slides = parsed.slides;
                                // Add uploaded images
                                slides.forEach((slide, index) => {
                                    if (uploadedImages[index]) {
                                        slide.imageUrl = uploadedImages[index];
                                    }
                                });
                                return slides;
                            } else if (parsed.type === 'error') {
                                throw new Error(parsed.message);
                            }
                        } catch (e) {
                            if (e.message && !e.message.includes('JSON')) {
                                throw e;
                            }
                        }
                    }
                }
            }
        } catch (streamError) {
            console.log('Edge streaming failed, trying regular function:', streamError.message);
        }
    }

    // Fallback to regular serverless function
    const response = await fetch(regularEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'AI generation failed');
    }

    const data = await response.json();

    if (!data.slides || !Array.isArray(data.slides)) {
        throw new Error('Invalid response from server');
    }

    // Add uploaded images to slides
    data.slides.forEach((slide, index) => {
        if (uploadedImages[index]) {
            slide.imageUrl = uploadedImages[index];
        }
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

    const streamEndpoint = '/api/generate-presentation-stream';
    const regularEndpoint = import.meta.env.DEV
        ? 'http://localhost:5000/api/ai/generate-presentation'
        : '/.netlify/functions/generate-presentation';

    let userId = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) userId = JSON.parse(userStr).id;
    } catch (e) { }

    onProgress?.({ type: 'start', message: 'Запуск генерации...', progress: 5 });

    const requestBody = {
        prompt: topic,
        topic,
        slideCount,
        language,
        presentationType,
        ktp,
        userId
    };

    // Try Edge Function streaming in production
    if (!import.meta.env.DEV) {
        try {
            onProgress?.({ type: 'progress', message: 'Подключение к AI...', progress: 10 });

            const response = await fetch(streamEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (response.ok && response.body) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep incomplete line in buffer

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;

                            try {
                                const parsed = JSON.parse(data);

                                if (parsed.type === 'start') {
                                    onProgress?.({ type: 'start', message: parsed.message, progress: 15 });
                                } else if (parsed.type === 'progress') {
                                    onProgress?.({
                                        type: 'progress',
                                        message: `Генерация контента... (${parsed.progress}%)`,
                                        progress: parsed.progress
                                    });
                                } else if (parsed.type === 'complete' && parsed.slides) {
                                    const slides = parsed.slides;
                                    slides.forEach((slide, index) => {
                                        if (uploadedImages[index]) {
                                            slide.imageUrl = uploadedImages[index];
                                        }
                                    });
                                    onProgress?.({ type: 'complete', message: 'Готово!', progress: 100, slides });
                                    return slides;
                                } else if (parsed.type === 'error') {
                                    throw new Error(parsed.message);
                                }
                            } catch (e) {
                                if (e.message && !e.message.includes('JSON')) {
                                    throw e;
                                }
                            }
                        }
                    }
                }
            }
        } catch (streamError) {
            console.log('Edge streaming failed:', streamError.message);
            onProgress?.({ type: 'progress', message: 'Переключение на резервный сервер...', progress: 20 });
        }
    }

    // Fallback to regular function
    onProgress?.({ type: 'progress', message: 'Генерация слайдов...', progress: 30 });

    try {
        const response = await fetch(regularEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Generation failed');
        }

        const data = await response.json();

        if (!data.slides || !Array.isArray(data.slides)) {
            throw new Error('Invalid response');
        }

        data.slides.forEach((slide, index) => {
            if (uploadedImages[index]) {
                slide.imageUrl = uploadedImages[index];
            }
        });

        onProgress?.({ type: 'complete', message: 'Готово!', progress: 100, slides: data.slides });
        return data.slides;
    } catch (error) {
        onProgress?.({ type: 'error', message: error.message, progress: 0 });
        throw error;
    }
};
