import express from 'express';
import bcrypt from 'bcrypt';
import * as db from '../db.js';

const router = express.Router();

// Register Endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const newUser = await db.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
            [email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// Login Endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({ message: 'Logged in successfully', user: { id: user.rows[0].id, email: user.rows[0].email } });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

export default router;
