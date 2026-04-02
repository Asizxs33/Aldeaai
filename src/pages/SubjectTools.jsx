import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, FileText, CheckSquare, PenTool, BookOpen, Mic, Brain, Film, Music, ArrowRight, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';

const ToolCard = ({ title, icon: Icon, description, onClick, index, color }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="group relative cursor-pointer"
        >
            <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-[#12141c] p-6 min-h-[200px] md:h-[240px] border border-gray-100 dark:border-gray-800 hover:border-blue-500/30 transition-all duration-300 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between">

                {/* Background Gradient Blob */}
                <div className={`absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br ${color} rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>

                {/* Top Section */}
                <div className="relative z-10 flex justify-between items-start">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={24} className="text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 mt-4 md:mt-0">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-500 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 md:line-clamp-2">
                        {description}
                    </p>
                </div>

                {/* Action Icon */}
                <div className="absolute bottom-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight size={16} className="text-blue-500" />
                </div>
            </div>
        </motion.div>
    );
};

const SubjectTools = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { title, color, icon } = location.state || { title: 'Subject', color: 'from-blue-500 to-cyan-500', icon: '📚' };
    const { language } = useLanguage();

    const tools = [
        { id: 'kmj', title: getTranslation(language, 'kmj'), icon: FileText, description: getTranslation(language, 'kmjDesc') },

        { id: 'test', title: getTranslation(language, 'createTest'), icon: CheckSquare, description: getTranslation(language, 'createTestDesc') },
        { id: 'essay', title: getTranslation(language, 'essayHelper'), icon: PenTool, description: getTranslation(language, 'essayHelperDesc') },
        { id: 'summary', title: getTranslation(language, 'summarizer'), icon: BookOpen, description: getTranslation(language, 'summarizerDesc') },
        { id: 'presentation', title: getTranslation(language, 'presentationPlan'), icon: Film, description: getTranslation(language, 'presentationPlanDesc') },
        { id: 'explanation', title: getTranslation(language, 'conceptExplainer'), icon: Brain, description: getTranslation(language, 'conceptExplainerDesc') },
        { id: 'song', title: getTranslation(language, 'educationalSong'), icon: Music, description: getTranslation(language, 'educationalSongDesc') },
        { id: 'speech', title: getTranslation(language, 'speechWriter'), icon: Mic, description: getTranslation(language, 'speechWriterDesc') },
    ];

    return (
        <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-20">
            {/* Header Area */}
            <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-[#0A0F1C] p-6 md:p-14 min-h-[200px] md:min-h-[300px] flex items-center shadow-2xl border border-white/5 mx-2 md:mx-0">
                {/* Dynamic Background */}
                <div className={`absolute top-0 right-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-gradient-to-br ${color} opacity-20 blur-[80px] md:blur-[120px] rounded-full pointer-events-none -mr-20 -mt-20 md:-mr-40 md:-mt-40`}></div>

                <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all text-xs md:text-sm font-medium border border-white/10"
                    >
                        <ChevronLeft size={16} />
                        {getTranslation(language, 'backToSubjects')}
                    </button>
                </div>

                <div className="relative z-10 max-w-4xl pt-8 md:pt-10">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                        <div className="text-4xl md:text-6xl animate-bounce-slow filter drop-shadow-2xl">{icon}</div>
                        <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80 border border-white/10">
                            {getTranslation(language, 'aiPowerhouse')}
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none mb-3 md:mb-4">
                        {title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{getTranslation(language, 'tools')}</span>
                    </h1>
                    <p className="text-sm md:text-xl text-gray-400 font-medium max-w-2xl leading-relaxed">
                        {getTranslation(language, 'selectToolDesc')} {title}.
                    </p>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-2 md:px-4">
                {tools.map((tool, index) => (
                    <ToolCard
                        key={tool.id}
                        {...tool}
                        index={index}
                        color={color}
                        onClick={() => navigate(`/dashboard/tool/${tool.id}`, { state: { toolTitle: tool.title, subjectTitle: title, color } })}
                    />
                ))}
            </div>
        </div>
    );
};

export default SubjectTools;
