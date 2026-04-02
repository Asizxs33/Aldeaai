import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';

const Testimonials = () => {
    const { language } = useLanguage();

    const testimonials = [
        {
            name: getTranslation(language, 'testimonial1Name'),
            role: getTranslation(language, 'testimonial1Role'),
            text: getTranslation(language, 'testimonial1Text'),
            avatar: '👩‍🏫',
            gradient: 'from-pink-500 to-rose-500'
        },
        {
            name: getTranslation(language, 'testimonial2Name'),
            role: getTranslation(language, 'testimonial2Role'),
            text: getTranslation(language, 'testimonial2Text'),
            avatar: '👨‍🏫',
            gradient: 'from-purple-500 to-indigo-500'
        },
        {
            name: getTranslation(language, 'testimonial3Name'),
            role: getTranslation(language, 'testimonial3Role'),
            text: getTranslation(language, 'testimonial3Text'),
            avatar: '👩‍💻',
            gradient: 'from-blue-500 to-cyan-500'
        }
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="relative rounded-[3rem] bg-[#0F172A] p-8 md:p-20 overflow-hidden shadow-2xl">
                    {/* Background World Map Effect */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>

                    {/* Glowing Orbs */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                                {getTranslation(language, 'trustedBy')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{getTranslation(language, 'educatorsWorldwide')}</span>
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                {getTranslation(language, 'joinTeachers')}
                            </p>
                        </div>

                        {/* Testimonials Grid */}
                        <div className="grid md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -10 }}
                                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors duration-300 relative group"
                                >
                                    <Quote className="absolute top-6 right-6 text-white/5 group-hover:text-white/10 transition-colors w-12 h-12" />

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.gradient} p-[2px]`}>
                                            <div className="w-full h-full bg-[#1E293B] rounded-full flex items-center justify-center text-2xl">
                                                {testimonial.avatar}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                                            <p className="text-blue-200/80 text-sm">{testimonial.role}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>

                                    <p className="text-gray-300 leading-relaxed">
                                        "{testimonial.text}"
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
