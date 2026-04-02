import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutGrid,
    MessageSquare,
    Video,
    BookOpen,
    History,
    Presentation,
    Gamepad2,
    MessageCircle,
    HelpCircle,
    PlayCircle,
    Image,
    FileText,
    Book,
    LogOut,
    Sparkles,
    Bot,
    Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../translations/translations';

const Sidebar = ({ isOpen, isMobile }) => {
    const location = useLocation();
    const { language } = useLanguage();
    const { user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);

    const userRole = (user?.role || user?.subscription_plan || 'free').toLowerCase();
    const isFree = userRole === 'free';

    // Auto-collapse on Bot page
    const isBotPage = location.pathname === '/bot';
    const isCollapsed = isBotPage && !isHovered;

    const menuItems = [
        { icon: LayoutGrid, label: getTranslation(language, 'shyraqTools'), path: '/dashboard' },
        { icon: Bot, label: getTranslation(language, 'aiTools'), path: '/ai-tools' },
        { icon: MessageSquare, label: getTranslation(language, 'shyraqBot'), path: '/bot' },
        { icon: Video, label: getTranslation(language, 'tulga'), path: '/tulga' },
        { icon: BookOpen, label: getTranslation(language, 'courses'), path: '/courses' },
        { icon: History, label: getTranslation(language, 'history'), path: '/history' },
        { icon: Presentation, label: getTranslation(language, 'presentation'), path: '/presentation', isLocked: isFree },
        { icon: Gamepad2, label: getTranslation(language, 'games'), path: '/games', isLocked: isFree },
    ];

    const bottomItems = [
        { icon: MessageCircle, label: getTranslation(language, 'feedback'), path: '/feedback' },
        { icon: HelpCircle, label: getTranslation(language, 'whatsappHelp'), path: 'https://wa.me/77072852369', external: true },
        { icon: Book, label: getTranslation(language, 'textbooks'), path: '/resources' },
    ];

    const isActive = (path) => location.pathname === path;

    if (!isOpen) return null;

    const sidebarClasses = isMobile
        ? "w-full h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-r border-white/20 dark:border-gray-800 flex flex-col overflow-y-auto"
        : "fixed left-4 top-4 bottom-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/20 dark:border-gray-800 rounded-[2.5rem] flex flex-col z-50 overflow-y-auto scrollbar-hide shadow-2xl";

    return (
        <motion.aside
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => !isMobile && setIsHovered(false)}
            animate={{ width: isMobile ? '100%' : (isCollapsed ? 80 : 288) }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={sidebarClasses}
        >
            {/* Logo Section */}
            <div className="p-8 pb-6 flex items-center justify-center">
                <Link to="/dashboard" className="flex items-center space-x-3 group">
                    <div className="relative w-10 h-10 flex-shrink-0">
                        <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <img src="/icon.png" alt="Aldea AI" className="relative w-full h-full object-contain transform group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 whitespace-nowrap"
                        >
                            Aldea AI
                        </motion.span>
                    )}
                </Link>
            </div>

            {/* Premium CTA */}
            {!isCollapsed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 mb-8"
                >
                    <button className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl py-3 px-4 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                        <div className="flex items-center justify-center space-x-2 relative z-10">
                            <Sparkles size={18} className="text-yellow-300" />
                            <span className="text-sm font-bold tracking-wide">{getTranslation(language, 'buySubscription')}</span>
                        </div>
                    </button>
                </motion.div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-5 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive(item.path)
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <item.icon
                            size={20}
                            strokeWidth={isActive(item.path) ? 2.5 : 2}
                            className={`transition-transform duration-300 flex-shrink-0 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}
                        />
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`relative z-10 whitespace-nowrap ${item.isLocked ? 'opacity-60' : ''}`}
                            >
                                {item.label}
                            </motion.span>
                        )}
                        {item.isLocked && !isCollapsed && (
                            <Lock size={14} className="ml-auto text-gray-400" />
                        )}
                        {isActive(item.path) && !isCollapsed && (
                            <motion.div
                                layoutId="activeIndicator"
                                className="absolute right-3 w-1.5 h-1.5 bg-blue-500 rounded-full"
                            />
                        )}
                    </Link>
                ))}

                <div className="my-6 border-t border-gray-100 dark:border-gray-800 mx-4"></div>

                <div className="space-y-1">
                    {bottomItems.map((item) => (
                        item.external ? (
                            <a
                                key={item.path}
                                href={item.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-5 py-3 rounded-2xl text-gray-400 dark:text-gray-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 group text-sm font-medium`}
                            >
                                <item.icon size={20} strokeWidth={2} />
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap">{item.label}</span>
                                )}
                            </a>
                        ) : (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-5 py-3 rounded-2xl text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 group text-sm font-medium`}
                            >
                                <item.icon size={20} strokeWidth={2} />
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap">{item.label}</span>
                                )}
                            </Link>
                        )
                    ))}
                </div>
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 mx-2">
                <Link to="/login" className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} px-4 py-3 rounded-2xl text-red-500/80 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group text-sm font-medium`}>
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform flex-shrink-0" />
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="whitespace-nowrap"
                        >
                            {getTranslation(language, 'logout')}
                        </motion.span>
                    )}
                </Link>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
