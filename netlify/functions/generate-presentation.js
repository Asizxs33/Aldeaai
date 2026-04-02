import { OpenAI } from 'openai';

// Ultra-optimized for Netlify Free tier (10 second limit)
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

export const handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const startTime = Date.now();

    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) };
        }

        const body = JSON.parse(event.body || '{}');
        const { prompt, slideCount = 6, language = 'ru' } = body;

        if (!prompt) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Prompt required' }) };
        }

        // Limit slides for speed
        const maxSlides = Math.min(slideCount, 8);
        const langMap = { kk: 'қазақ', ru: 'русский', en: 'English' };
        const lang = langMap[language] || 'русский';

        const openai = new OpenAI({
            apiKey,
            timeout: 8000 // 8 second timeout to leave buffer
        });

        // ULTRA-MINIMAL prompt for fastest response
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: 'Ты профессиональный дизайнер презентаций. Твоя цель - визуальное разнообразие. Возвращай JSON. ВАЖНО: Строго соблюдай порядок макетов для разнообразия: Слайд 1: title. Слайд 2: timeline. Слайд 3: split_right. Слайд 4: grid. Слайд 5: stats. Слайд 6+: чередовать. Каждый слайд: id, title (до 5-6 слов), content (ОЧЕНЬ КРАТКО, 20-30 слов), bulletPoints (массив строк), imageSearchTerm (2-3 конкретных существительных на английском, например "microscope, pencil", никаких "education"!), layout.'
                },
                {
                    role: 'user',
                    content: `Тема: ${prompt}. Слайдов: ${slideCount}. Язык: ${language}. Тип: ${presentationType}. Верни JSON {slides: [...]}.`
                }
            ],
            temperature: 0.7,
            max_tokens: 2800,
            response_format: { type: 'json_object' }
        });

        console.log(`OpenAI response in ${Date.now() - startTime}ms`);

        const responseContent = completion.choices[0].message.content;
        const parsed = JSON.parse(responseContent);
        let slides = parsed.slides || parsed;

        if (!Array.isArray(slides)) slides = [slides];

        // Add images using LoremFlickr (real photos)
        slides = slides.map((s, i) => {
            let searchTerms = s.imageSearchTerm || s.title || prompt;
            // Clean up: english letters only + comma
            searchTerms = searchTerms.replace(/[^\w\s,]/g, '').replace(/\s+/g, ',').split(',').filter(t => t.length > 2).slice(0, 3).join(',');

            return {
                ...s,
                id: s.id || i + 1,
                layout: s.layout || 'split_right',
                imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(searchTerms + ' ' + (s.imageSearchTerm || ''))}?width=800&height=600&nologo=true`
            };
        });

        console.log(`Total time: ${Date.now() - startTime}ms`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ slides, success: true, time: Date.now() - startTime })
        };

    } catch (err) {
        console.error('Error:', err.message, `Time: ${Date.now() - startTime}ms`);

        let msg = 'Ошибка генерации';
        if (err.message?.includes('timeout') || err.code === 'ETIMEDOUT') {
            msg = 'Таймаут. Попробуйте уменьшить количество слайдов до 5-6.';
        } else if (err.status === 429) {
            msg = 'Слишком много запросов. Подождите.';
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: msg, success: false })
        };
    }
};
