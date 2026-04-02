import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyEmail = () => {
    const { language } = useLanguage();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailParam = params.get('email');
        if (emailParam) {
            setEmail(emailParam);
        } else {
            navigate('/login');
        }
    }, [location, navigate]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let timer;
        if (resendTimer > 0 && !canResend) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [resendTimer, canResend]);

    const handleResend = async () => {
        if (!canResend) return;

        setIsVerifying(true);
        setError('');
        try {
            const normalizedEmail = email.toLowerCase().trim();
            const response = await fetch('/.netlify/functions/resend-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalizedEmail }),
            });

            const data = await response.json();

            if (response.ok) {
                setResendTimer(60);
                setCanResend(false);
                setError('New code sent!');
                // Clear success message after 3 seconds
                setTimeout(() => setError(''), 3000);
            } else {
                setError(data.message || 'Failed to resend code');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');

        const verificationCode = code.join('');
        if (verificationCode.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setIsVerifying(true);
        try {
            const normalizedEmail = email.toLowerCase().trim();
            const response = await fetch('/.netlify/functions/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalizedEmail, code: verificationCode }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/login', { state: { message: 'Email verified successfully! You can now log in.' } });
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        } finally {
            setIsVerifying(false);
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
                className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 w-full max-w-lg shadow-xl border border-gray-100 dark:border-gray-800 relative z-10 text-center"
            >
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <Mail className="w-10 h-10 text-primary" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {language === 'kk' ? 'Поштаны растау' : language === 'ru' ? 'Подтвердите почту' : 'Verify Email'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg">
                    {language === 'kk'
                        ? `${email} мекенжайына жіберілген 6 таңбалы кодты енгізіңіз`
                        : language === 'ru'
                            ? `Введите 6-значный код, отправленный на ${email}`
                            : `Enter the 6-digit code sent to ${email}`}
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex justify-between gap-2 md:gap-4">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-11 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 dark:text-white transition-all outline-none"
                                required
                            />
                        ))}
                    </div>

                    {error && (
                        <div className={`text-sm font-medium ${error.includes('sent') ? 'text-green-500' : 'text-red-500'}`}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isVerifying}
                        className="w-full bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 group disabled:opacity-50"
                    >
                        {isVerifying ? (
                            <RefreshCw className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <span>{language === 'kk' ? 'Растау' : language === 'ru' ? 'Подтвердить' : 'Verify'}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResend}
                                className="text-primary hover:text-primary-dark font-bold text-sm transition-colors"
                            >
                                {language === 'kk' ? 'Кодты қайта жіберу' : language === 'ru' ? 'Отправить код повторно' : 'Resend Code'}
                            </button>
                        ) : (
                            <p className="text-gray-400 text-sm">
                                {language === 'kk' ? `Кодты қайта жіберу (${resendTimer}с)` : language === 'ru' ? `Отправить код повторно (${resendTimer}с)` : `Resend code in ${resendTimer}s`}
                            </p>
                        )}
                    </div>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-500 hover:text-primary transition-colors font-medium"
                    >
                        {language === 'kk' ? 'Кіруге оралу' : language === 'ru' ? 'Вернуться ко входу' : 'Back to login'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
