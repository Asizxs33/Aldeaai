const db = require('./db.cjs');
const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { email, password } = JSON.parse(event.body);
        const normalizedEmail = email.toLowerCase();

        if (!normalizedEmail || !password) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Email and password are required' }) };
        }

        // Check if user exists
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);

        if (userResult.rows.length === 0) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Invalid credentials' }) };
        }

        const user = userResult.rows[0];

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Invalid credentials' }) };
        }

        // Check verification status
        if (!user.email_verified) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Email not verified',
                    email: user.email,
                    requiresVerification: true
                })
            };
        }

        // Return user info (excluding password)
        const userInfo = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: user.created_at,
            subscription_plan: user.subscription_plan || 'free',
            subscription_end_date: user.subscription_end_date
        };

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Logged in successfully', user: userInfo }),
        };

    } catch (err) {
        console.error('Login error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server error: ' + err.message }),
        };
    }
};
