import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { History as HistoryIcon, Trash2, FileText, Video, Calendar, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHistory, clearHistory, deleteHistoryItem } from '../utils/historyStorage';

const History = () => {
    const { language } = useLanguage();
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('all'); // all, text, video
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        setItems(getHistory());
    }, []);

    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear all history?')) {
            clearHistory();
            setItems([]);
        }
    };

    const handleDeleteItem = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Delete this item?')) {
            const updated = deleteHistoryItem(id);
            setItems(updated);
            if (selectedItem?.id === id) setSelectedItem(null);
        }
    };

    const filteredItems = items.filter(item => {
        if (filter === 'all') return true;
        return item.type === filter;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'kk' ? 'kk-KZ' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                        <HistoryIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {getTranslation(language, 'historyTitle')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {getTranslation(language, 'historyDesc')}
                        </p>
                    </div>
                </div>

                {items.length > 0 && (
                    <button
                        onClick={handleClearHistory}
                        className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
                    >
                        <Trash2 size={18} />
                        {getTranslation(language, 'clearHistory')}
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 text-sm font-medium">
                {['all', 'text', 'video'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-full transition-all ${filter === type
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        {getTranslation(language, `filter${type.charAt(0).toUpperCase() + type.slice(1)}`)}
                    </button>
                ))}
            </div>

            {/* Content List */}
            {items.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HistoryIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {getTranslation(language, 'noHistory')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {getTranslation(language, 'noHistoryDesc')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedItem(item)}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => handleDeleteItem(e, item.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex items-start gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.type === 'video'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    }`}>
                                    {item.type === 'video' ? <Video size={24} /> : <FileText size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                        {item.toolTitle}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate">{item.subjectTitle}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 min-h-[3rem]">
                                    {item.topic}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Calendar size={14} />
                                    <span>{formatDate(item.date)}</span>
                                </div>
                            </div>

                            <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                                {getTranslation(language, 'viewDetails')}
                                <ArrowRight size={16} className="ml-1" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedItem.type === 'video'
                                            ? 'bg-indigo-100 text-indigo-600'
                                            : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {selectedItem.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {selectedItem.toolTitle}
                                        </h2>
                                        <p className="text-sm text-gray-500">{formatDate(selectedItem.date)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto max-h-[calc(85vh-80px)] custom-scrollbar">
                                <div className="mb-6">
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                        {getTranslation(language, 'topic')}
                                    </label>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        {selectedItem.topic}
                                    </p>
                                </div>

                                {selectedItem.type === 'video' ? (
                                    <div className="space-y-6">
                                        <div className="aspect-video bg-black rounded-2xl overflow-hidden relative flex items-center justify-center group">
                                            <div className="absolute inset-0 opacity-50 bg-gradient-to-br from-indigo-900 to-black"></div>
                                            {selectedItem.details?.characterImage && (
                                                <img
                                                    src={selectedItem.details.characterImage}
                                                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                                                    alt="Character"
                                                />
                                            )}
                                            <div className="relative z-10 text-center text-white">
                                                <h3 className="text-2xl font-bold mb-2">{selectedItem.subjectTitle}</h3>
                                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mt-4 cursor-pointer hover:scale-110 transition-transform">
                                                    <PlayIcon className="ml-1" size={32} fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                                Script
                                            </label>
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                {selectedItem.content}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                            Generated Content
                                        </label>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {selectedItem.content}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper icon
const PlayIcon = ({ className, size, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
);

export default History;
