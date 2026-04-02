import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../translations/translations';
import { Info, Plus, Minus, Image as ImageIcon, Sparkles, ChevronDown, Check, Wand2, Palette, Eye, FolderOpen, Trash2, Clock, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveHistoryItem } from '../utils/historyStorage';
import { presentationTemplates, getTemplateById } from '../data/presentationTemplates';
import PresentationPreview from '../components/PresentationPreview';
import { presentationApi } from '../utils/presentationApi';
import { generateSlideContent as aiGenerateSlideContent, generateSlideContentWithProgress } from '../utils/aiGeneration';
import { useAnalytics, ANALYTICS_EVENTS } from '../hooks/useAnalytics';

const Presentation = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const { trackEvent } = useAnalytics();
    const [targetLang, setTargetLang] = useState('kk'); // 'kk', 'ru', 'en'
    const [slideCount, setSlideCount] = useState(8);
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [ktp, setKtp] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('modern-blue');
    const [uploadedImages, setUploadedImages] = useState([]);
    const [generatedPresentation, setGeneratedPresentation] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [savedPresentations, setSavedPresentations] = useState([]);
    const [loadingPresentations, setLoadingPresentations] = useState(false);
    const [presentationType, setPresentationType] = useState('academic');
    const [generationProgress, setGenerationProgress] = useState({ progress: 0, message: '' });

    // Generate AI content for slides (using AI service)
    const generateSlideContent = async (topic, slideCount, lang) => {
        return await aiGenerateSlideContent(
            topic,
            slideCount,
            lang,
            presentationType,
            ktp,
            uploadedImages
        );
    };

    // Load saved presentations
    useEffect(() => {
        if (user?.id) {
            loadPresentations();
        }
    }, [user?.id]);

    const loadPresentations = async () => {
        if (!user?.id) return;
        setLoadingPresentations(true);
        try {
            const presentations = await presentationApi.getAll(user.id);
            setSavedPresentations(presentations);
        } catch (error) {
            console.error('Error loading presentations:', error);
        } finally {
            setLoadingPresentations(false);
        }
    };

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        setGenerationProgress({ progress: 0, message: 'Запуск генерации...' });

        try {
            // Generate slide content with progress tracking
            let slides;

            try {
                // Try streaming with progress first
                slides = await generateSlideContentWithProgress(
                    {
                        topic,
                        slideCount,
                        language: targetLang,
                        presentationType,
                        ktp,
                        uploadedImages
                    },
                    (progressData) => {
                        setGenerationProgress({
                            progress: progressData.progress,
                            message: progressData.message
                        });
                    }
                );
            } catch (streamError) {
                console.log('Streaming failed, using regular generation:', streamError);
                setGenerationProgress({ progress: 30, message: 'Генерация слайдов...' });
                slides = await generateSlideContent(topic, slideCount, targetLang);
            }

            setGenerationProgress({ progress: 90, message: 'Финальная обработка...' });

            const template = getTemplateById(selectedTemplate);

            const result = {
                title: topic.substring(0, 50),
                slides: slides,
                template: template,
                language: targetLang,
                slideCount: slideCount,
                generatedAt: new Date().toISOString()
            };

            setGeneratedPresentation(result);

            // Save to database if user is logged in
            if (user?.id) {
                try {
                    setGenerationProgress({ progress: 95, message: 'Сохранение...' });
                    await presentationApi.create({
                        userId: user.id,
                        title: result.title,
                        topic: topic,
                        templateId: selectedTemplate,
                        language: targetLang,
                        slideCount: slideCount,
                        slides: slides,
                        presentationType: presentationType,
                        ktp: ktp || null
                    });
                    loadPresentations();
                } catch (dbError) {
                    console.error('Error saving to database:', dbError);
                }
            }

            saveHistoryItem({
                type: 'presentation',
                toolTitle: 'AI Presentation',
                subjectTitle: `${slideCount} Slides • ${targetLang.toUpperCase()}`,
                topic: topic,
                content: `Generated presentation for "${topic}" with ${slideCount} slides in ${targetLang}.`,
                details: result
            });

            trackEvent(ANALYTICS_EVENTS.PRESENTATION_CREATED, {
                topic: topic,
                slideCount: slideCount,
                language: targetLang,
                presentationType: presentationType
            });

            setGenerationProgress({ progress: 100, message: 'Готово!' });
            setIsGenerating(false);
            setShowPreview(true);
        } catch (error) {
            console.error('Error generating presentation:', error);
            setIsGenerating(false);
            setGenerationProgress({ progress: 0, message: '' });
            alert(error.message || 'Ошибка при генерации презентации. Попробуйте еще раз.');
        }
    };


    const handleSavePresentation = async (updatedSlides) => {
        if (!user?.id || !generatedPresentation) return;

        try {
            const currentTemplate = getTemplateById(selectedTemplate);
            const presentationData = {
                ...generatedPresentation,
                slides: updatedSlides,
                template: currentTemplate,
                generatedAt: new Date().toISOString()
            };

            // Update local state immediately
            setGeneratedPresentation(presentationData);

            // If it's an existing presentation (has ID), update it
            if (generatedPresentation.id) {
                await presentationApi.update(generatedPresentation.id, {
                    slides: updatedSlides,
                    title: generatedPresentation.title, // In case title was edited (if we add that feature)
                    templateId: selectedTemplate
                });
            } else {
                // It's a new unsaved presentation, create it
                const newPres = await presentationApi.create({
                    userId: user.id,
                    title: presentationData.title,
                    topic: topic,
                    templateId: selectedTemplate,
                    language: targetLang,
                    slideCount: updatedSlides.length,
                    slides: updatedSlides,
                    presentationType: presentationType,
                    ktp: ktp || null
                });
                // Update state with the new ID so future saves are updates
                setGeneratedPresentation({
                    ...presentationData,
                    id: newPres.id
                });
            }

            await loadPresentations(); // Refresh list
            // Optional: Show success toast
        } catch (error) {
            console.error('Error saving presentation:', error);
            alert('Ошибка при сохранении презентации.');
            throw error; // Propagate to PresentationPreview to stop loading spinner
        }
    };

    const handleLoadPresentation = async (id) => {
        try {
            const presentation = await presentationApi.getById(id);
            // Ensure template exists, fallback if needed
            const template = getTemplateById(presentation.template_id) || getTemplateById('modern-blue');

            setGeneratedPresentation({
                ...presentation,
                template: template
            });
            setSelectedTemplate(presentation.template_id || 'modern-blue'); // Sync UI selector
            setShowPreview(true);
        } catch (error) {
            console.error('Error loading presentation:', error);
            alert('Ошибка при загрузке презентации.');
        }
    };

    const handleDeletePresentation = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Вы уверены, что хотите удалить эту презентацию?')) return;

        try {
            await presentationApi.delete(id);
            loadPresentations();
        } catch (error) {
            console.error('Error deleting presentation:', error);
            alert('Ошибка при удалении презентации.');
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        files.forEach(file => {
            if (file.size <= 2 * 1024 * 1024) { // 2MB limit
                const reader = new FileReader();
                reader.onload = (event) => {
                    setUploadedImages(prev => [...prev, event.target.result]);
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const adjustSlides = (delta) => {
        setSlideCount(prev => {
            const next = prev + delta;
            if (next < 5) return 5;
            if (next > 20) return 20;
            return next;
        });
    };

    const addTag = (tag) => {
        setTopic(prev => prev ? `${prev}, ${tag}: ` : `${tag}: `);
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 px-4">
            <AnimatePresence>
                {showPreview && generatedPresentation && (
                    <PresentationPreview
                        presentation={generatedPresentation}
                        template={getTemplateById(selectedTemplate)}
                        onClose={() => setShowPreview(false)}
                        onSave={handleSavePresentation}
                    />
                )}
            </AnimatePresence>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Wand2 className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {getTranslation(language, 'presentationTitle')}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Create professional slides in seconds</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20 uppercase tracking-wide">
                    {getTranslation(language, 'newInterface')}
                </div>
            </div>

            {/* Saved Presentations */}
            {user?.id && (
                <div className="mb-8 bg-white dark:bg-[#12141c] rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FolderOpen size={20} />
                            Сохраненные презентации
                        </h2>
                        {loadingPresentations && (
                            <div className="text-sm text-gray-500">Загрузка...</div>
                        )}
                    </div>
                    {savedPresentations.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            У вас пока нет сохраненных презентаций
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {savedPresentations.map((pres) => (
                                <motion.div
                                    key={pres.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleLoadPresentation(pres.id)}
                                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all bg-gray-50/50 dark:bg-gray-900/20"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 flex-1">
                                            {pres.title}
                                        </h3>
                                        <button
                                            onClick={(e) => handleDeletePresentation(pres.id, e)}
                                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    {pres.topic && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                                            {pres.topic}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Sparkles size={12} />
                                            {pres.slide_count} слайдов
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(pres.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Main Form Card */}
            <div className="bg-white dark:bg-[#12141c] rounded-[2rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-none space-y-8 relative overflow-hidden">
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                {/* Language Selector */}
                <div className="space-y-4 relative z-10">
                    <label className="text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider ml-1">{getTranslation(language, 'targetLanguage')}</label>
                    <div className="flex p-1.5 bg-gray-100 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
                        {['kk', 'ru', 'en'].map(lang => (
                            <button
                                key={lang}
                                onClick={() => setTargetLang(lang)}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${targetLang === lang
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {lang === 'kk' ? 'Қазақша' : lang === 'ru' ? 'Русский' : 'English'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Template Selection */}
                <div className="space-y-4 relative z-10">
                    <label className="text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider ml-1 flex items-center gap-2">
                        <Palette size={16} />
                        {getTranslation(language, 'selectTemplate') || 'Выберите шаблон'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {presentationTemplates.map((template) => (
                            <motion.button
                                key={template.id}
                                onClick={() => setSelectedTemplate(template.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative p-4 rounded-2xl border-2 transition-all ${selectedTemplate === template.id
                                    ? 'border-blue-500 shadow-lg shadow-blue-500/30'
                                    : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                                    }`}
                            >
                                <div className={`w-full h-20 rounded-xl mb-3 ${template.preview}`}></div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{template.description}</p>
                                {selectedTemplate === template.id && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Check size={14} className="text-white" />
                                    </div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Presentation Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider ml-1">{getTranslation(language, 'presentationType')}</label>
                        <div className="relative group">
                            <select
                                value={presentationType}
                                onChange={(e) => setPresentationType(e.target.value)}
                                className="w-full appearance-none bg-gray-50 dark:bg-[#0B1121] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer font-medium hover:bg-gray-100 dark:hover:bg-gray-900"
                            >
                                <option value="academic">{getTranslation(language, 'academicLesson')}</option>
                                <option value="open">{getTranslation(language, 'openLesson')}</option>
                                <option value="science">{getTranslation(language, 'scientificProject')}</option>
                                <option value="educational">{getTranslation(language, 'educationalHour')}</option>
                                <option value="parent">{getTranslation(language, 'parentMeeting')}</option>
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" size={20} />
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-5 flex gap-4 h-full items-start">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Info size={20} />
                        </div>
                        <div className="text-sm">
                            <p className="text-indigo-900 dark:text-indigo-200 font-bold mb-1">{getTranslation(language, 'slideStructure')}</p>
                            <p className="text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed">{getTranslation(language, 'slideStructureDesc')}</p>
                        </div>
                    </div>
                </div>

                {/* Slide Count */}
                <div className="space-y-4 relative z-10">
                    <label className="text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider ml-1">{getTranslation(language, 'slideCount')}</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-[#0B1121] border border-gray-200 dark:border-gray-800 rounded-2xl p-2 w-full sm:w-auto min-w-[200px]">
                            <button
                                onClick={() => adjustSlides(-1)}
                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <Minus size={20} />
                            </button>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white font-mono w-16 text-center">{slideCount}</span>
                            <button
                                onClick={() => adjustSlides(1)}
                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/30"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Check size={16} className="text-green-500" />
                            {getTranslation(language, 'allowedSlides')}
                        </span>
                    </div>
                </div>

                {/* Topic Input */}
                <div className="space-y-4 relative z-10">
                    <label className="text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider ml-1">{getTranslation(language, 'topicPrompt')}</label>
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={getTranslation(language, 'topicPlaceholder')}
                            className="relative w-full h-48 bg-white dark:bg-[#0B1121] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl p-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none text-lg leading-relaxed shadow-sm"
                        />
                        <span className="absolute bottom-4 right-6 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                            {topic.length} chars
                        </span>
                    </div>

                    {/* Helper Chips */}
                    <div className="flex flex-wrap gap-3">
                        {['+ Пән', '+ Тақырып', '+ Сынып'].map((tag, idx) => (
                            <button
                                key={idx}
                                onClick={() => addTag(tag.replace('+', '').trim())}
                                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30"
                            >
                                {idx === 0 ? getTranslation(language, 'subjectTag') : idx === 1 ? getTranslation(language, 'topicTag') : getTranslation(language, 'gradeTag')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-[#12141c] text-gray-400 font-medium uppercase tracking-wider">{getTranslation(language, 'orLabel')}</span>
                    </div>
                </div>

                {/* KTP Select */}
                <div className="space-y-4 relative z-10">
                    <div className="flex gap-4">
                        <div className="relative flex-1 group">
                            <select
                                value={ktp}
                                onChange={(e) => setKtp(e.target.value)}
                                className="w-full appearance-none bg-gray-50 dark:bg-[#0B1121] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer font-medium hover:bg-gray-100 dark:hover:bg-gray-900"
                            >
                                <option value="">{getTranslation(language, 'selectKtpPlaceholder')}</option>
                                <option value="ktp1">Algebra 7 Grade</option>
                                <option value="ktp2">History 9 Grade</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" size={20} />
                        </div>
                        <button
                            onClick={() => setKtp('')}
                            className="px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl font-bold transition-all border border-transparent hover:border-red-200 dark:hover:border-red-500/30"
                        >
                            {getTranslation(language, 'clear')}
                        </button>
                    </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-4 relative z-10">
                    <label className="text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider ml-1">{getTranslation(language, 'attachImages')}</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500/50 transition-colors bg-gray-50/50 dark:bg-gray-900/20">
                        <label className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:translate-y-[-2px] hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 group cursor-pointer">
                            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <ImageIcon size={20} />
                            </div>
                            {getTranslation(language, 'addImage')}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                        <span className="text-xs font-medium text-gray-500">
                            {getTranslation(language, 'imageLimits')} ({uploadedImages.length}/5)
                        </span>
                    </div>
                    {uploadedImages.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {uploadedImages.map((img, idx) => (
                                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                                    <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Generate Button */}
                <div className="mt-6 space-y-3">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic}
                        className={`
                            w-full py-5 rounded-2xl font-bold text-xl text-white shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 relative overflow-hidden group
                            ${isGenerating ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : !topic ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-2xl hover:shadow-blue-500/40'}
                        `}
                    >
                        {/* Progress bar inside button */}
                        {isGenerating && (
                            <div
                                className="absolute left-0 top-0 h-full bg-white/20 transition-all duration-500 ease-out"
                                style={{ width: `${generationProgress.progress}%` }}
                            />
                        )}

                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></div>

                        {isGenerating ? (
                            <>
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin relative"></div>
                                <span className="relative">
                                    {generationProgress.message || getTranslation(language, 'generatingPresentation')}
                                </span>
                                {generationProgress.progress > 0 && (
                                    <span className="relative text-white/80 text-sm font-mono ml-2">
                                        {generationProgress.progress}%
                                    </span>
                                )}
                            </>
                        ) : (
                            <>
                                <Sparkles className="relative" />
                                <span className="relative">{getTranslation(language, 'createPresentation')}</span>
                            </>
                        )}
                    </button>

                    {/* Progress bar below button */}
                    {isGenerating && generationProgress.progress > 0 && (
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${generationProgress.progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Presentation;
