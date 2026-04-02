const db = require('./db.cjs');
const bcrypt = require('bcryptjs');
const { sendVerificationEmail } = require('./email-service');

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { email, password, name } = JSON.parse(event.body);
        const normalizedEmail = email.toLowerCase();

        if (!normalizedEmail || !password) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Email and password are required' }) };
        }

        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        if (userCheck.rows.length > 0) {
            return { statusCode: 400, body: JSON.stringify({ message: 'User already exists' }) };
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification code
        const verificationCode = generateCode();

        // Insert user
        let newUser;
        if (name) {
            newUser = await db.query(
                'INSERT INTO users (email, password, name, verification_code, email_verified) VALUES ($1, $2, $3, $4, FALSE) RETURNING id, email, name, created_at',
                [normalizedEmail, hashedPassword, name, verificationCode]
            );
        } else {
            newUser = await db.query(
                'INSERT INTO users (email, password, verification_code, email_verified) VALUES ($1, $2, $3, FALSE) RETURNING id, email, created_at',
                [normalizedEmail, hashedPassword, verificationCode]
            );
        }

        // Send verification email
        await sendVerificationEmail(normalizedEmail, verificationCode);

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'User registered successfully. Please verify your email.', email: normalizedEmail }),
        };

    } catch (err) {
        console.error('Registration error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server error: ' + err.message }),
        };
    }
};
