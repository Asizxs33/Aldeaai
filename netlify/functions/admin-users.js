import db from './db.js';

exports.handler = async (event, context) => {
    const { httpMethod } = event;

    try {
        // GET - List all users
        if (httpMethod === 'GET') {
            // Start with minimal query, only columns that definitely exist
            let result;
            try {
                // Try full query with all columns
                result = await db.query(`
                    SELECT id, email, name, role, created_at 
                    FROM users 
                    ORDER BY created_at DESC
                `);
            } catch (e1) {
                try {
                    // Try without role
                    result = await db.query(`
                        SELECT id, email, name, created_at 
                        FROM users 
                        ORDER BY created_at DESC
                    `);
                    result.rows = result.rows.map(u => ({ ...u, role: 'free' }));
                } catch (e2) {
                    try {
                        // Try without name
                        result = await db.query(`
                            SELECT id, email, role, created_at 
                            FROM users 
                            ORDER BY created_at DESC
                        `);
                        result.rows = result.rows.map(u => ({ ...u, name: null }));
                    } catch (e3) {
                        // Minimal - only id, email, created_at
                        result = await db.query(`
                            SELECT id, email, created_at 
                            FROM users 
                            ORDER BY created_at DESC
                        `);
                        result.rows = result.rows.map(u => ({ ...u, role: 'free', name: null }));
                    }
                }
            }

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: result.rows }),
            };
        }

        // PUT - Update user role
        if (httpMethod === 'PUT') {
            const { userId, role } = JSON.parse(event.body);

            if (!userId || !role) {
                return { statusCode: 400, body: JSON.stringify({ message: 'userId and role are required' }) };
            }

            // Valid roles
            const validRoles = ['free', 'pro', 'ultra', 'moderator', 'admin'];
            if (!validRoles.includes(role.toLowerCase())) {
                return { statusCode: 400, body: JSON.stringify({ message: 'Invalid role' }) };
            }

            await db.query('UPDATE users SET role = $1 WHERE id = $2', [role.toLowerCase(), userId]);

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'User role updated successfully' }),
            };
        }

        // DELETE - Delete user
        if (httpMethod === 'DELETE') {
            const { userId } = JSON.parse(event.body);

            if (!userId) {
                return { statusCode: 400, body: JSON.stringify({ message: 'userId is required' }) };
            }

            await db.query('DELETE FROM users WHERE id = $1', [userId]);

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'User deleted successfully' }),
            };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };

    } catch (err) {
        console.error('Admin users error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server error: ' + err.message }),
        };
    }
};
