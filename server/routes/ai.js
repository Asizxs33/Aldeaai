import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI client
const getOpenAIClient = () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
    }
    return new OpenAI({ apiKey });
};

// POST /ai/generate-presentation
router.post('/ai/generate-presentation', async (req, res) => {
    try {
        const { prompt, slideCount, language } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        const openai = getOpenAIClient();

        // Use gpt-4o-mini for cost efficiency (can be changed to gpt-4o for better quality)
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: 'Ты - опытный педагог и методист. Твоя задача - создавать профессиональные презентации для образовательных целей. Всегда возвращай только валидный JSON массив, без дополнительного текста.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
        });

        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) {
            throw new Error('No response from OpenAI');
        }

        // Parse JSON response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(responseContent);
        } catch (parseError) {
            // If response is not JSON object, try to extract JSON array directly
            const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                parsedResponse = { slides: JSON.parse(jsonMatch[0]) };
            } else {
                throw new Error('Invalid JSON response from AI');
            }
        }

        // Extract slides array (handle both {slides: [...]} and direct array)
        let slides = parsedResponse.slides || parsedResponse;
        if (!Array.isArray(slides)) {
            slides = [slides];
        }

        // Ensure all slides have required fields
        slides = slides.map((slide, index) => ({
            id: slide.id || index + 1,
            title: slide.title || `Слайд ${index + 1}`,
            content: slide.content || '',
            bulletPoints: Array.isArray(slide.bulletPoints) ? slide.bulletPoints : [],
            imageUrl: slide.imageUrl || null
        }));

        res.json({ slides });
    } catch (err) {
        console.error('Presentation generation error:', err);
        let errorMessage = 'Internal server error';
        if (err && typeof err === 'object') {
            errorMessage = err.message || err.detail || err.code || 'AI generation error';
        } else if (err) {
            errorMessage = String(err);
        }
        res.status(500).json({ message: 'Server error: ' + errorMessage });
    }
});

// POST /ai/generate-content
router.post('/ai/generate-content', async (req, res) => {
    try {
        const { prompt, toolId, topic, subjectTitle, grade, language, responseFormat } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        const openai = getOpenAIClient();

        // Use gpt-4o-mini for cost efficiency
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const maxTokens = 4000; // Increased for better test generation

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Call OpenAI API with stream: true
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: responseFormat === 'json_object'
                        ? 'Ты - полезный AI-ассистент. Отвечай строго в формате JSON.'
                        : 'Ты - полезный AI-ассистент. Для ҚМЖ создавай только HTML таблицу. Для остальных инструментов используй понятную структуру.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: maxTokens,
            stream: true,
            response_format: responseFormat === 'json_object' ? { type: 'json_object' } : undefined
        });

        // Stream the response back to client
        for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(content);
            }
        }

        res.end();
    } catch (err) {
        console.error('Content generation error:', err);
        // If headers already sent, we can't send a JSON error
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error: ' + (err.message || String(err)) });
        } else {
            res.write(`\n\n[ERROR: ${err.message}]`);
            res.end();
        }
    }
});

// POST /ai/tts
router.post('/ai/tts', async (req, res) => {
    try {
        const { text, voice } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Text is required' });
        }

        const openai = getOpenAIClient();

        // Call OpenAI API for TTS
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: voice || "alloy",
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        // Set headers for audio file
        res.set('Content-Type', 'audio/mpeg');
        res.set('Content-Length', buffer.length);

        // Return audio buffer
        res.send(buffer);

    } catch (err) {
        console.error('TTS generation error:', err);
        let errorMessage = 'Internal server error';
        if (err && typeof err === 'object') {
            errorMessage = err.message || err.detail || err.code || 'AI generation error';
        } else if (err) {
            errorMessage = String(err);
        }
        res.status(500).json({ message: 'Server error: ' + errorMessage });
    }
});

export default router;
