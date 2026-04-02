import db from './db.js';

exports.handler = async (event, context) => {
    // Only allow GET
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Get total users count
        const usersResult = await db.query('SELECT COUNT(*) as total FROM users');
        const totalUsers = parseInt(usersResult.rows[0].total);

        // Get users by role (handle missing role column)
        let roleStats = { free: totalUsers };
        try {
            const rolesResult = await db.query(`
                SELECT role, COUNT(*) as count 
                FROM users 
                GROUP BY role
            `);
            roleStats = {};
            rolesResult.rows.forEach(row => {
                roleStats[row.role || 'free'] = parseInt(row.count);
            });
        } catch (e) {
            // role column doesn't exist, all users are 'free'
            roleStats = { free: totalUsers };
        }

        // Get users registered this month
        const monthlyResult = await db.query(`
            SELECT COUNT(*) as count 
            FROM users 
            WHERE created_at >= date_trunc('month', CURRENT_DATE)
        `);
        const newUsersThisMonth = parseInt(monthlyResult.rows[0].count);

        // Get users registered today
        const dailyResult = await db.query(`
            SELECT COUNT(*) as count 
            FROM users 
            WHERE created_at >= CURRENT_DATE
        `);
        const newUsersToday = parseInt(dailyResult.rows[0].count);

        // Get recent registrations (last 7 days chart data)
        const weeklyResult = await db.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM users
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY date
        `);
        const weeklyStats = weeklyResult.rows.map(row => ({
            date: row.date,
            count: parseInt(row.count)
        }));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                totalUsers,
                roleStats,
                newUsersThisMonth,
                newUsersToday,
                weeklyStats
            }),
        };

    } catch (err) {
        console.error('Admin stats error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server error: ' + err.message }),
        };
    }
};
