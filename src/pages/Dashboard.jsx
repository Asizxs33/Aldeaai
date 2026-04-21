import React, { useState, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Sparkles, ArrowRight, Zap, Trophy, Target, Star, Lock } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../translations/translations';
import { useNavigate } from 'react-router-dom';

// --- 3D Tilt Card Component ---
const TiltCard = ({ children, className, glowColor, onClick }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useMotionTemplate`calc(${mouseYSpring} * -0.5deg)`;
    const rotateY = useMotionTemplate`calc(${mouseXSpring} * 0.5deg)`;

    // Disable tilt on mobile
    const isMobile = window.innerWidth <= 768;

    const handleMouseMove = (e) => {
        if (!ref.current || isMobile) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct * 20); // Rotation intensity
        y.set(yPct * 20);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    if (isMobile) {
        return (
            <div onClick={onClick} className={`relative group ${className}`}>
                {children}
            </div>
        );
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                transformStyle: "preserve-3d",
                rotateX,
                rotateY,
            }}
            className={`relative group ${className}`}
        >
            <div
                style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
                className="absolute inset-4 rounded-[2rem] bg-black/20 blur-xl group-hover:bg-black/40 transition-colors duration-500"
            />
            {children}
            {/* Glow Effect */}
            <div
                className={`absolute inset-0 rounded-[2.5rem] bg-gradient-to-br ${glowColor} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 -z-10`}
                style={{ transform: "translateZ(-50px)" }}
            />
        </motion.div>
    );
};

const SubjectCard = ({ id, title, color, icon, index, stats, subtitle, path }) => {
    const { language } = useLanguage();
    const navigate = useNavigate();

    return (
        <TiltCard
            className="cursor-pointer"
            glowColor={color}
            onClick={() => {
                if (path) {
                    navigate(path);
                } else {
                    navigate(`/dashboard/subject/${id}`, { state: { title, color, icon } });
                }
            }}
        >
            <div className={`
                relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6
                bg-white dark:bg-[#12141c]
                border border-gray-100 dark:border-gray-800
                shadow-md hover:shadow-xl shadow-gray-200/50 dark:shadow-none
                md:hover:shadow-blue-500/10
                hover:border-blue-500/30
                group cursor-pointer
                transition-all duration-300
                min-h-[140px] md:min-h-0
            `}>
                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none z-0 mix-blend-overlay" style={{ backgroundImage: 'url("/noise.svg")' }}></div>

                {/* Animated Gradient Background */}
                <div className={`absolute -right-32 -top-32 w-80 h-80 bg-gradient-to-br ${color} rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse-slow`}></div>

                {/* Icon */}
                <div className="relative z-10 mb-3 md:mb-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white dark:bg-gray-800/50 shadow-inner border border-white/20 dark:border-white/10 flex items-center justify-center text-xl md:text-3xl md:group-hover:scale-110 transition-transform duration-500">
                        {icon}
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10">
                    <h3 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white mb-1 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-400 transition-all">
                        {title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm leading-snug">{subtitle || getTranslation(language, 'masterBasics')}</p>
                </div>

                {/* Arrow Icon */}
                <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-8 h-8 md:w-9 md:h-9 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow-xl hidden md:flex">
                    <ArrowRight size={16} />
                </div>
            </div>
        </TiltCard>
    );
};

const Dashboard = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const userRole = (user?.role || user?.subscription_plan || 'free').toLowerCase();
    const isFree = userRole === 'free';

    const subjects = [
        { id: 1, type: 'subject', title: getTranslation(language, 'informatics'), color: 'from-cyan-400 to-blue-600', icon: '💻', subtitle: getTranslation(language, 'informaticsSubtitle') },
        { id: 2, type: 'subject', title: getTranslation(language, 'mathematics'), color: 'from-emerald-400 to-green-600', icon: '📐', subtitle: getTranslation(language, 'mathSubtitle') },
        { id: 3, type: 'subject', title: getTranslation(language, 'physics'), color: 'from-violet-400 to-purple-600', icon: '⚡', subtitle: getTranslation(language, 'physicsSubtitle') },
        { id: 4, type: 'subject', title: getTranslation(language, 'chemistry'), color: 'from-amber-400 to-orange-600', icon: '🧪', subtitle: getTranslation(language, 'chemistrySubtitle') },
        { id: 5, type: 'subject', title: getTranslation(language, 'biology'), color: 'from-teal-400 to-emerald-600', icon: '🧬', subtitle: getTranslation(language, 'biologySubtitle') },
        { id: 6, type: 'subject', title: getTranslation(language, 'historySubject'), color: 'from-rose-400 to-red-600', icon: '📜', subtitle: getTranslation(language, 'historySubtitle') },
        { id: 7, type: 'subject', title: getTranslation(language, 'geography'), color: 'from-sky-400 to-indigo-600', icon: '🌍', subtitle: getTranslation(language, 'geographySubtitle') },
        { id: 8, type: 'subject', title: getTranslation(language, 'english'), color: 'from-fuchsia-400 to-pink-600', icon: '🇬🇧', subtitle: getTranslation(language, 'englishSubtitle') },
    ];

    const filteredItems = subjects.filter(item => {
        // Search Filter
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const tabs = [
        { id: 'all', label: getTranslation(language, 'all'), icon: Target, path: null },
        { id: 'presentation', label: getTranslation(language, 'presentation'), icon: Sparkles, path: '/presentation', isLocked: isFree },
        { id: 'bot', label: getTranslation(language, 'shyraqBot'), icon: Zap, path: '/bot' },
        { id: 'history', label: getTranslation(language, 'history'), icon: Trophy, path: '/history' },
    ];

    const handleTabClick = (tab) => {
        if (tab.path) {
            navigate(tab.path);
        } else {
            setActiveTab(tab.id);
        }
    };

    return (
        <div className="space-y-8 md:space-y-16 w-full max-w-[100vw] mx-auto pb-24 overflow-x-hidden">
            {/* Ultra Modern Hero */}
            <div className="relative mt-2 md:mt-4 group px-2 md:px-4">
                {/* Hero Card */}
                <div className="relative rounded-[2rem] md:rounded-[3rem] bg-[#0A0F1C] dark:bg-black p-5 md:p-20 overflow-hidden min-h-[180px] md:min-h-[400px] flex items-center justify-center text-center shadow-2xl shadow-blue-900/40 border border-white/5 w-full mx-auto">

                    {/* Dynamic Background - Strictly clipped */}
                    <div className="absolute inset-0 overflow-hidden rounded-[2rem] md:rounded-[3rem]">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-[120px] animate-pulse-slow"></div>
                        <div className="absolute top-0 right-0 w-full h-full bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto space-y-4 md:space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-blue-400 text-[10px] md:text-sm font-medium tracking-wide animate-float-slow">
                            <Sparkles size={14} className="md:w-4 md:h-4" />
                            <span>{getTranslation(language, 'daysStreak')}</span>
                        </div>

                        <h1 className="text-3xl md:text-6xl lg:text-8xl font-black text-white tracking-tighter leading-[1.1] md:leading-[0.9]">
                            {getTranslation(language, 'subjects')}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">.</span>
                        </h1>

                        <p className="text-sm md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed hidden md:block">
                            {getTranslation(language, 'selectSubjects')}
                        </p>

                        {/* Integrated Search Pill */}
                        <div className="mt-4 md:mt-12 max-w-lg mx-auto relative group/search">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-25 group-focus-within/search:opacity-50 transition duration-500"></div>
                            <div className="relative bg-white dark:bg-[#1E2029] rounded-full p-1.5 md:p-2 flex items-center shadow-2xl">
                                <Search className="w-5 h-5 md:w-6 md:h-6 text-gray-400 ml-3 mr-2" />
                                <input
                                    type="text"
                                    placeholder={getTranslation(language, 'searchKnowledge')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-lg text-gray-900 dark:text-white placeholder-gray-500 h-9 md:h-10"
                                />
                                <button className="p-2 md:p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors">
                                    <ArrowRight size={16} className="md:w-5 md:h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Navigation */}
            <div className="sticky top-4 z-40 flex justify-center w-full px-0">
                <div className="bg-white/80 dark:bg-[#1E2029]/80 backdrop-blur-xl p-1.5 md:p-2 rounded-[1.5rem] md:rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-xl shadow-black/5 flex gap-1 overflow-x-auto max-w-full no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab)}
                            className={`
                                relative px-4 py-2 md:px-6 md:py-3 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center gap-2 text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap
                                ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}
                            `}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="tab-pill"
                                    className="absolute inset-0 bg-blue-600 rounded-[1.2rem] md:rounded-[1.5rem] shadow-lg shadow-blue-500/30"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <tab.icon size={16} className="relative z-10 md:w-[18px] md:h-[18px]" />
                            <span className="relative z-10">{tab.label}</span>
                            {tab.isLocked && <Lock size={12} className="relative z-10 text-gray-400" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3D Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 px-0 md:px-4"
            >
                {filteredItems.map((item, index) => (
                    <SubjectCard key={item.id} {...item} index={index} />
                ))}
            </motion.div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
                <div className="min-h-[200px] md:min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full"></div>
                        <Search size={48} className="relative text-gray-400 dark:text-gray-600 mb-4 md:mb-6 md:w-16 md:h-16" />
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{getTranslation(language, 'ghostTown')}</h3>
                    <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400">{getTranslation(language, 'ghostTownDesc')} "{searchQuery}"</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
