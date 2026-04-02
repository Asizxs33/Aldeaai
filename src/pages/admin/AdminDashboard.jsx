import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation } from '../../translations/translations';
import { BarChart3, Users, TrendingUp, Calendar, Crown, Shield, User, Star, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Redirect if not admin
    useEffect(() => {
        if (user && user.role?.toLowerCase() !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/.netlify/functions/admin-stats');
            if (!res.ok) throw new Error('Failed to fetch stats');
            const data = await res.json();
            setStats(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return Crown;
            case 'moderator': return Shield;
            case 'pro': return Star;
            default: return User;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'from-red-500 to-rose-600';
            case 'moderator': return 'from-purple-500 to-indigo-600';
            case 'pro': return 'from-amber-400 to-orange-500';
            default: return 'from-gray-400 to-gray-500';
        }
    };

    if (user?.role?.toLowerCase() !== 'admin') {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                        <BarChart3 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                            {getTranslation(language, 'adminDashboard') || 'Dashboard'}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            Платформа статистикасы
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
                >
                    <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8 text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {loading && !stats ? (
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : stats && (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-[#12141c] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white mb-4 shadow-lg">
                                <Users size={24} />
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                                {stats.totalUsers}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 font-medium">
                                Барлық пайдаланушылар
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-[#12141c] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white mb-4 shadow-lg">
                                <TrendingUp size={24} />
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                                {stats.newUsersThisMonth}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 font-medium">
                                Осы айда тіркелген
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-[#12141c] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-4 shadow-lg">
                                <Calendar size={24} />
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                                {stats.newUsersToday}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 font-medium">
                                Бүгін тіркелген
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-[#12141c] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white mb-4 shadow-lg">
                                <Star size={24} />
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                                {stats.roleStats?.pro || 0}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 font-medium">
                                Pro пайдаланушылар
                            </div>
                        </motion.div>
                    </div>

                    {/* Role Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-[#12141c] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-lg mb-8"
                    >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            Рөлдер бойынша
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(stats.roleStats || {}).map(([role, count]) => {
                                const Icon = getRoleIcon(role);
                                return (
                                    <div key={role} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRoleColor(role)} flex items-center justify-center text-white`}>
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
                                            <div className="text-sm text-gray-500 capitalize">{role}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Weekly Chart */}
                    {stats.weeklyStats && stats.weeklyStats.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white dark:bg-[#12141c] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-lg"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Соңғы 7 күндегі тіркелулер
                            </h3>
                            <div className="flex items-end gap-2 h-40">
                                {stats.weeklyStats.map((day, idx) => {
                                    const maxCount = Math.max(...stats.weeklyStats.map(d => d.count));
                                    const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                                {day.count}
                                            </div>
                                            <div
                                                className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all"
                                                style={{ height: `${Math.max(height, 5)}%` }}
                                            />
                                            <div className="text-xs text-gray-500">
                                                {new Date(day.date).toLocaleDateString('kk', { weekday: 'short' })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
