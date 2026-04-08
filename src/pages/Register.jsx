import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../translations/translations';
import { Link, useNavigate } from 'react-router-dom';
import { trackAnalyticsEvent, ANALYTICS_EVENTS } from '../hooks/useAnalytics';
import { API_BASE } from '../utils/api';

const Register = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const normalizedEmail = email.toLowerCase().trim();
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalizedEmail, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Handle successful registration
                console.log('Registration success:', data);

                // Track registration event
                trackAnalyticsEvent(ANALYTICS_EVENTS.USER_REGISTER);

                // Redirect to verify email
                navigate(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
            } else {
                const errorMsg = data.detail || data.message || 'Registration failed';
                if (errorMsg === 'User already exists') {
                    setError(
                        <span>
                            {language === 'kk' ? 'Бұл пошта тіркелген.' : language === 'ru' ? 'Эта почта уже зарегистрирована.' : 'This email is already registered.'}{' '}
                            <Link to="/login" className="underline font-bold text-primary italic">
                                {language === 'kk' ? 'Кіру' : language === 'ru' ? 'Войти' : 'Login'}
                            </Link>
                        </span>
                    );
                } else {
                    setError(errorMsg);
                }
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mt-40 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -mr-40 -mb-40 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-lg shadow-xl border border-gray-100 relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        {getTranslation(language, 'createAccount')}
                    </h1>
                    <p className="text-gray-500 text-lg">
                        {getTranslation(language, 'registerSubtitle')}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="text-red-500 text-center text-sm">{error}</div>}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                            {getTranslation(language, 'enterEmail')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={getTranslation(language, 'emailPlaceholder')}
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                            {getTranslation(language, 'enterPassword')}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={getTranslation(language, 'passwordPlaceholder')}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 group"
                    >
                        <span>{getTranslation(language, 'registerButton')}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-8 border-t border-gray-100 text-center space-y-4">
                    <p className="text-gray-500">
                        {getTranslation(language, 'hasAccount')}{' '}
                        <Link to="/login" className="text-primary font-semibold hover:text-primary-dark transition-colors">
                            {getTranslation(language, 'loginLink')}
                        </Link>
                    </p>

                    <a href="#" className="inline-block text-sm text-gray-400 hover:text-primary transition-colors">
                        {getTranslation(language, 'authIssues')} {getTranslation(language, 'help')}
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
