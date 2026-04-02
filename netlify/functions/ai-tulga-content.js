
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { topic, character, language } = JSON.parse(event.body);

        if (!topic || !character) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Topic and character are required' }),
            };
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Server configuration error: Missing API Key' }),
            };
        }

        const openai = new OpenAI({ apiKey });
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

        const prompt = `
        You are ${character}. Write a short speech (about 30 seconds spoken) on the topic: "${topic}".
        Language: ${language || 'en'}.
        Tone: Inspiring, wise, and characteristic of ${character}.
        Keep it concise but impactful. Do not include stage directions or "Scene 1" labels. Just the speech text.
        `;

        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: `You are acting as the historical figure ${character}.` },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
        });

        const content = completion.choices[0]?.message?.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ content }),
        };

    } catch (error) {
        console.error('Error generating content:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error generating content', error: error.message }),
        };
    }
};
