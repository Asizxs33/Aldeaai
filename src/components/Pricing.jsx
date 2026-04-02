import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../translations/translations';

const Pricing = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const [isYearly, setIsYearly] = useState(false);

    const handleWhatsAppRedirect = (plan) => {
        if (plan.nameKey === 'basic') return;

        const name = user?.name || user?.email?.split('@')[0] || 'User';
        const email = user?.email || 'No email';
        const planName = plan.nameKey === 'professional' ? 'Pro' : 'Ultra';

        const message = `Сәлеметсіз бе! Мен ${planName} тарифін сатып алғым келеді.\n\nАтым: ${name}\nПошта: ${email}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = '77072852369';

        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    };

    const pricingPlans = [
        {
            nameKey: 'basic', // Free
            price: '0 ₸',
            period: 'forever',
            discount: null,
            descKey: 'basicDesc',
            features: [
                'limit5GenerationsDiff', // "5 generations/day (Riza bot only)" 
                '3DayLimit', // "3 Days Access"
                'basicSupport'
            ],
            notIncluded: [
                'allToolsAccess',
                'extendedLimits'
            ],
            highlighted: false,
            buttonVariant: 'outline'
        },
        {
            nameKey: 'professional', // Pro
            price: '2900 ₸',
            period: 'month',
            discount: 'bestValue',
            descKey: 'professionalDesc',
            features: [
                'limit5GenerationsAll', // "5 generations/day (All tools)"
                'allToolsAccess',
                'prioritySupport'
            ],
            notIncluded: [
                'extendedLimits' // 15 gens
            ],
            highlighted: true,
            buttonVariant: 'primary'
        },
        {
            nameKey: 'ultra', // Ultra
            price: '5900 ₸',
            period: 'month',
            discount: null,
            descKey: 'ultraDesc',
            features: [
                'limit15Generations', // "15 generations/day"
                'allToolsAccess',
                'prioritySupport',
                'earlyAccess'
            ],
            notIncluded: [],
            highlighted: false,
            buttonVariant: 'outline'
        }
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                        {getTranslation(language, 'pricingTitle')}
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                        {getTranslation(language, 'pricingSubtitle')}
                    </p>

                    {/* Simple Toggle for visual effect */}
                    <div className="inline-flex items-center p-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                        <button
                            onClick={() => setIsYearly(false)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isYearly ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            {getTranslation(language, 'monthly')}
                        </button>
                        <button
                            onClick={() => setIsYearly(true)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isYearly ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            {getTranslation(language, 'yearly')} <span className="ml-1 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full uppercase">{getTranslation(language, 'save20')}</span>
                        </button>
                    </div>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className={`relative rounded-[2rem] p-8 transition-all duration-300 ${plan.highlighted
                                ? 'bg-[#1E293B] text-white shadow-2xl shadow-blue-900/50 ring-4 ring-blue-500/20 scale-105 z-10'
                                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl'
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.highlighted && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                                    <Sparkles size={16} />
                                    {getTranslation(language, 'mostPopular')}
                                </div>
                            )}

                            {/* Header */}
                            <div className="mb-8">
                                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                    {getTranslation(language, plan.nameKey)}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-5xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                        {plan.price}
                                    </span>
                                    {plan.price !== 'Custom' && (
                                        <span className={`text-lg ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>/mo</span>
                                    )}
                                </div>
                                <p className={`mt-4 ${plan.highlighted ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {getTranslation(language, plan.descKey)}
                                </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-4 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlighted ? 'bg-blue-500/20' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                            <Check size={12} className={plan.highlighted ? 'text-blue-400' : 'text-blue-600 dark:text-blue-400'} />
                                        </div>
                                        <span className={`text-sm ${plan.highlighted ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {getTranslation(language, feature)}
                                        </span>
                                    </div>
                                ))}
                                {plan.notIncluded && plan.notIncluded.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3 opacity-50">
                                        <div className="mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                                            <X size={12} className="text-gray-400" />
                                        </div>
                                        <span className={`text-sm ${plan.highlighted ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {getTranslation(language, feature)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Button */}
                            <button
                                onClick={() => handleWhatsAppRedirect(plan)}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-95 ${plan.highlighted
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}>
                                {plan.price === '0 ₸' ? getTranslation(language, 'currentPlan') || 'Тегін' : getTranslation(language, 'startTrial')}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
