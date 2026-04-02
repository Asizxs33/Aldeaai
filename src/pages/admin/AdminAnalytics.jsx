import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation } from '../../translations/translations';
import { BarChart3, TrendingUp, Users, Zap, Clock, Calendar, PieChart, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ANALYTICS_EVENTS } from '../../hooks/useAnalytics';

const AdminAnalytics = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && user.role?.toLowerCase() !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/.netlify/functions/analytics');
            if (!res.ok) throw new Error('Failed to fetch analytics');
            const data = await res.json();
            setAnalytics(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const getEventLabel = (eventType) => {
        const labels = {
            'presentation_created': 'Презентация',
            'test_generated': 'Тест',
            'bot_message_sent': 'Бот хабарлама',
            'ai_tool_used': 'AI құрал',
            'game_played': 'Ойын',
            'user_login': 'Кіру',
            'page_view': 'Бет көру',
            'tulga_video_created': 'Тұлға видео',
            'feedback_submitted': 'Пікір',
        };
        return labels[eventType] || eventType;
    };

    const getEventColor = (eventType) => {
        const colors = {
            'presentation_created': 'from-blue-500 to-cyan-500',
            'test_generated': 'from-purple-500 to-pink-500',
            'bot_message_sent': 'from-green-500 to-emerald-500',
            'ai_tool_used': 'from-amber-500 to-orange-500',
            'game_played': 'from-red-500 to-rose-500',
            'user_login': 'from-indigo-500 to-violet-500',
        };
        return colors[eventType] || 'from-gray-400 to-gray-500';
    };

    if (user?.role?.toLowerCase() !== 'admin') return null;

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <PieChart className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                            {getTranslation(language, 'analytics') || 'Аналитика'}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            Платформа қолданылуы
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchAnalytics}
                    disabled={loading}
                    className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
                >
                    <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <AlertCircle className="text-red-500 shrink-0" />
                    <div>
                        <p className="font-medium text-red-600 dark:text-red-400">Қате орын алды</p>
                        <p className="text-sm text-red-500">{error}</p>
                        <p className="text-sm text-red-500 mt-1">SQL таблицасын жасаңыз: <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">database/analytics-tables.sql</code></p>
                    </div>
                </div>
            )}

            {loading && !analytics ? (
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : analytics && (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-[#12141c] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white mb-4 shadow-lg">
                                <Zap size={24} />
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                                {analytics.totalEvents || 0}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 font-medium">Барлық оқиғалар</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-[#12141c] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white mb-4 shadow-lg">
                                <Users size={24} />
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                                {analytics.uniqueActiveUsers || 0}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 font-medium">Белсенді пайдаланушылар</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-[#12141c] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-4 shadow-lg">
                                <BarChart3 size={24} />
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                                {analytics.eventsByType?.presentation_created || 0}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 font-medium">Презентациялар</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-[#12141c] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white mb-4 shadow-lg">
                                <Clock size={24} />
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                                {Object.values(analytics.eventsToday || {}).reduce((a, b) => a + b, 0)}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 font-medium">Бүгінгі оқиғалар</div>
                        </motion.div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Events by Type */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-[#12141c] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <TrendingUp className="text-green-500" size={24} />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Оқиғалар түрі бойынша</h3>
                            </div>
                            {analytics.eventsByType && Object.keys(analytics.eventsByType).length > 0 ? (
                                <div className="space-y-4">
                                    {Object.entries(analytics.eventsByType)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 6)
                                        .map(([eventType, count]) => {
                                            const maxCount = Math.max(...Object.values(analytics.eventsByType));
                                            const width = (count / maxCount) * 100;
                                            return (
                                                <div key={eventType}>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="font-medium text-gray-900 dark:text-white">{getEventLabel(eventType)}</span>
                                                        <span className="text-gray-500">{count}</span>
                                                    </div>
                                                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${getEventColor(eventType)} rounded-full transition-all`}
                                                            style={{ width: `${width}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Әзірге деректер жоқ
                                </div>
                            )}
                        </motion.div>

                        {/* Top Users */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white dark:bg-[#12141c] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Users className="text-blue-500" size={24} />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Белсенді пайдаланушылар</h3>
                            </div>
                            {analytics.topUsers && analytics.topUsers.length > 0 ? (
                                <div className="space-y-3">
                                    {analytics.topUsers.map((u, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {u.name || (typeof u.email === 'string' ? u.email.split('@')[0] : 'User')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{u.email || 'No email'}</div>
                                                </div>
                                            </div>
                                            <div className="text-lg font-bold text-gray-700 dark:text-gray-300">{u.events}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Әзірге деректер жоқ
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Today's Activity */}
                    {analytics.eventsToday && Object.keys(analytics.eventsToday).length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white dark:bg-[#12141c] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Calendar className="text-amber-500" size={24} />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Бүгінгі белсенділік</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Object.entries(analytics.eventsToday).map(([eventType, count]) => (
                                    <div key={eventType} className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
                                        <div className="text-sm text-gray-500">{getEventLabel(eventType)}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Info */}
                    <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-blue-600 dark:text-blue-400 text-sm">
                        💡 Аналитиканы жинау үшін <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">useAnalytics</code> hook қолданыңыз. Мысалы: <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">trackEvent('presentation_created')</code>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminAnalytics;
