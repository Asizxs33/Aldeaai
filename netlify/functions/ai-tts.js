
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { text, voice } = JSON.parse(event.body);

        if (!text) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Text is required' }),
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

        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: voice || "alloy",
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        // Return audio content
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': buffer.length,
            },
            body: buffer.toString('base64'),
            isBase64Encoded: true,
        };

    } catch (error) {
        console.error('Error generating speech:', error);

        // Safe error serialization
        const errorDetails = {
            message: error.message,
            name: error.name,
            code: error.code, // OpenAI error code
            param: error.param, // OpenAI error param
            type: error.type, // OpenAI error type
        };

        if (error.response) {
            errorDetails.response = error.response.data || error.response;
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error generating speech',
                error: error.message,
                details: errorDetails
            }),
        };
    }
};
