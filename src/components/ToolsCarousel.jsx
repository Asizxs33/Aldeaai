import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Layout, Mic, PenTool, BookOpen, ChevronUp, ChevronDown, CheckCircle2, Zap, Brain, Wand2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';

const tools = [
    {
        icon: Layout,
        titleKey: 'quizGenerator',
        descKey: 'quizGeneratorDesc',
        color: 'from-blue-500 to-indigo-600',
        iconColor: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        features: ['Multiple Choice', 'True/False', 'AI Evaluation']
    },
    {
        icon: Mic,
        titleKey: 'presentationMaker',
        descKey: 'presentationMakerDesc',
        color: 'from-purple-500 to-pink-600',
        iconColor: 'text-purple-600',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        features: ['Auto Design', 'Smart Layouts', 'Instant Export']
    },
    {
        icon: PenTool,
        titleKey: 'lessonPlanner',
        descKey: 'lessonPlannerDesc',
        color: 'from-orange-500 to-red-600',
        iconColor: 'text-orange-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        features: ['Curriculum Aligned', 'Activity Ideas', 'Time Saving']
    },
    {
        icon: BookOpen,
        titleKey: 'shyraqBot',
        descKey: 'shyraqBotDesc',
        color: 'from-green-500 to-emerald-600',
        iconColor: 'text-emerald-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        features: ['24/7 Assistant', 'Teaching Tips', 'Resource Finder']
    }
];

const ToolsCarousel = () => {
    const { language } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const paginate = (newDirection) => {
        const newIndex = currentIndex + newDirection;
        if (newIndex >= 0 && newIndex < tools.length) {
            setDirection(newDirection);
            setCurrentIndex(newIndex);
        }
    };

    const jumpTo = (index) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset, velocity) => {
        return Math.abs(offset) * velocity;
    };

    const variants = {
        enter: (direction) => ({
            y: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        exit: (direction) => ({
            zIndex: 0,
            y: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        })
    };

    const currentTool = tools[currentIndex];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50 transition-colors duration-300 overflow-hidden relative">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    {/* Left Side: Sticky Content */}
                    <div className="lg:w-1/3">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full mb-6">
                                <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
                                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">{getTranslation(language, 'powerfulTools')}</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                                {getTranslation(language, 'toolsTitle')}
                            </h2>
                            <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                {getTranslation(language, 'toolsSubtitle')}
                            </p>
                            <button className="group flex items-center space-x-2 text-lg font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                <span>{getTranslation(language, 'exploreTools')}</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Side: Vertical Swiper */}
                    <div className="lg:w-2/3 w-full flex gap-8 items-center h-[400px]">

                        <div className="flex-1 relative h-full">
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    drag="y"
                                    dragConstraints={{ top: 0, bottom: 0 }}
                                    dragElastic={1}
                                    onDragEnd={(e, { offset, velocity }) => {
                                        const swipe = swipePower(offset.y, velocity.y);

                                        if (swipe < -swipeConfidenceThreshold) {
                                            paginate(1);
                                        } else if (swipe > swipeConfidenceThreshold) {
                                            paginate(-1);
                                        }
                                    }}
                                    className="absolute w-full h-full"
                                >
                                    <div className="h-full w-full bg-white dark:bg-gray-800 rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-blue-900/10 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row items-center gap-8 relative cursor-grab active:cursor-grabbing">

                                        {/* Background Decor */}
                                        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${currentTool.color} opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none`}></div>

                                        {/* Icon Section */}
                                        <motion.div
                                            initial={{ scale: 0.8, rotate: -10 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", duration: 0.6 }}
                                            className={`w-28 h-28 md:w-36 md:h-36 flex-shrink-0 ${currentTool.bg} rounded-3xl flex items-center justify-center shadow-inner relative z-10`}
                                        >
                                            <currentTool.icon className={`w-14 h-14 md:w-16 md:h-16 ${currentTool.iconColor}`} />
                                        </motion.div>

                                        {/* Content Section */}
                                        <div className="text-center md:text-left flex-1 relative z-10">
                                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                                {getTranslation(language, currentTool.titleKey)}
                                            </h3>

                                            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                                                {getTranslation(language, currentTool.descKey)}
                                            </p>

                                            {/* Feature Icons */}
                                            <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
                                                {currentTool.features && currentTool.features.map((feature, idx) => (
                                                    <div key={idx} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-600/50">
                                                        <CheckCircle2 size={16} className={`${currentTool.iconColor} fill-current/10`} />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`px-6 py-2.5 rounded-xl bg-gradient-to-r ${currentTool.color} text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow inline-flex items-center gap-2`}
                                            >
                                                <span>Try now</span>
                                                <ChevronRight size={18} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation Sidebar */}
                        <div className="flex flex-col gap-3 z-20">
                            <button
                                onClick={() => paginate(-1)}
                                disabled={currentIndex === 0}
                                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${currentIndex === 0 ? 'opacity-30' : ''}`}
                            >
                                <ChevronUp className="w-6 h-6 text-gray-400" />
                            </button>

                            <div className="flex flex-col gap-4 py-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-3 shadow-xl border border-gray-100 dark:border-gray-700/50">
                                {tools.map((tool, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => jumpTo(idx)}
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 relative group
                                            ${tool.bg}
                                            ${idx === currentIndex
                                                ? 'scale-110 shadow-lg ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-blue-500/50'
                                                : 'opacity-60 hover:opacity-100 hover:scale-105 grayscale hover:grayscale-0'
                                            }`}
                                    >
                                        <tool.icon className={`w-7 h-7 ${tool.iconColor}`} />

                                        {idx === currentIndex && (
                                            <motion.div

                                                layoutId="active-indicator"
                                                className="absolute -left-1.5 w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => paginate(1)}
                                disabled={currentIndex === tools.length - 1}
                                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${currentIndex === tools.length - 1 ? 'opacity-30' : ''}`}
                            >
                                <ChevronDown className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default ToolsCarousel;
