import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Code, PenTool, Palette, GraduationCap, Rocket, Video,
    ExternalLink, Star, Sparkles, MousePointer, Code2, Zap, Terminal,
    MessageSquare, Bot, FileText, Edit, Image, Layers, BookOpen,
    Globe, FileQuestion, CheckCircle, CheckSquare, Layout, Film,
    User, Server, Search, Wind, RefreshCw, Wand2, Scissors,
    Maximize2, Brain, HelpCircle, Lightbulb, Book, Calendar, Clock,
    Wrench, Mic, Headphones, Music, Volume2, Briefcase, Gavel, Network,
    MessageCircle, FileSearch, Box, GitBranch, TrendingUp, BarChart3,
    Users, ShoppingBag, Flower2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { aiToolsCategories } from '../data/aiTools';
import { toolLogoUrls, getToolLogo } from '../utils/toolLogos';
import { getToolDescription } from '../utils/toolTranslations';

// Icon mapping
const iconMap = {
    Code, PenTool, Palette, GraduationCap, Rocket, Video,
    MousePointer, Code2, Zap, Terminal, MessageSquare, Bot, FileText,
    Edit, Image, Sparkles, Layers, BookOpen, Globe, FileQuestion,
    CheckCircle, CheckSquare, Layout, Film, User, Server, Search, Wind,
    RefreshCw, Wand2, Scissors, Maximize2, Brain, HelpCircle,
    Lightbulb, Book, Calendar, Clock, Wrench, Mic, Headphones, Music,
    Volume2, Briefcase, Gavel, Network, MessageCircle, FileSearch, Box,
    GitBranch, TrendingUp, BarChart3, Users, ShoppingBag, Flower2
};

const getIcon = (iconName, size = 24, className = '') => {
    const IconComponent = iconMap[iconName];
    if (IconComponent) {
        return <IconComponent size={size} className={className} />;
    }
    return <Sparkles size={size} className={className} />;
};

const AITools = () => {
    const { language } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState(null);

    const categories = aiToolsCategories.map(cat => ({
        ...cat,
        name: getTranslation(language, cat.nameKey),
        description: getTranslation(language, cat.descriptionKey),
        icon: iconMap[cat.icon] || Sparkles
    }));

    const handleCategoryClick = (category) => {
        if (selectedCategory?.id === category.id) {
            setSelectedCategory(null);
        } else {
            const fullCategory = aiToolsCategories.find(cat => cat.id === category.id);
            setSelectedCategory({
                ...category,
                tools: fullCategory?.tools || []
            });
        }
    };

    const handleToolClick = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-2 md:px-4">
            {/* Header */}
            <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-[#0A0F1C] p-6 md:p-14 min-h-[200px] md:min-h-[300px] flex items-center shadow-2xl border border-white/5 mt-4 md:mt-6">
                {/* Dynamic Background */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-gradient-to-br from-blue-500 to-purple-500 opacity-20 blur-[80px] md:blur-[120px] rounded-full pointer-events-none -mr-20 -mt-20 md:-mr-40 md:-mt-40"></div>

                <div className="relative z-10 max-w-4xl pt-2 md:pt-10">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                        <div className="text-4xl md:text-6xl animate-bounce-slow filter drop-shadow-2xl">🤖</div>
                        <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80 border border-white/10">
                            {getTranslation(language, 'aiTools')}
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none mb-3 md:mb-4">
                        {getTranslation(language, 'aiToolsTitle')}
                    </h1>
                    <p className="text-sm md:text-xl text-gray-400 font-medium max-w-2xl leading-relaxed">
                        {getTranslation(language, 'aiToolsSubtitle')}
                    </p>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-12">
                {categories.map((category, index) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory?.id === category.id;

                    return (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleCategoryClick(category)}
                            className={`group relative cursor-pointer ${isSelected ? 'md:col-span-2 lg:col-span-3' : ''}`}
                        >
                            <div className={`relative overflow-hidden rounded-[2rem] bg-white dark:bg-[#12141c] p-6 md:p-6 border border-gray-100 dark:border-gray-800 transition-all duration-300 shadow-xl shadow-gray-200/50 dark:shadow-none ${isSelected
                                ? 'border-blue-500/50 shadow-2xl shadow-blue-500/20'
                                : 'hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10'
                                }`}>
                                {/* Background Gradient Blob */}
                                <div className={`absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br ${category.gradient} rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>

                                {/* Top Section */}
                                <div className="relative z-10 flex justify-between items-start mb-3 md:mb-4">
                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={24} className="text-white" />
                                    </div>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2 h-2 bg-white rounded-full"
                                            />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-500 transition-colors">
                                        {category.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-4">
                                        {category.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-blue-500 font-medium">
                                        <span>{category.tools.length} {getTranslation(language, 'tools')}</span>
                                        <ExternalLink size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Tools List - под категорией */}
                            {isSelected && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {category.tools.map((tool, toolIndex) => {
                                            const logoUrl = toolLogoUrls[tool.id] || getToolLogo(tool.url);
                                            const translatedDescription = getToolDescription(tool.id, language) || tool.description;
                                            return (
                                                <motion.div
                                                    key={tool.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: toolIndex * 0.05 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToolClick(tool.url);
                                                    }}
                                                    className="group/tool relative overflow-hidden rounded-xl bg-white dark:bg-[#12141c] p-4 border border-gray-100 dark:border-gray-800 hover:border-blue-500/50 transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer"
                                                >
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden`}>
                                                                <img
                                                                    src={logoUrl}
                                                                    alt={tool.name}
                                                                    className="w-7 h-7 object-contain"
                                                                    onError={(e) => {
                                                                        e.target.src = getToolLogo(tool.url);
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start gap-2 flex-wrap">
                                                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover/tool:text-blue-500 transition-colors">
                                                                        {tool.name}
                                                                    </h4>
                                                                    {tool.isPopular && (
                                                                        <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded-full flex items-center gap-1 flex-shrink-0">
                                                                            <Star size={10} className="fill-yellow-500" />
                                                                            {getTranslation(language, 'popular')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                                            {translatedDescription}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 text-xs text-blue-500 font-medium mt-auto">
                                                            <span>{getTranslation(language, 'visitTool')}</span>
                                                            <ExternalLink size={12} />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default AITools;
