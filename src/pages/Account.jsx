import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../translations/translations';
import { User, Mail, Shield, Award, Calendar, Edit3, Camera, CheckCircle, Clock, Zap, Crown, Star, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Account = () => {
    const { language } = useLanguage();
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(user?.name || user?.email?.split('@')[0] || '');
    const [isSaving, setIsSaving] = useState(false);

    // Get role badge styling
    const getRoleBadge = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return { bg: 'from-red-500 to-rose-600', icon: Crown, label: 'Admin' };
            case 'moderator':
                return { bg: 'from-purple-500 to-indigo-600', icon: Shield, label: 'Moderator' };
            case 'pro':
                return { bg: 'from-amber-400 to-orange-500', icon: Star, label: 'Pro' };
            case 'ultra':
                return { bg: 'from-purple-500 to-pink-600', icon: Zap, label: 'Ultra' };
            default:
                return { bg: 'from-gray-400 to-gray-500', icon: User, label: 'Free' };
        }
    };

    const roleBadge = getRoleBadge(user?.role || user?.subscription_plan || 'free');

    // Get user stats from localStorage or defaults
    const getStats = () => {
        const history = JSON.parse(localStorage.getItem('aldea_history') || '[]');
        const presentations = history.filter(h => h.type === 'presentation').length;
        const generations = history.length;
        return { generations, presentations, streak: user?.streak || 0 };
    };

    const stats = getStats();

    const handleSave = async () => {
        if (!editedName.trim()) return;

        setIsSaving(true);
        try {
            // Update user in context and localStorage
            const updatedUser = { ...user, name: editedName.trim() };
            updateUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update name:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedName(user?.name || user?.email?.split('@')[0] || '');
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <User className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {getTranslation(language, 'myAccount') || 'Менің аккаунтым'}
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        {getTranslation(language, 'accountSettings') || 'Профиль және баптаулар'}
                    </p>
                </div>
            </div>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#12141c] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl mb-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl">
                            {(user?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
                        </div>
                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                            <Camera size={18} />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div
                                    key="editing"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mb-4"
                                >
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                        Атыңыз / Имя
                                    </label>
                                    <input
                                        type="text"
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        className="w-full md:w-80 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xl font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Атыңызды жазыңыз"
                                        autoFocus
                                    />
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving || !editedName.trim()}
                                            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
                                        >
                                            <Save size={16} />
                                            {isSaving ? 'Сақталуда...' : 'Сақтау'}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                        >
                                            <X size={16} />
                                            Болдырмау
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="display"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {user?.name || user?.email?.split('@')[0] || 'User'}
                                        </h2>
                                        <span className={`px-3 py-1 bg-gradient-to-r ${roleBadge.bg} text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1.5`}>
                                            <roleBadge.icon size={14} />
                                            {roleBadge.label}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isEditing && (
                            <>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 dark:text-gray-400 mb-4">
                                    <Mail size={16} />
                                    <span>{user?.email || 'user@aldea.kz'}</span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 text-sm">
                                    <Calendar size={14} />
                                    <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Edit Button */}
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-2"
                        >
                            <Edit3 size={18} />
                            {getTranslation(language, 'edit') || 'Өңдеу'}
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { icon: Zap, label: 'Генерациялар', value: stats.generations, color: 'from-blue-500 to-cyan-500' },
                    { icon: Award, label: 'Презентациялар', value: stats.presentations, color: 'from-purple-500 to-pink-500' },
                    { icon: Clock, label: 'Күндік серия', value: `${stats.streak} күн`, color: 'from-amber-500 to-orange-500' },
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
                        <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">{stat.value}</div>
                        <div className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Security Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-[#12141c] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-lg"
            >
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-green-500" size={24} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {getTranslation(language, 'security') || 'Қауіпсіздік'}
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-500" size={20} />
                            <span className="font-medium text-gray-900 dark:text-white">Email верификациясы</span>
                        </div>
                        <span className="text-green-500 font-bold text-sm">Расталған</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Shield className="text-gray-400" size={20} />
                            <span className="font-medium text-gray-900 dark:text-white">Құпия сөзді өзгерту</span>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">Өзгерту</button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <User className="text-gray-400" size={20} />
                            <span className="font-medium text-gray-900 dark:text-white">Рөл</span>
                        </div>
                        <span className={`px-3 py-1 bg-gradient-to-r ${roleBadge.bg} text-white text-xs font-bold rounded-full`}>
                            {roleBadge.label}
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Account;

