// SSE Streaming endpoint for real-time presentation generation
const { OpenAI } = require('openai');

exports.handler = async (event, context) => {
    // CORS headers for SSE
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'API key not configured' })
        };
    }

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch (e) {
        return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid JSON' })
        };
    }

    const { prompt, slideCount = 8, language = 'ru', presentationType = 'academic', ktp } = body;

    if (!prompt) {
        return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Prompt required' })
        };
    }

    try {
        const openai = new OpenAI({ apiKey });
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

        const languageNames = { kk: 'казахском', ru: 'русском', en: 'английском' };
        const langName = languageNames[language] || 'русском';

        const systemPrompt = `Ты педагог-методист. Создаёшь ДЕТАЛЬНЫЕ презентации. Возвращай ТОЛЬКО JSON: {"slides":[...]}
Каждый слайд: {id, title (5-10 слов), content (100+ слов, 3-5 предложений), bulletPoints (5-7 пунктов), layout, imagePrompt}
Layouts: title, split_right, split_left, grid, quote, timeline, stats. ЧЕРЕДУЙ их!`;

        const userPrompt = `Тема: "${prompt}" | Язык: ${langName} | Тип: ${presentationType} | Слайдов: ${slideCount}
${ktp ? `КТП: ${ktp}` : ''}
Слайд 1: title. Слайды 2-${Math.floor(slideCount / 2)}: split_right/grid. Слайды ${Math.floor(slideCount / 2) + 1}-${slideCount - 1}: timeline/stats/quote. Слайд ${slideCount}: grid.
content: 100+ слов. bulletPoints: 5-7 развёрнутых пунктов. ТОЛЬКО JSON!`;

        // Stream the response
        const stream = await openai.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 6000,
            response_format: { type: 'json_object' },
            stream: true
        });

        // Build SSE response chunks
        let chunks = [];
        let fullContent = '';
        let chunkIndex = 0;

        // Send initial event
        chunks.push(`data: ${JSON.stringify({ type: 'start', message: 'Генерация началась...' })}\n\n`);

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullContent += content;
                chunkIndex++;

                // Send progress every 10 chunks
                if (chunkIndex % 10 === 0) {
                    chunks.push(`data: ${JSON.stringify({ type: 'progress', chunk: chunkIndex, partial: fullContent.length })}\n\n`);
                }
            }
        }

        // Parse final JSON
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(fullContent);
        } catch (parseError) {
            const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedResponse = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Invalid JSON');
            }
        }

        let slides = parsedResponse.slides || parsedResponse;
        if (!Array.isArray(slides)) slides = [slides];

        // Add images to slides
        slides = slides.map((slide, idx) => {
            const imgPrompt = slide.imagePrompt || slide.title || prompt;
            const seed = Math.floor(Math.random() * 10000);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent((imgPrompt + ', professional, modern, high quality').substring(0, 400))}?width=800&height=600&nologo=true&seed=${seed}`;

            return {
                id: slide.id || idx + 1,
                title: slide.title || `Слайд ${idx + 1}`,
                content: slide.content || '',
                bulletPoints: Array.isArray(slide.bulletPoints) ? slide.bulletPoints : [],
                imageUrl,
                imagePrompt: imgPrompt,
                layout: slide.layout || (idx === 0 ? 'title' : 'split_right'),
                designTheme: 'dark'
            };
        });

        // Send final result
        chunks.push(`data: ${JSON.stringify({ type: 'complete', slides })}\n\n`);
        chunks.push(`data: [DONE]\n\n`);

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            },
            body: chunks.join('')
        };

    } catch (err) {
        console.error('Stream error:', err);
        return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: err.message || 'Generation failed' })
        };
    }
};
