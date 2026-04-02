import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getTranslation } from '../translations/translations';
import { Link } from 'react-router-dom';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { language, changeLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'ru', label: 'Русский' },
        { code: 'kk', label: 'Қазақша' }
    ];

    const currentLang = languages.find(lang => lang.code === language);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 glass shadow-sm transition-all duration-300"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    {/* Logo */}
                    <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                        <img src="/icon.png" alt="Aldea AI" className="w-10 h-10 object-contain rounded-xl" />
                        <span className="text-xl font-bold text-text dark:text-white">Aldea AI</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Language Switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-smooth"
                            >
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentLang.code.toUpperCase()}</span>
                                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                            {isLangDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 py-2">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                changeLanguage(lang.code);
                                                setIsLangDropdownOpen(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors ${language === lang.code ? 'bg-gray-50 dark:bg-gray-700 font-semibold' : ''
                                                }`}
                                        >
                                            <span className="text-sm">{lang.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth text-gray-600 dark:text-gray-300"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Login Button */}
                        <Link
                            to="/login"
                            className="px-6 py-3 text-base font-semibold text-text dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-smooth inline-block text-center"
                        >
                            {getTranslation(language, 'login')}
                        </Link>

                        {/* Contact Button */}
                        <a href="#contact" className="px-8 py-3 text-base font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-smooth shadow-md hover:shadow-lg inline-block text-center cursor-pointer">
                            {getTranslation(language, 'contact')}
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-smooth"
                    >
                        {isMenuOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden py-4 space-y-3"
                        >
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="block w-full px-4 py-2 text-left text-sm font-medium text-text dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-smooth"
                            >
                                {getTranslation(language, 'login')}
                            </Link>
                            <a
                                href="#contact"
                                onClick={() => setIsMenuOpen(false)}
                                className="block w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-smooth text-center"
                            >
                                {getTranslation(language, 'contact')}
                            </a>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
};

export default Header;
