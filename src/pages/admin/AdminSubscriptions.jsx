import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation } from '../../translations/translations';
import { CreditCard, Crown, Star, User, Search, ChevronDown, RefreshCw, CheckCircle } from 'lucide-react';
import { API_BASE } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSubscriptions = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (user && user.role?.toLowerCase() !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/admin/users`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setUsers(data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updatePlan = async (userId, newPlan) => {
        setUpdatingId(userId);
        try {
            const res = await fetch(`${API_BASE}/api/admin/users`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newPlan })
            });
            if (!res.ok) throw new Error('Failed to update');
            setUsers(users.map(u => u.id === userId ? { ...u, role: newPlan } : u));
            setSuccess(userId);
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingId(null);
        }
    };

    const getPlanIcon = (plan) => {
        switch (plan?.toLowerCase()) {
            case 'admin': return Crown;
            case 'ultra': return Sparkles;
            case 'pro': return Star;
            default: return User;
        }
    };

    const getPlanColor = (plan) => {
        switch (plan?.toLowerCase()) {
            case 'admin': return 'from-red-500 to-rose-600';
            case 'ultra': return 'from-purple-500 to-pink-600';
            case 'pro': return 'from-amber-400 to-orange-500';
            default: return 'from-gray-400 to-gray-500';
        }
    };

    const plans = [
        { id: 'free', name: 'Free', price: '0 ₸', features: ['5 генерация/күн', 'Базалық функциялар'] },
        { id: 'pro', name: 'Pro', price: '2990 ₸/ай', features: ['Шексіз генерация', 'Барлық функциялар', 'Приоритетті қолдау'] },
        { id: 'ultra', name: 'Ultra', price: '9990 ₸/ай', features: ['Pro мүмкіндіктері', '15 генерация/күн', 'Аналитика'] },
    ];

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const userPlan = u.role?.toLowerCase() || 'free';
        const matchesPlan = selectedPlan === 'all' || userPlan === selectedPlan;
        return matchesSearch && matchesPlan;
    });

    const planCounts = {
        free: users.filter(u => !u.role || u.role === 'free').length,
        pro: users.filter(u => u.role === 'pro').length,
        ultra: users.filter(u => u.role === 'ultra').length,
        admin: users.filter(u => u.role === 'admin').length,
    };

    if (user?.role?.toLowerCase() !== 'admin') return null;

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <CreditCard className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                            {getTranslation(language, 'subscriptions') || 'Жазылымдар'}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            Пайдаланушы тарифтерін басқару
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
                >
                    <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Plan Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { plan: 'free', label: 'Free', count: planCounts.free, color: 'from-gray-400 to-gray-500', icon: User },
                    { plan: 'pro', label: 'Pro', count: planCounts.pro, color: 'from-amber-400 to-orange-500', icon: Star },
                    { plan: 'ultra', label: 'Ultra', count: planCounts.ultra, color: 'from-purple-500 to-pink-600', icon: Sparkles },
                    { plan: 'admin', label: 'Admin', count: planCounts.admin, color: 'from-red-500 to-rose-600', icon: Crown },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-[#12141c] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">{stat.count}</div>
                        <div className="text-gray-500 dark:text-gray-400 font-medium">{stat.label} пайдаланушылар</div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Іздеу..."
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'free', 'pro', 'ultra', 'admin'].map(plan => (
                        <button
                            key={plan}
                            onClick={() => setSelectedPlan(plan)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedPlan === plan
                                ? 'bg-amber-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            {plan === 'all' ? 'Барлығы' : plan.charAt(0).toUpperCase() + plan.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-400">Пайдаланушы</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-400">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-400">Тариф</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-gray-600 dark:text-gray-400">Өзгерту</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        <AnimatePresence>
                            {filteredUsers.map((u) => {
                                const Icon = getPlanIcon(u.role);
                                return (
                                    <motion.tr
                                        key={u.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getPlanColor(u.role)} flex items-center justify-center text-white font-bold`}>
                                                    {(u.name?.charAt(0) || u.email?.charAt(0) || 'U').toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {u.name || (typeof u.email === 'string' ? u.email.split('@')[0] : 'User')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{u.email || 'No email'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getPlanColor(u.role)}`}>
                                                <Icon size={14} />
                                                {(u.role || 'free').charAt(0).toUpperCase() + (u.role || 'free').slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {success === u.id ? (
                                                <span className="text-green-500 flex items-center justify-end gap-1">
                                                    <CheckCircle size={16} /> Сақталды
                                                </span>
                                            ) : u.id !== user.id ? (
                                                <div className="relative inline-block">
                                                    <select
                                                        value={u.role?.toLowerCase() || 'free'}
                                                        onChange={(e) => updatePlan(u.id, e.target.value)}
                                                        disabled={updatingId === u.id}
                                                        className="appearance-none px-4 py-2 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer disabled:opacity-50"
                                                    >
                                                        <option value="free">Free</option>
                                                        <option value="pro">Pro</option>
                                                        <option value="ultra">Ultra</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
                {loading && (
                    <div className="py-12 flex justify-center">
                        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                )}
                {!loading && filteredUsers.length === 0 && (
                    <div className="py-12 text-center text-gray-500">Пайдаланушылар табылмады</div>
                )}
            </div>
        </div>
    );
};

export default AdminSubscriptions;
