import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import {
    ArrowRight,
    Baby,
    Brain,
    Gamepad2,
    Globe,
    Play,
    Sparkles,
    Target,
    BookOpenCheck,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const Games = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();

    const games = [
        {
            id: 'aldeaWorld',
            icon: Globe,
            titleKey: 'aldeaWorld',
            descKey: 'aldeaWorldDesc',
            color: 'from-cyan-400 to-blue-600',
            glow: 'from-cyan-500/20 to-blue-500/0',
            bg: 'bg-blue-500/10',
            text: 'text-blue-600 dark:text-blue-400',
            dot: 'bg-blue-600',
            label: {
                en: 'Geo Quiz',
                ru: 'Гео-викторина',
                kk: 'Гео-викторина'
            }
        },
        {
            id: 'aldeaKids',
            icon: Baby,
            titleKey: 'aldeaKids',
            descKey: 'aldeaKidsDesc',
            color: 'from-sky-400 to-indigo-500',
            glow: 'from-sky-500/20 to-indigo-500/0',
            bg: 'bg-sky-500/10',
            text: 'text-sky-600 dark:text-sky-400',
            dot: 'bg-sky-500',
            label: {
                en: 'Kids Practice',
                ru: 'Детская практика',
                kk: 'Балалар жаттығуы'
            }
        },
        {
            id: 'aldeaUshqyr',
            icon: Zap,
            titleKey: 'aldeaUshqyr',
            descKey: 'aldeaUshqyrDesc',
            color: 'from-blue-500 to-indigo-600',
            glow: 'from-blue-600/20 to-indigo-600/0',
            bg: 'bg-indigo-500/10',
            text: 'text-indigo-600 dark:text-indigo-400',
            dot: 'bg-indigo-600',
            label: {
                en: 'AI Creator',
                ru: 'AI-конструктор',
                kk: 'AI конструктор'
            }
        },
        {
            id: 'aldeaTapqyr',
            icon: Brain,
            titleKey: 'aldeaTapqyr',
            descKey: 'aldeaTapqyrDesc',
            color: 'from-blue-600 to-cyan-500',
            glow: 'from-blue-600/25 to-cyan-500/0',
            bg: 'bg-cyan-500/10',
            text: 'text-cyan-600 dark:text-cyan-400',
            dot: 'bg-cyan-500',
            label: {
                en: 'Live Class',
                ru: 'Живой класс',
                kk: 'Тікелей сынып'
            }
        },
        {
            id: 'aldeaPulse',
            icon: Target,
            title: {
                en: 'Aldea Pulse',
                ru: 'Aldea Pulse',
                kk: 'Aldea Pulse'
            },
            desc: {
                en: 'Fast reaction arena with combos and high-score chase',
                ru: 'Арена на реакцию с комбо и погоней за рекордом',
                kk: 'Комбо және рекорд үшін жылдам реакция аренасы'
            },
            color: 'from-indigo-500 to-blue-500',
            glow: 'from-indigo-500/20 to-blue-500/0',
            bg: 'bg-indigo-500/10',
            text: 'text-indigo-600 dark:text-indigo-400',
            dot: 'bg-indigo-500',
            label: {
                en: 'Reaction Arena',
                ru: 'Арена реакции',
                kk: 'Реакция аренасы'
            }
        },
        {
            id: 'aldeaStudyQuest',
            icon: BookOpenCheck,
            title: {
                en: 'Aldea Study Quest',
                ru: 'Aldea Study Quest',
                kk: 'Aldea Study Quest'
            },
            desc: {
                en: 'Mixed-subject educational quiz with streaks and explanations',
                ru: 'Учебная викторина по разным предметам с сериями и объяснениями',
                kk: 'Әртүрлі пәндер бойынша сериясы мен түсіндірмесі бар оқу викторинасы'
            },
            color: 'from-blue-500 to-cyan-500',
            glow: 'from-blue-500/25 to-cyan-500/0',
            bg: 'bg-blue-500/10',
            text: 'text-blue-600 dark:text-blue-400',
            dot: 'bg-blue-500',
            label: {
                en: 'Learning Challenge',
                ru: 'Учебный челлендж',
                kk: 'Оқу челленджі'
            }
        }
    ];

    const handleGameClick = (gameId) => {
        if (gameId === 'aldeaWorld') {
            navigate('/games/aldea-world');
        } else if (gameId === 'aldeaKids') {
            navigate('/games/aldea-kids');
        } else if (gameId === 'aldeaUshqyr') {
            navigate('/games/aldea-ushqyr');
        } else if (gameId === 'aldeaTapqyr') {
            navigate('/games/aldea-tapqyr');
        } else if (gameId === 'aldeaPulse') {
            navigate('/games/aldea-pulse');
        } else if (gameId === 'aldeaStudyQuest') {
            navigate('/games/aldea-study-quest');
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12 px-4">
            <div className="relative mt-2 group">
                <div className="relative rounded-[2rem] md:rounded-[3rem] bg-[#0A0F1C] dark:bg-black p-6 md:p-10 overflow-hidden min-h-[220px] md:min-h-[280px] shadow-2xl shadow-blue-900/30 border border-white/5">
                    <div className="absolute inset-0 overflow-hidden rounded-[2rem] md:rounded-[3rem]">
                        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] bg-gradient-to-r from-blue-600/25 to-cyan-500/20 rounded-full blur-[120px]" />
                        <div className="absolute top-0 right-0 w-full h-full bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-blue-300 text-sm font-medium tracking-wide mb-5">
                                <Sparkles size={16} />
                                <span>{getTranslation(language, 'playNow')}</span>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                                    <Gamepad2 className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                        {getTranslation(language, 'gameTitle')}
                                    </h1>
                                    <p className="mt-3 text-base md:text-lg text-blue-100/75 max-w-2xl">
                                        {getTranslation(language, 'gameSubtitle')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { value: '6', label: 'Game Modes' },
                                { value: '3', label: 'Languages' },
                                { value: 'PRO', label: 'Premium Access' }
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md px-4 py-4"
                                >
                                    <div className="text-2xl font-black text-white">{item.value}</div>
                                    <div className="text-sm text-blue-100/70">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {games.map((game, index) => (
                    <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        onClick={() => handleGameClick(game.id)}
                        className="group relative overflow-hidden rounded-[2rem] p-6 sm:p-8 bg-white dark:bg-[#12141c] border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-xl shadow-gray-200/50 dark:shadow-none hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${game.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div className={`w-16 h-16 rounded-2xl ${game.bg} flex items-center justify-center ${game.text} group-hover:scale-105 transition-transform duration-300`}>
                                    <game.icon size={30} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className={`h-2.5 w-2.5 rounded-full ${game.dot}`} />
                                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                        <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 px-3 py-1 text-xs font-bold mb-4">
                                    {game.label?.[language] || game.label?.en || game.label}
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {game.title?.[language] || game.title?.en || game.title || getTranslation(language, game.titleKey)}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6">
                                    {game.desc?.[language] || game.desc?.en || game.desc || getTranslation(language, game.descKey)}
                                </p>
                            </div>

                            <button className={`w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r ${game.color} shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2`}>
                                <Play size={18} fill="currentColor" />
                                {getTranslation(language, 'playNow')}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Games;
