import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { Download, Smartphone, Monitor, Share2, Plus, Chrome, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Install = () => {
    const { language } = useLanguage();

    const steps = [
        {
            icon: Chrome,
            title: 'Chrome браузерін ашыңыз',
            description: 'aldea.kz сайтына кіріңіз'
        },
        {
            icon: Share2,
            title: 'Бөлісу батырмасын басыңыз',
            description: 'Адрес жолындағы ⋮ немесе Share иконкасын табыңыз'
        },
        {
            icon: Plus,
            title: '"Басты экранға қосу" таңдаңыз',
            description: '"Add to Home Screen" немесе "Install" батырмасын басыңыз'
        },
        {
            icon: CheckCircle,
            title: 'Дайын! 🎉',
            description: 'Енді Aldea AI телефоныңызда қолданба ретінде жұмыс істейді'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto pb-12 px-4">
            {/* Header */}
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30"
                >
                    <Download className="w-12 h-12 text-white" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4"
                >
                    Aldea AI орнату
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
                >
                    Телефоныңызға қолданба ретінде орнатып, жылдам қол жеткізіңіз
                </motion.p>
            </div>

            {/* Device Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-[#12141c] rounded-2xl p-6 border-2 border-blue-500 shadow-xl cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Smartphone className="text-blue-600" size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Телефон</h3>
                            <p className="text-gray-500 dark:text-gray-400">iOS / Android</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-[#12141c] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                            <Monitor className="text-gray-500" size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Компьютер</h3>
                            <p className="text-gray-500 dark:text-gray-400">Windows / Mac</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Steps */}
            <div className="space-y-6">
                {steps.map((step, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="bg-white dark:bg-[#12141c] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg flex items-start gap-6"
                    >
                        <div className="flex-shrink-0">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg relative">
                                <step.icon size={24} />
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 shadow">
                                    {idx + 1}
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{step.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* QR Code Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-8 text-center text-white relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4">QR код арқылы жылдам орнату</h3>
                    <div className="w-40 h-40 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <div className="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                            QR
                        </div>
                    </div>
                    <p className="text-white/80">Телефоныңыздың камерасымен сканерлеңіз</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Install;
