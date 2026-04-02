import { OpenAI } from 'openai';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'text/plain; charset=utf-8' // Standard for streams
};

export default async (request, context) => {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
    }

    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ message: 'OpenAI API key not configured' }), {
                status: 500,
                headers: { ...headers, 'Content-Type': 'application/json' }
            });
        }

        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            return new Response(JSON.stringify({ message: 'Invalid JSON in request body' }), {
                status: 400,
                headers: { ...headers, 'Content-Type': 'application/json' }
            });
        }

        const { prompt, userId, toolId, responseFormat } = body;

        if (!prompt) {
            return new Response(JSON.stringify({ message: 'Prompt is required' }), {
                status: 400,
                headers: { ...headers, 'Content-Type': 'application/json' }
            });
        }

        console.log(`Starting stream generation for tool: ${toolId}, user: ${userId}`);

        // Initialize OpenAI client
        const openai = new OpenAI({ apiKey });

        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        // Max tokens - use higher limit for KMJ (lesson plans need full table generation)
        const isKMJ = toolId === 'kmj';
        const maxTokens = isKMJ ? 16000 : 6000;

        // Create a ReadableStream
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Call OpenAI API with stream: true
                    const completion = await openai.chat.completions.create({
                        model: model,
                        messages: [
                            {
                                role: 'system',
                                content: responseFormat === 'json_object'
                                    ? 'Ты - полезный AI-ассистент. Отвечай строго в формате JSON.'
                                    : 'Ты - полезный AI-ассистент. Для ҚМЖ создавай только HTML таблицу.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: isKMJ ? 0.5 : 0.7,
                        max_tokens: maxTokens,
                        stream: true, // Enable streaming
                        response_format: responseFormat === 'json_object' ? { type: 'json_object' } : undefined
                    });

                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            const encoder = new TextEncoder();
                            controller.enqueue(encoder.encode(content));
                        }
                    }

                    controller.close();
                } catch (error) {
                    console.error('Streaming error:', error);
                    const encoder = new TextEncoder();
                    controller.enqueue(encoder.encode(`\n\n[ERROR: ${error.message}]`));
                    controller.close();
                }
            }
        });

        // Return the Response with the stream
        return new Response(stream, {
            status: 200,
            headers: {
                ...headers,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });

    } catch (err) {
        console.error('Hander error:', err);
        return new Response(JSON.stringify({ message: `Server error: ${err.message}` }), {
            status: 500,
            headers: { ...headers, 'Content-Type': 'application/json' }
        });
    }
};
