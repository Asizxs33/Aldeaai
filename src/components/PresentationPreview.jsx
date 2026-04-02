import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save, X, Play, Sparkles, Zap, Target, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './PresentationPreview.css';

const PresentationPreview = ({ presentation, onClose, template, onSave }) => {
    const { language } = useLanguage();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [editableSlides, setEditableSlides] = useState(presentation?.slides || []);
    const [isSaving, setIsSaving] = useState(false);

    // Staggered animation variants for "wow" factor
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0, scale: 0.95 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    useEffect(() => {
        if (presentation?.slides) {
            setEditableSlides(presentation.slides);
        }
    }, [presentation]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                setCurrentSlide(prev => Math.min(editableSlides.length - 1, prev + 1));
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setCurrentSlide(prev => Math.max(0, prev - 1));
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [editableSlides.length, onClose]);

    if (!presentation) return null;

    const handleUpdateSlide = (idx, field, value) => {
        setEditableSlides(prev => {
            const newSlides = [...prev];
            newSlides[idx] = { ...newSlides[idx], [field]: value };
            return newSlides;
        });
    };

    const handleUpdateBulletPoint = (slideIdx, pointIdx, value) => {
        setEditableSlides(prev => {
            const newSlides = [...prev];
            const newPoints = [...(newSlides[slideIdx].bulletPoints || [])];
            newPoints[pointIdx] = value;
            newSlides[slideIdx] = { ...newSlides[slideIdx], bulletPoints: newPoints };
            return newSlides;
        });
    };

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(editableSlides);
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const slide = editableSlides[currentSlide];
    const slideLayout = slide?.layout || 'split_right';

    // Use template colors or fallback
    const theme = {
        bg: template?.colors?.primary || 'from-slate-900 via-slate-800 to-slate-900',
        accent: template?.colors?.accent || 'from-blue-500 to-cyan-500',
        text: template?.colors?.text || 'text-white',
        secondaryBg: template?.colors?.secondary || 'from-slate-800 to-slate-900', // For cards/overlays
    };

    // Decorative icons for different layouts
    const getLayoutIcon = (layout) => {
        switch (layout) {
            case 'title': return <Sparkles size={24} />;
            case 'stats': return <Zap size={24} />;
            case 'timeline': return <Target size={24} />;
            default: return <BookOpen size={24} />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col"
        >
            {/* Simple professional background */}
            <div className={`absolute inset-0 bg-slate-950`} />

            {/* Top Toolbar - Glass morphism */}
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
            >
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20"
                    >
                        <X size={22} />
                    </motion.button>
                    <div>
                        <h1 className="text-xl font-bold text-white truncate max-w-md">{presentation.title}</h1>
                        <p className="text-sm text-white/60 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.accent}`} />
                            {editableSlides.length} слайдов • {slideLayout}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Slide type badge */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${theme.accent} text-white text-sm font-bold shadow-lg`}>
                        {getLayoutIcon(slideLayout)}
                        <span className="capitalize">{slideLayout.replace('_', ' ')}</span>
                    </div>

                    {onSave && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-300 hover:to-emerald-400 rounded-xl text-white font-bold transition-all shadow-xl shadow-green-500/30 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={20} />
                            )}
                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Main Slide Area */}
            <div className="absolute inset-0 flex items-center justify-center p-6 pt-28 pb-28">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 0.85, rotateX: 10 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.85, rotateX: -10 }}
                        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="w-full max-w-7xl aspect-[16/9] rounded-3xl shadow-2xl overflow-hidden relative"
                        style={{
                            boxShadow: '0 80px 160px -40px rgba(0,0,0,0.7), 0 0 100px rgba(139,92,246,0.15)'
                        }}
                    >
                        {/* Slide gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg}`} />

                        {/* Decorative shapes */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-black/20 rounded-full blur-3xl" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-radial from-white/5 to-transparent" />
                        </div>

                        {/* Grid pattern overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
                                backgroundSize: '50px 50px'
                            }} />
                        </div>

                        {/* Slide number badge */}
                        <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm text-white/80 text-sm font-bold border border-white/10">
                            {String(currentSlide + 1).padStart(2, '0')}
                        </div>

                        {/* Slide Content */}
                        <div className="relative h-full p-10 md:p-14 flex">

                            {/* TITLE Layout */}
                            {slideLayout === 'title' && (
                                <div className="w-full max-h-full overflow-y-auto custom-scrollbar px-4 flex flex-col items-center justify-center min-h-0">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring" }}
                                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold mb-8 shrink-0`}
                                    >
                                        <Sparkles size={18} />
                                        Презентация
                                    </motion.div>
                                    <motion.h1
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleUpdateSlide(currentSlide, 'title', e.target.innerText)}
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className={`text-4xl md:text-6xl font-black ${theme.text} mb-8 leading-tight outline-none focus:ring-2 focus:ring-white/30 rounded-xl p-4 drop-shadow-2xl shrink-0 text-center`}
                                        style={{ textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
                                    >
                                        {slide.title}
                                    </motion.h1>
                                    <motion.p
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleUpdateSlide(currentSlide, 'content', e.target.innerText)}
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className={`text-lg md:text-xl ${theme.text}/90 max-w-4xl leading-relaxed outline-none focus:ring-2 focus:ring-white/30 rounded-xl p-4 text-center`}
                                    >
                                        {slide.content}
                                    </motion.p>
                                </div>
                            )}

                            {/* QUOTE Layout */}
                            {slideLayout === 'quote' && (
                                <div className="flex flex-col items-center justify-center h-full w-full text-center relative overflow-hidden">
                                    <div className="w-full max-h-full overflow-y-auto custom-scrollbar px-4 flex flex-col items-center justify-center min-h-0">
                                        <motion.span
                                            initial={{ scale: 0, rotate: -30 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.2, type: "spring" }}
                                            className={`absolute top-4 left-8 text-[120px] ${theme.text}/10 font-serif select-none leading-none pointer-events-none`}
                                        >
                                            "
                                        </motion.span>
                                        <motion.blockquote
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleUpdateSlide(currentSlide, 'content', e.target.innerText)}
                                            initial={{ y: 40, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className={`text-2xl md:text-4xl ${theme.text} font-medium italic leading-relaxed max-w-5xl outline-none focus:ring-2 focus:ring-white/30 rounded-xl p-6 relative z-10`}
                                            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.2)' }}
                                        >
                                            {slide.content || slide.bulletPoints?.[0]}
                                        </motion.blockquote>
                                        <motion.div
                                            initial={{ y: 40, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                            className="mt-10 flex items-center gap-4 shrink-0"
                                        >
                                            <div className={`w-16 h-1 rounded-full bg-gradient-to-r ${theme.accent}`} />
                                            <p
                                                contentEditable
                                                suppressContentEditableWarning
                                                onBlur={(e) => handleUpdateSlide(currentSlide, 'title', e.target.innerText)}
                                                className={`text-xl ${theme.text}/80 font-bold outline-none`}
                                            >
                                                {slide.title}
                                            </p>
                                            <div className={`w-16 h-1 rounded-full bg-gradient-to-r ${theme.accent}`} />
                                        </motion.div>
                                    </div>
                                </div>
                            )}

                            {/* STATS Layout */}
                            {slideLayout === 'stats' && (
                                <div className="flex flex-col h-full w-full overflow-hidden">
                                    <motion.h2
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleUpdateSlide(currentSlide, 'title', e.target.innerText)}
                                        initial={{ y: -30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className={`text-3xl md:text-4xl font-black ${theme.text} mb-8 text-center outline-none focus:ring-2 focus:ring-white/30 rounded-xl p-2 shrink-0`}
                                        style={{ textShadow: '0 4px 30px rgba(0,0,0,0.2)' }}
                                    >
                                        {slide.title}
                                    </motion.h2>
                                    <motion.div
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar px-4 pb-4"
                                    >
                                        {slide.bulletPoints?.map((point, idx) => (
                                            <motion.div
                                                key={idx}
                                                variants={itemVariants}
                                                className={`flex flex-col items-center justify-center p-6 ${theme.secondaryBg} backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white/5 transition-all group min-h-[160px]`}
                                            >
                                                <motion.span
                                                    className={`text-4xl md:text-6xl font-black bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent mb-4 text-center`}
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    {point.match(/\d+%?/) ? point.match(/\d+%?/)[0] : (idx + 1) * 100 + '+'}
                                                </motion.span>
                                                <p
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleUpdateBulletPoint(currentSlide, idx, e.target.innerText)}
                                                    className={`text-lg ${theme.text}/90 text-center outline-none focus:ring-2 focus:ring-white/30 rounded p-2 line-clamp-3`}
                                                >
                                                    {point.replace(/\d+%?/, '').trim() || point}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            )}

                            {/* TIMELINE Layout */}
                            {slideLayout === 'timeline' && (
                                <div className="flex flex-col h-full w-full overflow-hidden">
                                    <motion.h2
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleUpdateSlide(currentSlide, 'title', e.target.innerText)}
                                        initial={{ y: -30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className={`text-3xl md:text-5xl font-black ${theme.text} mb-10 outline-none focus:ring-2 focus:ring-white/30 rounded-xl p-2 shrink-0`}
                                        style={{ textShadow: '0 4px 30px rgba(0,0,0,0.2)' }}
                                    >
                                        {slide.title}
                                    </motion.h2>
                                    <div className="flex-1 relative overflow-y-auto custom-scrollbar px-4 pb-4">
                                        {/* Timeline line */}
                                        <div className="absolute left-6 top-2 bottom-2 w-1 bg-gradient-to-b from-white/40 via-white/20 to-transparent rounded-full" />

                                        {slide.bulletPoints?.map((point, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ x: -50, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 + idx * 0.12 }}
                                                className="mb-8 relative pl-16 pr-4"
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.2 }}
                                                    className={`absolute left-3 top-2 w-6 h-6 rounded-full bg-gradient-to-r ${theme.accent} border-4 border-white/30 shadow-lg z-10`}
                                                    style={{ boxShadow: `0 0 20px rgba(255,255,255,0.3)` }}
                                                />
                                                <div className={`text-sm font-bold ${theme.text}/50 mb-1 uppercase tracking-wider`}>
                                                    Этап {idx + 1}
                                                </div>
                                                <p
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleUpdateBulletPoint(currentSlide, idx, e.target.innerText)}
                                                    className={`text-lg md:text-xl ${theme.text} font-medium outline-none focus:ring-2 focus:ring-white/30 rounded p-1`}
                                                >
                                                    {point}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* GRID Layout */}
                            {slideLayout === 'grid' && (
                                <div className="flex flex-col h-full w-full overflow-hidden">
                                    <motion.h2
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleUpdateSlide(currentSlide, 'title', e.target.innerText)}
                                        initial={{ y: -30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className={`text-2xl md:text-3xl font-black ${theme.text} mb-6 outline-none focus:ring-2 focus:ring-white/30 rounded-xl p-2 shrink-0 line-clamp-1`}
                                        style={{ textShadow: '0 4px 30px rgba(0,0,0,0.2)' }}
                                    >
                                        {slide.title}
                                    </motion.h2>
                                    <motion.div
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="flex-1 grid grid-cols-2 lg:grid-cols-2 gap-4 overflow-hidden px-2 pb-4 content-start"
                                    >
                                        {slide.bulletPoints?.map((point, idx) => (
                                            <motion.div
                                                key={idx}
                                                variants={itemVariants}
                                                whileHover={{ scale: 1.03, y: -5 }}
                                                className={`p-5 ${theme.secondaryBg} backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/5 transition-all cursor-default`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.accent} flex items-center justify-center text-white font-bold mb-3 shadow-lg`}>
                                                    {idx + 1}
                                                </div>
                                                <p
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleUpdateBulletPoint(currentSlide, idx, e.target.innerText)}
                                                    className={`${theme.text}/95 text-sm md:text-base leading-relaxed outline-none focus:ring-2 focus:ring-white/30 rounded line-clamp-3`}
                                                >
                                                    {point}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            )}

                            {/* DEFAULT Split Layout */}
                            {(slideLayout === 'split_right' || slideLayout === 'split_left' || slideLayout === 'centered' || !['title', 'quote', 'stats', 'timeline', 'grid'].includes(slideLayout)) && (
                                <div className={`flex h-full w-full gap-8 ${slideLayout === 'split_left' ? 'flex-row-reverse' : ''}`}>
                                    {/* Text Content */}
                                    <div className="flex-1 flex flex-col justify-center max-h-full overflow-hidden min-h-0">
                                        <div className="overflow-y-auto pr-4 custom-scrollbar flex flex-col justify-center min-h-0 py-4">
                                            <motion.h2
                                                contentEditable
                                                suppressContentEditableWarning
                                                onBlur={(e) => handleUpdateSlide(currentSlide, 'title', e.target.innerText)}
                                                initial={{ x: -50, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className={`text-2xl md:text-3xl font-black ${theme.text} mb-3 leading-tight outline-none focus:ring-2 focus:ring-white/30 rounded-xl p-2 shrink-0 line-clamp-2`}
                                                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.2)' }}
                                            >
                                                {slide.title}
                                            </motion.h2>
                                            {slide.content && (
                                                <motion.p
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleUpdateSlide(currentSlide, 'content', e.target.innerText)}
                                                    initial={{ x: -50, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className={`text-base md:text-lg ${theme.text}/85 mb-4 leading-relaxed outline-none focus:ring-2 focus:ring-white/30 rounded-xl p-2 line-clamp-4`}
                                                >
                                                    {slide.content}
                                                </motion.p>
                                            )}
                                            {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                                                <ul className="space-y-3 pb-2">
                                                    {slide.bulletPoints.map((point, idx) => (
                                                        <motion.li
                                                            key={idx}
                                                            initial={{ x: -30, opacity: 0 }}
                                                            animate={{ x: 0, opacity: 1 }}
                                                            transition={{ delay: 0.4 + idx * 0.08 }}
                                                            className="flex items-start gap-3"
                                                        >
                                                            <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${theme.accent} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-lg mt-1`}>
                                                                {idx + 1}
                                                            </span>
                                                            <span
                                                                contentEditable
                                                                suppressContentEditableWarning
                                                                onBlur={(e) => handleUpdateBulletPoint(currentSlide, idx, e.target.innerText)}
                                                                className={`text-base ${theme.text}/95 outline-none focus:ring-2 focus:ring-white/30 rounded flex-1 leading-relaxed`}
                                                            >
                                                                {point}
                                                            </span>
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    {/* Image Area */}
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0, x: 50 }}
                                        animate={{ scale: 1, opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex-1 relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl h-full max-h-full"
                                    >
                                        {slide.imageUrl ? (
                                            <img
                                                src={slide.imageUrl}
                                                alt={slide.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback to gradient
                                                    e.target.parentElement.style.background = `linear-gradient(135deg, ${theme.accent.split(' ')[0].replace('from-', 'rgba(').replace('400', ',0.5)')}, transparent)`;
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="text-center p-8">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                                        className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${theme.accent} flex items-center justify-center shadow-2xl`}
                                                    >
                                                        <Play size={40} className="text-white ml-1" />
                                                    </motion.div>
                                                    <p className={`${theme.text}/50 text-sm max-w-xs`}>{slide.imagePrompt || 'Визуальный контент'}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Image Caption/Prompt overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                            <p className="text-white/60 text-xs truncate text-center">{slide.imagePrompt || slide.title}</p>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Navigation - Glass */}
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                    disabled={currentSlide === 0}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all border border-white/10"
                >
                    <ChevronLeft size={24} />
                </motion.button>

                <div className="flex items-center gap-2">
                    {editableSlides.map((_, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => setCurrentSlide(idx)}
                            className={`transition-all duration-300 rounded-full ${idx === currentSlide
                                ? `w-10 h-3 bg-gradient-to-r ${theme.accent} shadow-lg`
                                : 'w-3 h-3 bg-white/30 hover:bg-white/50'
                                }`}
                        />
                    ))}
                </div>

                <div className="px-4 py-2 rounded-xl bg-white/10 text-white font-mono text-sm border border-white/10">
                    {currentSlide + 1} / {editableSlides.length}
                </div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentSlide(prev => Math.min(editableSlides.length - 1, prev + 1))}
                    disabled={currentSlide === editableSlides.length - 1}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all border border-white/10"
                >
                    <ChevronRight size={24} />
                </motion.button>
            </motion.div>

            {/* Keyboard hints */}
            <div className="absolute bottom-6 right-6 flex items-center gap-3 text-white/30 text-xs font-medium">
                <kbd className="px-2 py-1 rounded bg-white/10 border border-white/10">← →</kbd>
                <span>Навигация</span>
                <kbd className="px-2 py-1 rounded bg-white/10 border border-white/10">ESC</kbd>
                <span>Закрыть</span>
            </div>
        </motion.div>
    );
};

export default PresentationPreview;
