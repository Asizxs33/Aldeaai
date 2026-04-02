import React from 'react';
import { motion } from 'framer-motion';
import { Zap, MousePointer, Clock, Shield, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';

const features = [
    {
        icon: Zap,
        titleKey: 'lightningFast',
        descKey: 'lightningFastDesc',
        color: 'from-yellow-400 to-orange-500',
        iconColor: 'text-orange-500',
        bg: 'bg-orange-50 dark:bg-orange-900/10'
    },
    {
        icon: MousePointer,
        titleKey: 'easyToUse',
        descKey: 'easyToUseDesc',
        color: 'from-blue-400 to-indigo-500',
        iconColor: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-900/10'
    },
    {
        icon: Clock,
        titleKey: 'saveTime',
        descKey: 'saveTimeDesc',
        color: 'from-green-400 to-emerald-500',
        iconColor: 'text-emerald-500',
        bg: 'bg-green-50 dark:bg-green-900/10'
    },
    {
        icon: Shield,
        titleKey: 'secureReliable',
        descKey: 'secureReliableDesc',
        color: 'from-purple-400 to-pink-500',
        iconColor: 'text-purple-500',
        bg: 'bg-purple-50 dark:bg-purple-900/10'
    }
];

const Features = () => {
    const { language } = useLanguage();

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mb-4">
                        <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Why Choose Us</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                        {getTranslation(language, 'featuresTitle')}
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        {getTranslation(language, 'featuresSubtitle')}
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                        >
                            {/* Hover Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <div className="relative z-10 flex items-start gap-6">
                                <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {getTranslation(language, feature.titleKey)}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {getTranslation(language, feature.descKey)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
