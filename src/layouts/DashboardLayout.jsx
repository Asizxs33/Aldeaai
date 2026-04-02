import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, Globe, Moon, Sun, User, LogOut, CreditCard, MessageSquare, Download, X, Search, Bell, Settings, Users, BarChart3, FileText, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../translations/translations';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Monitor screen size
    React.useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleLanguage = () => {
        const langs = ['kk', 'ru', 'en'];
        const currentIndex = langs.indexOf(language);
        const nextIndex = (currentIndex + 1) % langs.length;
        setLanguage(langs[nextIndex]);
    };

    const isBotPage = location.pathname === '/bot';
    const isFree = (user?.role || user?.subscription_plan || 'free').toLowerCase() === 'free';

    // Close sidebar on route change for mobile
    React.useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);

    return (
        <div className="min-h-screen font-sans flex transition-colors duration-300 bg-[#F3F4F6] dark:bg-[#0B1121] text-gray-900 dark:text-white selection:bg-blue-500/30">
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}>
                <Sidebar isOpen={isMobile ? true : isSidebarOpen} theme={theme} isMobile={isMobile} />
            </div>

            {/* Main Content Wrapper */}
            <div className={`flex-1 transition-all duration-300 w-full max-w-[100vw] overflow-x-hidden ${isBotPage ? (isMobile ? 'ml-0' : 'ml-[96px]') : (isSidebarOpen && !isMobile ? 'ml-[320px]' : 'ml-0')} ${isBotPage ? '' : 'p-2 md:p-6'}`}>
                {/* Header - Hidden on Bot page */}
                {!isBotPage && (
                    <header className="sticky top-4 z-30 rounded-[2rem] px-4 md:px-6 py-4 flex items-center justify-between transition-colors duration-300 mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-white/20 dark:border-gray-700">

                        {/* Left: Sidebar Toggle & Title */}
                        <div className="flex items-center space-x-4 md:space-x-6">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 rounded-xl transition-colors text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
                            >
                                <Menu size={20} />
                            </button>

                            <div className="hidden md:flex items-center space-x-3">
                                <span className={`flex items-center font-bold px-4 py-1.5 rounded-full border text-[10px] md:text-xs tracking-wide uppercase ${isFree
                                    ? 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 shadow-inner'
                                    : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 shadow-sm'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isFree ? 'bg-gray-400' : 'bg-blue-500 animate-pulse'}`}></span>
                                    {getTranslation(language, isFree ? 'limitedAccess' : 'fullAccess')}
                                </span>
                            </div>
                        </div>

                        {/* Center: Search (Optional position) */}
                        <div className="hidden lg:flex flex-1 max-w-md mx-8 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400"
                            />
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <button className="relative p-2 md:p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                            </button>

                            <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

                            <button
                                onClick={toggleTheme}
                                className="p-2 md:p-2.5 rounded-full transition-colors text-gray-500 hover:bg-gray-100 dark:text-yellow-400 dark:hover:bg-gray-700"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            <button
                                onClick={toggleLanguage}
                                className="p-2 md:p-2.5 rounded-full transition-colors flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-10 h-10"
                            >
                                <span className="uppercase text-xs">{language}</span>
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative pl-2">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="group flex items-center space-x-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                >
                                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 p-0.5">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                            <img src={user?.png || '/default-avatar.png'} alt="User" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-none">{user?.email?.split('@')[0] || 'User'}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">
                                            {(() => {
                                                const rawRole = (user?.role || user?.subscription_plan || 'free').toLowerCase();
                                                const planName = rawRole === 'pro' ? getTranslation(language, 'professional') :
                                                    rawRole === 'free' ? getTranslation(language, 'basic') :
                                                        rawRole === 'ultra' ? 'Ultra' :
                                                            rawRole === 'admin' ? 'Admin' :
                                                                rawRole.charAt(0).toUpperCase() + rawRole.slice(1);
                                                return `${planName} Plan`;
                                            })()}
                                        </p>
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <>
                                            {/* Backdrop */}
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsProfileOpen(false)}
                                            />

                                            {/* Dropdown Menu */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 top-14 md:top-16 w-72 rounded-3xl shadow-2xl z-50 overflow-hidden border border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl"
                                            >
                                                {/* Profile Header */}
                                                <div className="p-6 flex flex-col items-center justify-center border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-violet-600 p-1 mb-3 shadow-lg">
                                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden bg-white">
                                                            <img src={user?.png || '/default-avatar.png'} alt="User" className="w-full h-full object-cover" />
                                                        </div>
                                                    </div>
                                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{user?.email?.split('@')[0] || 'User'}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'user@aldea.kz'}</p>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="p-3 space-y-1">
                                                    <ProfileMenuItem icon={User} text={getTranslation(language, 'myAccount')} onClick={() => navigate('/account')} />
                                                    <ProfileMenuItem icon={CreditCard} text={getTranslation(language, 'buyTariff')} onClick={() => navigate('/subscription')} />
                                                    <ProfileMenuItem icon={MessageSquare} text={getTranslation(language, 'leaveFeedback')} onClick={() => navigate('/feedback')} />
                                                    <ProfileMenuItem icon={Download} text={getTranslation(language, 'installShyraq')} onClick={() => navigate('/install')} />

                                                    {/* Admin Panel Section - Only visible to admins */}
                                                    {user?.role?.toLowerCase() === 'admin' && (
                                                        <>
                                                            <div className="h-[1px] my-2 bg-gray-100 dark:bg-gray-700 mx-3" />
                                                            <div className="px-3 py-2">
                                                                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-red-500">
                                                                    <Shield size={12} />
                                                                    {getTranslation(language, 'adminPanel') || 'Admin Panel'}
                                                                </span>
                                                            </div>
                                                            <ProfileMenuItem
                                                                icon={BarChart3}
                                                                text={getTranslation(language, 'adminDashboard') || 'Dashboard'}
                                                                onClick={() => { setIsProfileOpen(false); navigate('/admin/dashboard'); }}
                                                            />
                                                            <ProfileMenuItem
                                                                icon={Users}
                                                                text={getTranslation(language, 'userManagement') || 'Users'}
                                                                onClick={() => { setIsProfileOpen(false); navigate('/admin/users'); }}
                                                            />
                                                            <ProfileMenuItem
                                                                icon={FileText}
                                                                text={getTranslation(language, 'analytics') || 'Analytics'}
                                                                onClick={() => { setIsProfileOpen(false); navigate('/admin/analytics'); }}
                                                            />
                                                            <ProfileMenuItem
                                                                icon={CreditCard}
                                                                text={getTranslation(language, 'subscriptions') || 'Subscriptions'}
                                                                onClick={() => { setIsProfileOpen(false); navigate('/admin/subscriptions'); }}
                                                            />
                                                            <ProfileMenuItem
                                                                icon={Settings}
                                                                text={getTranslation(language, 'adminSettings') || 'Settings'}
                                                                onClick={() => { setIsProfileOpen(false); navigate('/admin/settings'); }}
                                                            />
                                                        </>
                                                    )}

                                                    <div className="h-[1px] my-2 bg-gray-100 dark:bg-gray-700 mx-3" />
                                                    <ProfileMenuItem icon={LogOut} text={getTranslation(language, 'logout')} isDanger onClick={() => { logout(); navigate('/login'); }} />
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className={`${isBotPage ? 'h-screen' : 'md:px-4 pb-8 min-h-[calc(100vh-140px)]'}`}>
                    {children}
                </main>

                {/* Dashboard Footer - Hidden on Bot page */}
                {!isBotPage && (
                    <footer className="px-8 py-6 text-center text-gray-400 text-sm font-medium">
                        © 2026 Aldea Academy. All rights reserved.
                    </footer>
                )}
            </div>
        </div>
    );
};

const ProfileMenuItem = ({ icon: Icon, text, isDanger = false, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${isDanger
            ? 'text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }`}>
        <Icon size={18} strokeWidth={2} />
        <span>{text}</span>
    </button>
);

export default DashboardLayout;
