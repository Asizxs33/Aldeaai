import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Baby, ArrowLeft, Play, 
    Shapes, Heart, Moon, Hash, CheckCircle, Briefcase,
    Gamepad2, Puzzle, Brain, Hexagon, Image,
    Palette, Calculator, LayoutGrid
} from 'lucide-react';
import { kidsGames, categories } from '../data/kidsGames';

// Icon mapping
const iconMap = {
    Shapes, Heart, Moon, Hash, CheckCircle, Briefcase,
    Gamepad2, Puzzle, Brain, Hexagon, Image,
    Palette, Calculator, LayoutGrid
};

const getIcon = (iconName, size = 24, className = '') => {
    const IconComponent = iconMap[iconName];
    if (IconComponent) {
        return <IconComponent size={size} className={className} />;
    }
    return null;
};

const AldeaKids = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredGames = selectedCategory === 'all'
        ? kidsGames
        : kidsGames.filter(game => game.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/games')}
                        className="flex items-center gap-2 bg-white text-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm border border-slate-200"
                    >
                        <ArrowLeft size={18} />
                        <span className="font-medium">{getTranslation(language, 'backToGames')}</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Baby className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {getTranslation(language, 'aldeaKids')}
                            </h1>
                            <p className="text-slate-500 text-sm">
                                {getTranslation(language, 'aldeaKidsDesc')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                                selectedCategory === category.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                        >
                            {getIcon(category.iconName, 16)}
                            {getTranslation(language, category.nameKey) || category.id}
                        </button>
                    ))}
                </div>

                {/* Games Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedCategory}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {filteredGames.map((game, index) => (
                            <motion.div
                                key={game.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300"
                            >
                                {/* Gradient Header with Icon */}
                                <div className={`h-32 bg-gradient-to-br ${game.gradient} flex items-center justify-center relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-black/5" />
                                    <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        {getIcon(game.iconName, 32, 'text-white')}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                        {getTranslation(language, game.titleKey) || game.id}
                                    </h3>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                        {getTranslation(language, game.descKey)}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                                            game.difficulty === 'easy'
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {getTranslation(language, `difficulty${game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}`) || game.difficulty}
                                        </span>

                                        <button
                                            onClick={() => navigate(`/games/aldea-kids/${game.id}`)}
                                            className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1.5"
                                        >
                                            <Play size={16} fill="currentColor" />
                                            <span className="text-sm font-medium">{getTranslation(language, 'playNow')}</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Empty State */}
                {filteredGames.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Baby className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500">
                            {getTranslation(language, 'noGamesInCategory')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AldeaKids;
