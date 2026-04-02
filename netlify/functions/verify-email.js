const db = require('./db.cjs');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { email, code } = JSON.parse(event.body);
        const normalizedEmail = email.toLowerCase();

        if (!normalizedEmail || !code) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Email and code are required' }) };
        }

        // Check if code matches
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);

        if (userResult.rows.length === 0) {
            return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }) };
        }

        const user = userResult.rows[0];

        if (user.verification_code === code) {
            // Update user as verified
            await db.query('UPDATE users SET email_verified = TRUE, verification_code = NULL WHERE email = $1', [email]);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Email verified successfully' })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid verification code' })
            };
        }

    } catch (err) {
        console.error('Verification error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server error: ' + err.message })
        };
    }
};
