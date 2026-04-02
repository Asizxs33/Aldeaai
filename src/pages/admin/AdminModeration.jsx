import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation } from '../../translations/translations';
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminModeration = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Placeholder data - in real app this would come from API
    const [items, setItems] = useState([
        { id: 1, type: 'presentation', title: 'Математика 7 сынып', user: 'user@example.com', status: 'pending', createdAt: new Date().toISOString() },
        { id: 2, type: 'quiz', title: 'Физика тесті', user: 'teacher@school.kz', status: 'approved', createdAt: new Date().toISOString() },
        { id: 3, type: 'presentation', title: 'Химия презентация', user: 'educator@aldea.kz', status: 'pending', createdAt: new Date().toISOString() },
    ]);

    React.useEffect(() => {
        if (user && user.role?.toLowerCase() !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const updateStatus = (id, status) => {
        setItems(items.map(item => item.id === id ? { ...item, status } : item));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
            case 'rejected': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
            default: return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return CheckCircle;
            case 'rejected': return XCircle;
            default: return Clock;
        }
    };

    if (user?.role?.toLowerCase() !== 'admin') return null;

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {getTranslation(language, 'contentModeration') || 'Moderation'}
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        Контентті модерациялау
                    </p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8 flex items-center gap-3">
                <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                <p className="text-amber-700 dark:text-amber-400">
                    Бұл бет демо режимінде. Нақты модерация функционалы келесі жаңартуда қосылады.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Күтуде', count: items.filter(i => i.status === 'pending').length, color: 'from-amber-500 to-orange-500', icon: Clock },
                    { label: 'Бекітілген', count: items.filter(i => i.status === 'approved').length, color: 'from-green-500 to-emerald-500', icon: CheckCircle },
                    { label: 'Қабылданбаған', count: items.filter(i => i.status === 'rejected').length, color: 'from-red-500 to-rose-500', icon: XCircle },
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
                        <div className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Content Table */}
            <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-400">Контент</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-400">Түрі</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-400">Автор</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-400">Статус</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-gray-600 dark:text-gray-400">Әрекеттер</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {items.map((item) => {
                            const StatusIcon = getStatusIcon(item.status);
                            return (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {item.title}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 capitalize">
                                        {item.type}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        {item.user}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                                            <StatusIcon size={14} />
                                            {item.status === 'pending' ? 'Күтуде' : item.status === 'approved' ? 'Бекітілді' : 'Қабылданбады'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {item.status === 'pending' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => updateStatus(item.id, 'approved')}
                                                    className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(item.id, 'rejected')}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminModeration;
