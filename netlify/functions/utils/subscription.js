const db = require('../db');

const PLANS = {
    free: { dailyLimit: 5, name: 'Free' },
    pro: { dailyLimit: 5, name: 'Pro' },
    ultra: { dailyLimit: 15, name: 'Ultra' },
    moderator: { dailyLimit: 1000, name: 'Moderator' },
    admin: { dailyLimit: 10000, name: 'Admin' }
};

// Returns { allowed: boolean, message: string, plan: string, usage: number, limit: number }
exports.checkSubscriptionLimit = async (userId, toolId) => {
    try {
        if (!userId) {
            return { allowed: false, message: 'User ID required' };
        }

        const res = await db.query('SELECT role, subscription_plan, daily_generations_count, last_generation_date, created_at FROM users WHERE id = $1', [userId]);

        if (res.rows.length === 0) return { allowed: false, message: 'User not found' };

        const user = res.rows[0];
        let plan = (user.role || user.subscription_plan || 'free').toLowerCase();

        // Handle "Free" plan "3 days" limit logic
        if (plan === 'free') {
            const createdDate = new Date(user.created_at);
            const now = new Date();
            const diffTime = Math.abs(now - createdDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If older than 3 days, block all tools EXCEPT Riza Bot
            // "типа лимит 5 генерации только на Riza bot... остольное должен быть сообщение типа купите доступ"
            if (toolId !== 'bot' && diffDays > 3) {
                return {
                    allowed: false,
                    reason: 'expired_trial',
                    message: 'Your free trial for AI Tools has ended. Please upgrade to Pro or Ultra for full access.',
                    plan
                };
            }
        }

        const limit = PLANS[plan]?.dailyLimit || 5;

        // Check daily reset
        const lastDate = user.last_generation_date ? new Date(user.last_generation_date) : null;
        const now = new Date();
        const isToday = lastDate && lastDate.getDate() === now.getDate() && lastDate.getMonth() === now.getMonth() && lastDate.getFullYear() === now.getFullYear();

        let currentUsage = isToday ? (user.daily_generations_count || 0) : 0;

        if (currentUsage >= limit) {
            return {
                allowed: false,
                reason: 'limit_reached',
                message: `Daily limit reached (${limit}/${limit}). Upgrade your plan for more.`,
                plan,
                usage: currentUsage,
                limit
            };
        }

        return { allowed: true, plan, usage: currentUsage, limit };

    } catch (error) {
        console.error('Subscription check error:', error);
        return { allowed: false, message: 'Server error checking subscription' };
    }
};

exports.incrementUsage = async (userId) => {
    try {
        const now = new Date();
        // We need to fetch verify if it's a new day to reset, or let the SQL handle it?
        // Simpler: fetch, check date, reset or increment.
        const res = await db.query('SELECT daily_generations_count, last_generation_date FROM users WHERE id = $1', [userId]);
        if (res.rows.length === 0) return;
        const user = res.rows[0];

        const lastDate = user.last_generation_date ? new Date(user.last_generation_date) : null;
        const isToday = lastDate && lastDate.getDate() === now.getDate() && lastDate.getMonth() === now.getMonth() && lastDate.getFullYear() === now.getFullYear();

        let newCount = isToday ? (user.daily_generations_count || 0) + 1 : 1;

        await db.query('UPDATE users SET daily_generations_count = $1, last_generation_date = NOW() WHERE id = $2', [newCount, userId]);
    } catch (error) {
        console.error('Increment usage error:', error);
    }
};
