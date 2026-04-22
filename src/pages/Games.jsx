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
    Star,
    Users,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const Games = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const copy = {
        en: {
            eyebrow: 'Smart Game Library',
            title: 'Games that feel like real learning products',
            subtitle: 'Choose a mode for class competition, solo practice, or fast creative drills with a stronger visual experience.',
            stats: [
                { label: 'Game modes', value: '4' },
                { label: 'Languages', value: '3' },
                { label: 'Best for', value: 'Class + solo' }
            ],
            featuredLabel: 'Featured',
            featuredTitle: 'Tapqyr live quiz',
            featuredDescription: 'Run a classroom session on the big screen while students answer from their own devices.',
            featuredPoints: ['Live host mode', 'Join by code', 'Leaderboard energy'],
            primaryCta: 'Open featured game',
            secondaryTitle: 'Pick the right format',
            secondaryText: 'Each mode now has a clearer purpose, audience, and play style.',
            metaLabels: {
                audience: 'Audience',
                mode: 'Mode'
            },
            tags: {
                featured: 'Top choice',
                classroom: 'Classroom',
                kids: 'Kids',
                creative: 'Creative',
                solo: 'Solo',
                multiplayer: 'Multiplayer'
            }
        },
        ru: {
            eyebrow: 'Библиотека умных игр',
            title: 'Игры, которые выглядят как настоящий образовательный продукт',
            subtitle: 'Выбирайте режим для класса, самостоятельной практики или быстрых креативных заданий с более сильной подачей.',
            stats: [
                { label: 'Режимов', value: '4' },
                { label: 'Языков', value: '3' },
                { label: 'Формат', value: 'Класс + соло' }
            ],
            featuredLabel: 'Главная игра',
            featuredTitle: 'Tapqyr live quiz',
            featuredDescription: 'Запускайте викторину на большом экране, а ученики отвечают со своих устройств.',
            featuredPoints: ['Режим ведущего', 'Вход по коду', 'Таблица лидеров'],
            primaryCta: 'Открыть главную игру',
            secondaryTitle: 'Выберите правильный формат',
            secondaryText: 'Теперь у каждого режима более понятная цель, аудитория и стиль игры.',
            metaLabels: {
                audience: 'Для кого',
                mode: 'Формат'
            },
            tags: {
                featured: 'Лучший выбор',
                classroom: 'Для класса',
                kids: 'Для детей',
                creative: 'Креатив',
                solo: 'Соло',
                multiplayer: 'Мультиплеер'
            }
        },
        kk: {
            eyebrow: 'Зияткер ойындар кітапханасы',
            title: 'Нағыз білім беру өнімі сияқты көрінетін ойындар',
            subtitle: 'Сыныпқа, жеке жаттығуға немесе жылдам креатив тапсырмаларға лайық режимді таңдаңыз.',
            stats: [
                { label: 'Режим', value: '4' },
                { label: 'Тіл', value: '3' },
                { label: 'Формат', value: 'Сынып + жеке' }
            ],
            featuredLabel: 'Негізгі ойын',
            featuredTitle: 'Tapqyr live quiz',
            featuredDescription: 'Үлкен экранда викторина жүргізіңіз, ал оқушылар өз құрылғыларынан жауап береді.',
            featuredPoints: ['Жүргізуші режимі', 'Кодпен кіру', 'Көшбасшылар кестесі'],
            primaryCta: 'Негізгі ойынды ашу',
            secondaryTitle: 'Дұрыс форматты таңдаңыз',
            secondaryText: 'Енді әр режимнің мақсаты, аудиториясы және ойын стилі анығырақ.',
            metaLabels: {
                audience: 'Аудитория',
                mode: 'Формат'
            },
            tags: {
                featured: 'Үздік таңдау',
                classroom: 'Сыныпқа',
                kids: 'Балаларға',
                creative: 'Креатив',
                solo: 'Жеке',
                multiplayer: 'Көп ойыншы'
            }
        }
    }[language] || {
        eyebrow: 'Smart Game Library',
        title: 'Games that feel like real learning products',
        subtitle: 'Choose a mode for class competition, solo practice, or fast creative drills with a stronger visual experience.',
        stats: [
            { label: 'Game modes', value: '4' },
            { label: 'Languages', value: '3' },
            { label: 'Best for', value: 'Class + solo' }
        ],
        featuredLabel: 'Featured',
        featuredTitle: 'Tapqyr live quiz',
        featuredDescription: 'Run a classroom session on the big screen while students answer from their own devices.',
        featuredPoints: ['Live host mode', 'Join by code', 'Leaderboard energy'],
        primaryCta: 'Open featured game',
        secondaryTitle: 'Pick the right format',
        secondaryText: 'Each mode now has a clearer purpose, audience, and play style.',
        metaLabels: {
            audience: 'Audience',
            mode: 'Mode'
        },
        tags: {
            featured: 'Top choice',
            classroom: 'Classroom',
            kids: 'Kids',
            creative: 'Creative',
            solo: 'Solo',
            multiplayer: 'Multiplayer'
        }
    };

    const games = [
        {
            id: 'aldeaWorld',
            icon: Globe,
            titleKey: 'aldeaWorld',
            descKey: 'aldeaWorldDesc',
            color: 'from-sky-500 via-cyan-400 to-teal-400',
            shadow: 'shadow-cyan-500/25',
            bg: 'bg-sky-500/10',
            text: 'text-sky-700 dark:text-sky-300',
            border: 'border-sky-200/80 dark:border-sky-500/20',
            audience: copy.tags.solo,
            mode: copy.tags.multiplayer,
            badge: copy.tags.classroom
        },
        {
            id: 'aldeaKids',
            icon: Baby,
            titleKey: 'aldeaKids',
            descKey: 'aldeaKidsDesc',
            color: 'from-emerald-500 via-lime-400 to-yellow-300',
            shadow: 'shadow-emerald-500/25',
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-700 dark:text-emerald-300',
            border: 'border-emerald-200/80 dark:border-emerald-500/20',
            audience: copy.tags.kids,
            mode: copy.tags.solo,
            badge: copy.tags.featured
        },
        {
            id: 'aldeaUshqyr',
            icon: Zap,
            titleKey: 'aldeaUshqyr',
            descKey: 'aldeaUshqyrDesc',
            color: 'from-amber-400 via-orange-500 to-rose-500',
            shadow: 'shadow-orange-500/25',
            bg: 'bg-orange-500/10',
            text: 'text-orange-700 dark:text-orange-300',
            border: 'border-orange-200/80 dark:border-orange-500/20',
            audience: copy.tags.creative,
            mode: copy.tags.solo,
            badge: copy.tags.creative
        },
        {
            id: 'aldeaTapqyr',
            icon: Brain,
            titleKey: 'aldeaTapqyr',
            descKey: 'aldeaTapqyrDesc',
            color: 'from-fuchsia-500 via-rose-500 to-amber-400',
            shadow: 'shadow-fuchsia-500/25',
            bg: 'bg-fuchsia-500/10',
            text: 'text-fuchsia-700 dark:text-fuchsia-300',
            border: 'border-fuchsia-200/80 dark:border-fuchsia-500/20',
            audience: copy.tags.classroom,
            mode: copy.tags.multiplayer,
            badge: copy.tags.featured
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
        }
    };

    const featuredGame = games.find((game) => game.id === 'aldeaTapqyr');

    return (
        <div className="max-w-7xl mx-auto pb-14 px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 dark:border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(236,72,153,0.18),_transparent_26%),linear-gradient(135deg,_#fff7ed_0%,_#ffffff_45%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.15),_transparent_24%),radial-gradient(circle_at_80%_20%,_rgba(236,72,153,0.14),_transparent_22%),linear-gradient(135deg,_#111827_0%,_#0f172a_45%,_#020617_100%)] p-6 sm:p-8 lg:p-10 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
                <div className="absolute inset-0 pointer-events-none opacity-50">
                    <div className="absolute -top-24 right-10 w-56 h-56 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-400/10" />
                    <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full bg-rose-300/25 blur-3xl dark:bg-rose-500/10" />
                </div>

                <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            {copy.eyebrow}
                        </div>

                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-900 via-slate-700 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                                <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                    {copy.title}
                                </h1>
                                <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                                    {copy.subtitle}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {copy.stats.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-white/5 backdrop-blur px-4 py-4"
                                >
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-[1.75rem] border border-slate-200/80 dark:border-white/10 bg-slate-950 text-white p-6 sm:p-7 shadow-2xl"
                    >
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white/90">
                                <Star className="w-4 h-4 text-amber-300" fill="currentColor" />
                                {copy.featuredLabel}
                            </div>
                            <Users className="w-5 h-5 text-white/50" />
                        </div>

                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${featuredGame.color} flex items-center justify-center mb-5 shadow-xl ${featuredGame.shadow}`}>
                            <featuredGame.icon className="w-8 h-8 text-white" />
                        </div>

                        <h2 className="text-2xl font-black mb-2">{copy.featuredTitle}</h2>
                        <p className="text-white/65 mb-5 leading-relaxed">{copy.featuredDescription}</p>

                        <div className="space-y-3 mb-6">
                            {copy.featuredPoints.map((point) => (
                                <div key={point} className="flex items-center gap-3 text-sm text-white/85">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                    <span>{point}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleGameClick(featuredGame.id)}
                            className={`w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r ${featuredGame.color} shadow-lg ${featuredGame.shadow} flex items-center justify-center gap-2`}
                        >
                            <Play size={18} fill="currentColor" />
                            {copy.primaryCta}
                        </button>
                    </motion.div>
                </div>
            </div>

            <div className="flex items-end justify-between gap-4 mt-10 mb-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        {copy.secondaryTitle}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                        {copy.secondaryText}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {games.map((game, index) => (
                    <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleGameClick(game.id)}
                        className={`group relative rounded-[2rem] p-6 sm:p-8 border ${game.border} bg-white/95 dark:bg-[#12141c] hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl overflow-hidden cursor-pointer`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-slate-200/40 dark:bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start gap-4 mb-6">
                                <div className={`w-16 h-16 rounded-2xl ${game.bg} flex items-center justify-center ${game.text} group-hover:scale-110 transition-transform duration-300`}>
                                    <game.icon size={32} />
                                </div>

                                <div className="flex flex-wrap justify-end gap-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                        {game.badge}
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-gray-700 transition-colors">
                                        <ArrowRight size={20} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-500 dark:group-hover:from-white dark:group-hover:to-slate-300 transition-all">
                                    {getTranslation(language, game.titleKey)}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 min-h-[48px]">
                                    {getTranslation(language, game.descKey)}
                                </p>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="rounded-2xl bg-slate-50 dark:bg-white/5 px-4 py-3">
                                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-1">
                                            {copy.metaLabels.audience}
                                        </div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{game.audience}</div>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 dark:bg-white/5 px-4 py-3">
                                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-1">
                                            {copy.metaLabels.mode}
                                        </div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{game.mode}</div>
                                    </div>
                                </div>
                            </div>

                            <button className={`w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r ${game.color} transition-all duration-300 shadow-lg ${game.shadow} flex items-center justify-center gap-2`}>
                                <Play size={20} fill="currentColor" />
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
