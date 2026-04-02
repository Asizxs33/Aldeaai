import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation } from '../../translations/translations';
import { Users, Crown, Shield, Star, User, Trash2, RefreshCw, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUsers = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        if (user && user.role?.toLowerCase() !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/.netlify/functions/admin-users');
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data.users);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateRole = async (userId, newRole) => {
        setUpdatingId(userId);
        try {
            const res = await fetch('/.netlify/functions/admin-users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole })
            });
            if (!res.ok) throw new Error('Failed to update role');
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm('Бұл пайдаланушыны жою керек пе?')) return;
        try {
            const res = await fetch('/.netlify/functions/admin-users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (!res.ok) throw new Error('Failed to delete user');
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            setError(err.message);
        }
    };

    const getRoleIcon = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return Crown;
            case 'ultra': return Sparkles;
            case 'moderator': return Shield;
            case 'pro': return Star;
            default: return User;
        }
    };

    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'from-red-500 to-rose-600';
            case 'ultra': return 'from-purple-500 to-pink-600';
            case 'moderator': return 'from-indigo-500 to-blue-600';
            case 'pro': return 'from-amber-400 to-orange-500';
            default: return 'from-gray-400 to-gray-500';
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = selectedRole === 'all' || (u.role?.toLowerCase() || 'free') === selectedRole;
        return matchesSearch && matchesRole;
    });

    if (user?.role?.toLowerCase() !== 'admin') return null;

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                            {getTranslation(language, 'userManagement') || 'Users'}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            {users.length} пайдаланушы
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
                    {['all', 'free', 'pro', 'ultra', 'moderator', 'admin'].map(role => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedRole === role
                                ? 'bg-blue-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {role === 'all' ? 'Барлығы' : role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8 text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {loading && users.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : (
                <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-400">Пайдаланушы</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-400">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-400">Рөл</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-400">Тіркелген</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-600 dark:text-gray-400">Әрекеттер</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            <AnimatePresence>
                                {filteredUsers.map((u) => {
                                    const Icon = getRoleIcon(u.role);
                                    return (
                                        <motion.tr
                                            key={u.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor(u.role)} flex items-center justify-center text-white font-bold`}>
                                                        {(u.name?.charAt(0) || u.email?.charAt(0) || 'U').toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {u.name || u.email?.split('@')[0]}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                {u.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative">
                                                    <select
                                                        value={u.role?.toLowerCase() || 'free'}
                                                        onChange={(e) => updateRole(u.id, e.target.value)}
                                                        disabled={updatingId === u.id || u.id === user.id}
                                                        className={`appearance-none px-3 py-1.5 pr-8 rounded-lg font-medium text-white text-sm cursor-pointer bg-gradient-to-r ${getRoleColor(u.role)} disabled:opacity-50`}
                                                    >
                                                        <option value="free" className="text-gray-900">Free</option>
                                                        <option value="pro" className="text-gray-900">Pro</option>
                                                        <option value="ultra" className="text-gray-900">Ultra</option>
                                                        <option value="moderator" className="text-gray-900">Moderator</option>
                                                        <option value="admin" className="text-gray-900">Admin</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={14} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                                                {new Date(u.created_at).toLocaleDateString('kk')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {u.id !== user.id && (
                                                    <button
                                                        onClick={() => deleteUser(u.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            Пайдаланушылар табылмады
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
