import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Zap, CheckCircle, BarChart3, Users, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';

const Hero = () => {
    const { language } = useLanguage();
    return (
        <section className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-background dark:bg-gray-900 transition-colors duration-300">
            {/* Background Decor */}
            <div className="absolute inset-0 grid-pattern opacity-100 pointer-events-none"></div>
            <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-400/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Column - Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8 text-center lg:text-left"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-blue-200 dark:border-blue-500/30 rounded-full px-4 py-2 shadow-sm hover:scale-105 transition-transform cursor-default"
                        >
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{getTranslation(language, 'saveBadge')}</span>
                        </motion.div>

                        {/* Main Headline */}
                        <div className="space-y-4">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight"
                            >
                                {getTranslation(language, 'heroTitle')}{' '}
                                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                    {getTranslation(language, 'heroTitleHighlight')}
                                </span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                            >
                                {getTranslation(language, 'heroSubtitle')}
                            </motion.p>
                        </div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <button className="group px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center space-x-2 transform hover:-translate-y-1">
                                <span>{getTranslation(language, 'startTrial')}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-white text-lg font-bold rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center space-x-2">
                                <Play className="w-5 h-5 text-blue-600 fill-current" />
                                <span>{getTranslation(language, 'watchDemo')}</span>
                            </button>
                        </motion.div>

                        {/* Social Proof */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="pt-6 flex items-center justify-center lg:justify-start space-x-6 text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                                    +2k
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex text-yellow-500">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                                </div>
                                <span>{getTranslation(language, 'activeTeachers')}</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Column - 3D Mockup */}
                    <div className="perspective-1000 relative hidden lg:block h-[600px] w-full">
                        <motion.div
                            initial={{ opacity: 0, rotateX: 20, rotateY: -20, scale: 0.9 }}
                            animate={{ opacity: 1, rotateX: 5, rotateY: -12, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative preserve-3d w-full h-full"
                        >
                            {/* Main Dashboard Card */}
                            <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-transform hover:rotate-y-negative-12 hover:rotate-x-0 duration-500">
                                {/* Dashboard Top Bar */}
                                <div className="h-12 border-b border-gray-100 dark:border-gray-700 flex items-center px-4 space-x-2 bg-gray-50/50 dark:bg-gray-900/50">
                                    <div className="flex space-x-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-gray-700 h-6 rounded-md mx-4 opacity-50"></div>
                                </div>
                                {/* Dashboard Content Mock */}
                                <div className="p-6 grid grid-cols-3 gap-4">
                                    <div className="col-span-2 space-y-4">
                                        <div className="h-32 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 p-4">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                                                    <Zap size={20} />
                                                </div>
                                                <div>
                                                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                                                    <div className="h-3 w-16 bg-gray-100 dark:bg-gray-600 rounded"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full w-3/4 bg-blue-500 rounded-full"></div>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-400">
                                                    <span>Progress</span>
                                                    <span>75%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-24 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30"></div>
                                            <div className="h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30"></div>
                                        </div>
                                    </div>
                                    <div className="col-span-1 space-y-4">
                                        <div className="h-full bg-gray-50 dark:bg-gray-700/30 rounded-xl"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <motion.div
                                className="absolute -left-12 top-20 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl shadow-blue-500/20 border border-gray-100 dark:border-gray-700 flex items-center space-x-3 animate-float"
                            >
                                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600">
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-800 dark:text-white">{getTranslation(language, 'quizGenerated')}</div>
                                    <div className="text-xs text-gray-500">{getTranslation(language, 'justNow')}</div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="absolute -right-8 bottom-32 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl shadow-purple-500/20 border border-gray-100 dark:border-gray-700 flex items-center space-x-3 animate-float-delayed"
                            >
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-800 dark:text-white">{getTranslation(language, 'activeStudents')}</div>
                                    <div className="text-xs text-gray-500">{getTranslation(language, 'online24')}</div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="absolute right-20 -top-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl shadow-orange-500/20 border border-gray-100 dark:border-gray-700 animate-float-slow"
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <BarChart3 size={16} className="text-gray-400" />
                                    <span className="text-xs font-semibold text-gray-500">{getTranslation(language, 'engagement')}</span>
                                </div>
                                <div className="flex items-end space-x-1 h-12">
                                    <div className="w-2 bg-blue-200 rounded-t h-6"></div>
                                    <div className="w-2 bg-blue-300 rounded-t h-8"></div>
                                    <div className="w-2 bg-blue-400 rounded-t h-5"></div>
                                    <div className="w-2 bg-blue-500 rounded-t h-10"></div>
                                    <div className="w-2 bg-blue-600 rounded-t h-8"></div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
