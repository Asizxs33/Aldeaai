import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { Gamepad2, Globe, Baby, Zap, Brain, Play, ArrowRight } from 'lucide-react';
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
            color: 'from-blue-500 to-cyan-400',
            shadow: 'shadow-blue-500/30',
            bg: 'bg-blue-500/10',
            text: 'text-blue-600',
            border: 'border-blue-200'
        },
        {
            id: 'aldeaKids',
            icon: Baby,
            titleKey: 'aldeaKids',
            descKey: 'aldeaKidsDesc',
            color: 'from-green-500 to-emerald-400',
            shadow: 'shadow-green-500/30',
            bg: 'bg-green-500/10',
            text: 'text-green-600',
            border: 'border-green-200'
        },
        {
            id: 'aldeaUshqyr',
            icon: Zap,
            titleKey: 'aldeaUshqyr',
            descKey: 'aldeaUshqyrDesc',
            color: 'from-amber-500 to-orange-400',
            shadow: 'shadow-orange-500/30',
            bg: 'bg-orange-500/10',
            text: 'text-orange-600',
            border: 'border-orange-200'
        },
        {
            id: 'aldeaTapqyr',
            icon: Brain,
            titleKey: 'aldeaTapqyr',
            descKey: 'aldeaTapqyrDesc',
            color: 'from-purple-500 to-indigo-400',
            shadow: 'shadow-purple-500/30',
            bg: 'bg-purple-500/10',
            text: 'text-purple-600',
            border: 'border-purple-200'
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

    return (
        <div className="max-w-6xl mx-auto pb-12 px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Gamepad2 className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {getTranslation(language, 'gameTitle')}
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                        {getTranslation(language, 'gameSubtitle')}
                    </p>
                </div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {games.map((game, index) => (
                    <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleGameClick(game.id)}
                        className="group relative bg-white dark:bg-[#12141c] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 hover:border-transparent transition-all duration-300 hover:shadow-2xl overflow-hidden cursor-pointer"
                    >
                        {/* Hover Gradient Border Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-16 h-16 rounded-2xl ${game.bg} flex items-center justify-center ${game.text} group-hover:scale-110 transition-transform duration-300`}>
                                    <game.icon size={32} />
                                </div>
                                <div className={`w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors`}>
                                    <ArrowRight size={20} className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-300 transition-all">
                                    {getTranslation(language, game.titleKey)}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 line-clamp-2">
                                    {getTranslation(language, game.descKey)}
                                </p>
                            </div>

                            <button className={`w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r ${game.color} opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg ${game.shadow} flex items-center justify-center gap-2`}>
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
