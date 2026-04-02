const db = require('./db.cjs');
const { sendVerificationEmail } = require('./email-service');

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { email } = JSON.parse(event.body);
        const normalizedEmail = email ? email.toLowerCase() : '';

        if (!normalizedEmail) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Email is required' }) };
        }

        // Check if user exists
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);

        if (userResult.rows.length === 0) {
            return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }) };
        }

        const user = userResult.rows[0];

        if (user.email_verified) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Email is already verified' }) };
        }

        // Generate new code
        const newCode = generateCode();

        // Update code in database
        await db.query('UPDATE users SET verification_code = $1 WHERE email = $2', [newCode, normalizedEmail]);

        // Send email
        const sent = await sendVerificationEmail(normalizedEmail, newCode);

        if (sent) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Verification code resent successfully' })
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Failed to send verification email' })
            };
        }

    } catch (err) {
        console.error('Resend code error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server error: ' + err.message })
        };
    }
};
