import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../translations/translations';
import { Link, useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose }) => {
    const { language } = useLanguage();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save user data to context
                login(data.user);
                console.log('Login success:', data);
                onClose();
                navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 px-4"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                            </button>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {getTranslation(language, 'welcomeBack')}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {getTranslation(language, 'loginSubtitle')}
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && <div className="text-red-500 text-center text-sm">{error}</div>}

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                                        {getTranslation(language, 'enterEmail')}
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={getTranslation(language, 'emailPlaceholder')}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                                        {getTranslation(language, 'enterPassword')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={getTranslation(language, 'passwordPlaceholder')}
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 group"
                                >
                                    <span>{getTranslation(language, 'loginButton')}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>

                            {/* Footer */}
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center space-y-3">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {getTranslation(language, 'noAccount')}{' '}
                                    <Link to="/register" onClick={onClose} className="text-primary font-semibold hover:text-primary-dark transition-colors">
                                        {getTranslation(language, 'registerLink')}
                                    </Link>
                                </p>

                                <a href="#" className="inline-block text-sm text-gray-400 hover:text-primary transition-colors">
                                    {getTranslation(language, 'authIssues')} {getTranslation(language, 'help')}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LoginModal;
