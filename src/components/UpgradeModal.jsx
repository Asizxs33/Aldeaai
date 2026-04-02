import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';

const UpgradeModal = ({ isOpen, onClose, message }) => {
    const navigate = useNavigate();
    const { language } = useLanguage();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-[#1a1f2e] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700"
                >
                    <div className="relative p-6 text-center">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                            <Zap size={32} className="text-white fill-white" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {getTranslation(language, 'limitReached') || 'Limit Reached'}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                            {message || "You've reached your daily generation limit. Upgrade to Pro for unlimited access."}
                        </p>

                        <div className="space-y-3 mb-8 text-left bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <Check size={12} className="text-green-500" strokeWidth={3} />
                                </div>
                                <span>5 Daily generations (Pro)</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <Check size={12} className="text-green-500" strokeWidth={3} />
                                </div>
                                <span>15 Daily generations (Ultra)</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <Check size={12} className="text-green-500" strokeWidth={3} />
                                </div>
                                <span>Access to all tools</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                onClose();
                                navigate('/subscription');
                            }}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all"
                        >
                            {getTranslation(language, 'upgradeNow') || 'Upgrade Now'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default UpgradeModal;
