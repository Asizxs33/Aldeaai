import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../translations/translations';
import { CreditCard, Check, Zap, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Subscription = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState('pro');

    const handleWhatsAppRedirect = (plan) => {
        if (plan.id === 'free') return;

        const name = user?.name || user?.email?.split('@')[0] || 'User';
        const email = user?.email || 'No email';
        const planName = plan.name;

        const message = `Сәлеметсіз бе! Мен ${planName} тарифін сатып алғым келеді.\n\nАтым: ${name}\nПошта: ${email}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = '77072852369';

        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    };

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: '0',
            period: 'Тегін',
            color: 'from-gray-400 to-gray-600',
            features: [
                '5 генерация / күн',
                'Базалық шаблондар',
                'Email қолдау'
            ],
            popular: false
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '2,990',
            period: '₸ / ай',
            color: 'from-blue-500 to-indigo-600',
            features: [
                'Шексіз генерациялар',
                'Барлық шаблондар',
                'Приоритетті қолдау',
                'AI Бот толық мүмкіндіктері',
                'Tulga AI видео'
            ],
            popular: true
        },
        {
            id: 'ultra',
            name: 'Ultra',
            price: '9,990',
            period: '₸ / ай',
            color: 'from-purple-500 to-pink-600',
            features: [
                'Pro мүмкіндіктері',
                '15 генерация / күн',
                'Аналитика дашборды',
                'API қол жетімділік',
                '24/7 қолдау'
            ],
            popular: false
        }
    ];

    return (
        <div className="max-w-6xl mx-auto pb-12 px-4">
            {/* Header */}
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6"
                >
                    <Sparkles size={16} />
                    Тарифтер
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4"
                >
                    Тариф сатып алу
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
                >
                    Aldea AI толық мүмкіндіктеріне қол жеткізіңіз
                </motion.p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, idx) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative bg-white dark:bg-[#12141c] rounded-[2rem] p-8 border-2 cursor-pointer transition-all duration-300 ${selectedPlan === plan.id
                            ? 'border-blue-500 shadow-2xl shadow-blue-500/20 scale-105'
                            : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                            } ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
                    >
                        {/* Popular Badge */}
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold rounded-full shadow-lg">
                                <div className="flex items-center gap-1">
                                    <Crown size={14} />
                                    Танымал
                                </div>
                            </div>
                        )}

                        {/* Icon */}
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-6 shadow-xl`}>
                            {plan.id === 'free' ? <Zap size={28} /> : plan.id === 'pro' ? <Crown size={28} /> : <Sparkles size={28} />}
                        </div>

                        {/* Plan Info */}
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                            <span className="text-gray-500 dark:text-gray-400 font-medium">{plan.period}</span>
                        </div>

                        {/* Features */}
                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                                        <Check className="text-white" size={12} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        <button
                            onClick={() => handleWhatsAppRedirect(plan)}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${selectedPlan === plan.id
                                ? `bg-gradient-to-r ${plan.color} text-white shadow-xl`
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}>
                            {plan.id === 'free' ? 'Қазіргі тариф' : 'Таңдау'}
                            {plan.id !== 'free' && <ArrowRight size={18} />}
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Payment Methods */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-16 text-center"
            >
                <p className="text-gray-500 dark:text-gray-400 mb-4">Қауіпсіз төлем жүйелері</p>
                <div className="flex items-center justify-center gap-6 opacity-50">
                    <CreditCard size={32} className="text-gray-400" />
                    <span className="text-2xl font-bold text-gray-400">VISA</span>
                    <span className="text-2xl font-bold text-gray-400">Mastercard</span>
                    <span className="text-xl font-bold text-gray-400">Kaspi</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Subscription;
