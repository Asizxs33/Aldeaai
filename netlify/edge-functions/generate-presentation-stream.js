// Netlify Edge Function with TRUE SSE Streaming
// Edge functions support streaming and have 30s timeout

export default async (request, context) => {
    // Handle CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    let body;
    try {
        body = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    const { prompt, slideCount = 10, language = 'ru', presentationType = 'academic' } = body;

    if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    const langMap = { kk: 'казахском', ru: 'русском', en: 'английском' };
    const lang = langMap[language] || 'русском';

    // Detailed prompt for high-quality content
    const systemPrompt = `Ты профессиональный дизайнер презентаций. Твоя цель - визуальное разнообразие.
Возвращай JSON: {"slides":[...]}
ВАЖНО: Строго соблюдай порядок макетов для разнообразия:
Слайд 1: title (Заголовок)
Слайд 2: timeline (Этапы/История) - минимум 3 этапа
Слайд 3: split_right (Текст + Картинка)
Слайд 4: grid (Сетка карточек) - минимум 4 карточки
Слайд 5: stats (Цифры/Факты) - минимум 3 цифры
Слайд 6: quote (Цитата)
Слайд 7+: чередовать split_left, grid, stats.
 
Каждый слайд: {
  id, 
  title (до 5-6 слов), 
  content (ОЧЕНЬ КРАТКО, 20-30 слов, без воды), 
  bulletPoints (Массив строк. Для timeline/stats/grid - обязательно 3-4 пункта), 
  imageSearchTerm (2-3 КОНКРЕТНЫХ существительных на английском, например "microscope, pencil, DNA", никаких "education"!),
  layout (один из: title, split_right, split_left, grid, quote, timeline, stats)
}`;

    const userPrompt = `Создай ${slideCount} профессиональных слайдов на тему "${prompt}" на ${lang} языке. Тип: ${presentationType}.
- content: максимум 2-3 предложения
- bulletPoints: короткие тезисы
- imageSearchTerm: english tags
Только JSON!`;

    // Create a TransformStream for SSE
    const encoder = new TextEncoder();

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start streaming response immediately
    const response = new Response(stream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        }
    });

    // Process in background
    (async () => {
        try {
            // Send start event
            await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'start', message: 'Генерация структуры...' })}\n\n`));

            // Call OpenAI with streaming
            const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 6000,
                    stream: true
                })
            });

            if (!openaiResponse.ok) {
                throw new Error(`OpenAI error: ${openaiResponse.status}`);
            }

            const reader = openaiResponse.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';
            let chunkCount = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            if (content) {
                                fullContent += content;
                                chunkCount++;

                                // Send progress every 20 chunks
                                if (chunkCount % 20 === 0) {
                                    const progress = Math.min(90, Math.floor(chunkCount / 2));
                                    await writer.write(encoder.encode(
                                        `data: ${JSON.stringify({ type: 'progress', progress, chars: fullContent.length })}\n\n`
                                    ));
                                }
                            }
                        } catch (e) {
                            // Skip parse errors
                        }
                    }
                }
            }

            // Parse final JSON
            let slides = [];
            try {
                const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    slides = parsed.slides || parsed;
                    if (!Array.isArray(slides)) slides = [slides];
                }
            } catch (e) {
                console.error('JSON parse error:', e);
            }

            // Add images using LoremFlickr (real photos)
            slides = slides.map((s, i) => {
                // Use English keywords
                let searchTerms = s.imageSearchTerm || s.title || 'education';
                // Clean up terms: replace spaces with commas if not present, take first 3 words
                searchTerms = searchTerms.replace(/[^\w\s,]/g, '').replace(/\s+/g, ',').split(',').filter(t => t.length > 2).slice(0, 3).join(',');

                return {
                    id: s.id || i + 1,
                    title: s.title || `Слайд ${i + 1}`,
                    content: s.content || '',
                    bulletPoints: Array.isArray(s.bulletPoints) ? s.bulletPoints : [],
                    // Back to LoremFlickr for stability
                    // Using specific keywords + random param to ensure variety
                    imageUrl: `https://loremflickr.com/800/600/${encodeURIComponent(searchTerms)}?random=${Math.floor(Math.random() * 99999)}`,
                    imagePrompt: s.imageSearchTerm || s.title,
                    layout: s.layout || (i === 0 ? 'title' : 'split_right'),
                    designTheme: 'dark'
                };
            });

            // Send final result
            await writer.write(encoder.encode(
                `data: ${JSON.stringify({ type: 'complete', slides, progress: 100 })}\n\n`
            ));
            await writer.write(encoder.encode('data: [DONE]\n\n'));

        } catch (error) {
            console.error('Stream error:', error);
            await writer.write(encoder.encode(
                `data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`
            ));
        } finally {
            await writer.close();
        }
    })();

    return response;
};

export const config = {
    path: '/api/generate-presentation-stream'
};
