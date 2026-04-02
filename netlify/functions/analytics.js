import db from './db.js';

export const handler = async (event, context) => {
    const { httpMethod } = event;

    try {
        // POST - Log an analytics event
        if (httpMethod === 'POST') {
            const { userId, eventType, eventData } = JSON.parse(event.body);

            if (!eventType) {
                return { statusCode: 400, body: JSON.stringify({ message: 'eventType is required' }) };
            }

            await db.query(
                'INSERT INTO analytics_events (user_id, event_type, event_data) VALUES ($1, $2, $3)',
                [userId || null, eventType, eventData ? JSON.stringify(eventData) : null]
            );

            return {
                statusCode: 201,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Event logged' }),
            };
        }

        // GET - Get analytics summary
        if (httpMethod === 'GET') {
            // Total events by type
            const eventsByType = await db.query(`
                SELECT event_type, COUNT(*) as count
                FROM analytics_events
                GROUP BY event_type
                ORDER BY count DESC
            `);

            // Events today
            const eventsToday = await db.query(`
                SELECT event_type, COUNT(*) as count
                FROM analytics_events
                WHERE created_at >= CURRENT_DATE
                GROUP BY event_type
            `);

            // Events this week (by day)
            const weeklyEvents = await db.query(`
                SELECT DATE(created_at) as date, event_type, COUNT(*) as count
                FROM analytics_events
                WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY DATE(created_at), event_type
                ORDER BY date
            `);

            // Total unique users
            const uniqueUsers = await db.query(`
                SELECT COUNT(DISTINCT user_id) as count
                FROM analytics_events
                WHERE user_id IS NOT NULL
            `);

            // Most active users - try/catch just for this complex query
            let topUsers = { rows: [] };
            try {
                topUsers = await db.query(`
                    SELECT u.email, u.name, COUNT(a.id) as event_count
                    FROM analytics_events a
                    JOIN users u ON a.user_id = u.id
                    GROUP BY u.id, u.email, u.name
                    ORDER BY event_count DESC
                    LIMIT 10
                `);
            } catch (e) {
                console.error("Top users query failed:", e);
                // Fallback query without users table join if needed
                try {
                    topUsers = await db.query(`
                        SELECT user_id as email, COUNT(id) as event_count
                        FROM analytics_events
                        WHERE user_id IS NOT NULL
                        GROUP BY user_id
                        ORDER BY event_count DESC
                        LIMIT 10
                    `);
                } catch (e2) {
                    console.error("Fallback top users query failed:", e2);
                }
            }

            // Total counts
            const totalEvents = await db.query('SELECT COUNT(*) as total FROM analytics_events');

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    totalEvents: parseInt(totalEvents.rows[0]?.total || 0),
                    uniqueActiveUsers: parseInt(uniqueUsers.rows[0]?.count || 0),
                    eventsByType: eventsByType.rows.reduce((acc, row) => {
                        acc[row.event_type] = parseInt(row.count);
                        return acc;
                    }, {}),
                    eventsToday: eventsToday.rows.reduce((acc, row) => {
                        acc[row.event_type] = parseInt(row.count);
                        return acc;
                    }, {}),
                    weeklyEvents: weeklyEvents.rows.map(row => ({
                        date: row.date,
                        type: row.event_type,
                        count: parseInt(row.count)
                    })),
                    topUsers: topUsers.rows.map(row => ({
                        email: row.email,
                        name: row.name,
                        events: parseInt(row.event_count)
                    }))
                }),
            };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };

    } catch (err) {
        // Detailed error logging
        console.error('Analytics Endpoint Error:', err);
        console.error('Event Body:', event.body);
        console.error('HTTP Method:', event.httpMethod);

        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' }, // Ensure JSON header on error
            body: JSON.stringify({
                message: 'Server error: ' + err.message,
                stack: err.stack // Optional: helper for debugging
            }),
        };
    }
};
