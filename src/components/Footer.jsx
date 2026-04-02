import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram, Mail, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';

const Footer = () => {
    const { language } = useLanguage();

    return (
        <footer className="bg-[#1a103c] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-t-[3rem] mt-4">
            {/* Background elements - Adapted for Dark Theme */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none opacity-50"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid md:grid-cols-12 gap-12 mb-20">
                    {/* Brand Section */}
                    <div className="md:col-span-5 flex flex-col items-start">
                        <div className="flex items-center space-x-3 mb-8">
                            <img src="/icon.png" alt="Aldea AI" className="w-14 h-14 object-contain transform rotate-3 hover:rotate-6 transition-transform duration-300" />
                            <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Aldea AI
                            </span>
                        </div>
                        <p className="text-gray-400 text-lg mb-10 max-w-sm leading-relaxed">
                            {getTranslation(language, 'footerTagline')}
                        </p>

                        {/* Newsletter Input - Dark Theme Style */}
                        <div className="w-full max-w-sm relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1.5 flex items-center">
                                <Mail className="w-5 h-5 text-gray-400 ml-3" />
                                <input
                                    type="email"
                                    placeholder={getTranslation(language, 'enterEmail')}
                                    className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 px-4 py-2"
                                />
                                <button className="bg-primary hover:bg-primary-dark text-white rounded-lg p-2.5 transition-colors shadow-lg shadow-primary/25">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10 md:pl-12 pt-4">
                        {[
                            { title: 'product', links: ['features', 'pricing', 'testimonials', 'faq'] },
                            { title: 'company', links: ['aboutUs', 'blog', 'careers', 'contact'] },
                            { title: 'legal', links: ['privacyPolicy', 'termsOfService'] }
                        ].map((column, idx) => (
                            <div key={idx}>
                                <h4 className="font-bold text-white mb-8 text-lg tracking-wide border-b border-white/10 pb-2 inline-block">
                                    {getTranslation(language, column.title)}
                                </h4>
                                <ul className="space-y-5">
                                    {column.links.map((link) => (
                                        <li key={link}>
                                            <a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 flex items-center group text-[15px]">
                                                <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 mr-2 transition-all transform scale-0 group-hover:scale-100"></span>
                                                {getTranslation(language, link)}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Info */}
                <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-sm font-medium">
                        © 2025 Aldea AI. {getTranslation(language, 'allRightsReserved')}
                    </p>
                    <div className="flex space-x-4">
                        {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                            <a key={i} href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary hover:-translate-y-1 transition-all duration-300 border border-white/5">
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
