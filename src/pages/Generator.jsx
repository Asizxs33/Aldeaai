import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sparkles, Send, Copy, ThumbsUp, ThumbsDown, RefreshCw, Wand2, FileText, Download, Printer, Mic, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { saveHistoryItem } from '../utils/historyStorage';
import { API_BASE } from '../utils/api';
import { generateContent } from '../utils/generateContent';
import { exportToWord, exportToExcel, printContent, copyToClipboard, markdownToHtml } from '../utils/exportContent';
import UpgradeModal from '../components/UpgradeModal';
import InteractiveTest from '../components/InteractiveTest';

const Generator = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { toolTitle, subjectTitle, color } = location.state || { toolTitle: 'Tool', subjectTitle: 'Subject', color: 'from-blue-500 to-cyan-500' };
    const { language } = useLanguage();

    const [topic, setTopic] = useState('');
    const [grade, setGrade] = useState('10');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState('');

    // Test-specific configuration
    const [questionCount, setQuestionCount] = useState('10');
    const [difficulty, setDifficulty] = useState('medium');
    const [showExplanations, setShowExplanations] = useState(true);

    // TTS state for Speech Writer
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioElement, setAudioElement] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;

        // Reset audio when generating new content
        if (audioElement) {
            audioElement.pause();
            setAudioElement(null);
        }
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
        setIsPlaying(false);

        setIsGenerating(true);
        try {
            // Pass test-specific options
            const testOptions = id === 'test' ? {
                questionCount: parseInt(questionCount),
                difficulty,
                showExplanations
            } : {};

            const generatedContent = await generateContent(id, topic, subjectTitle, grade, language, {
                onUpdate: (partialContent) => setResult(partialContent),
                ...testOptions
            });

            setResult(generatedContent);

            saveHistoryItem({
                type: 'text',
                toolTitle,
                subjectTitle,
                topic,
                content: generatedContent,
                details: { grade, toolId: id }
            });
        } catch (error) {
            console.error('Error generating content:', error);
            if (error.upgradeRequired) {
                setUpgradeMessage(error.message);
                setIsUpgradeModalOpen(true);
            } else {
                alert(error.message || 'Ошибка при генерации контента. Попробуйте еще раз.');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    // TTS function for Speech Writer
    const handleTTS = async () => {
        if (!result || !result.trim()) return;

        // If we already have audio, just play/pause it
        if (audioElement) {
            if (isPlaying) {
                audioElement.pause();
                setIsPlaying(false);
            } else {
                audioElement.play();
                setIsPlaying(true);
            }
            return;
        }

        setIsGeneratingAudio(true);

        try {
            const response = await fetch(`${API_BASE}/api/ai/tts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: result,
                    voice: 'alloy' // Default voice for speech writer
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to generate speech');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);

            const audio = new Audio(url);
            audio.onended = () => setIsPlaying(false);
            audio.onpause = () => setIsPlaying(false);
            audio.onplay = () => setIsPlaying(true);

            setAudioElement(audio);
            audio.play();
            setIsPlaying(true);

        } catch (error) {
            console.error('Error generating speech:', error);
            alert(getTranslation(language, 'errorGeneratingVoice') || 'Error generating voice. Please try again.');
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    // Download audio function
    const handleDownloadAudio = () => {
        if (!audioUrl) return;

        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = `${toolTitle} - ${topic}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };


    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 mt-6">
                <button
                    onClick={() => navigate(-1)}
                    className="self-start flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                    <ChevronLeft size={18} />
                    {getTranslation(language, 'backToTools')}
                </button>

                <div className="flex items-center gap-3">
                    <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${color} text-white font-bold text-sm shadow-lg shadow-blue-500/20`}>
                        {subjectTitle}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Wand2 className="text-blue-500" />
                        {toolTitle}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-[#12141c] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none"
                    >
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Sparkles size={20} className="text-yellow-500" />
                            {getTranslation(language, 'configuration')}
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">{getTranslation(language, 'topic')}</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder={getTranslation(language, 'topicPlaceholder')}
                                    className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">{getTranslation(language, 'gradeLevel')}</label>
                                <select
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-white appearance-none"
                                >
                                    <option value="1">{getTranslation(language, 'grade1')}</option>
                                    <option value="5">{getTranslation(language, 'grade5')}</option>
                                    <option value="9">{getTranslation(language, 'grade9')}</option>
                                    <option value="10">{getTranslation(language, 'grade10')}</option>
                                    <option value="11">{getTranslation(language, 'grade11')}</option>
                                    <option value="University">{getTranslation(language, 'university')}</option>
                                </select>
                            </div>

                            {/* Test-specific options */}
                            {id === 'test' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                                            {getTranslation(language, 'questionCount') || 'Количество вопросов'}
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['5', '10', '15', '20'].map((count) => (
                                                <button
                                                    key={count}
                                                    type="button"
                                                    onClick={() => setQuestionCount(count)}
                                                    className={`py-3 rounded-xl font-bold transition-all ${questionCount === count
                                                            ? `bg-gradient-to-r ${color} text-white shadow-lg`
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {count}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                                            {getTranslation(language, 'difficulty') || 'Сложность'}
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { value: 'easy', label: getTranslation(language, 'difficultyEasy') || 'Лёгкий', emoji: '😊' },
                                                { value: 'medium', label: getTranslation(language, 'difficultyMedium') || 'Средний', emoji: '🤔' },
                                                { value: 'hard', label: getTranslation(language, 'difficultyHard') || 'Сложный', emoji: '🧠' }
                                            ].map((level) => (
                                                <button
                                                    key={level.value}
                                                    type="button"
                                                    onClick={() => setDifficulty(level.value)}
                                                    className={`py-3 rounded-xl font-medium transition-all flex flex-col items-center gap-1 ${difficulty === level.value
                                                            ? `bg-gradient-to-r ${color} text-white shadow-lg`
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <span className="text-lg">{level.emoji}</span>
                                                    <span className="text-xs">{level.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="font-semibold text-gray-700 dark:text-gray-300">
                                                {getTranslation(language, 'showExplanations') || 'Показать объяснения'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {getTranslation(language, 'showExplanationsDesc') || 'Объяснение правильного ответа'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowExplanations(!showExplanations)}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${showExplanations ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${showExplanations ? 'translate-x-6' : 'translate-x-0'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </>
                            )}

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !topic}
                                className={`
                                    w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0
                                    ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : `bg-gradient-to-r ${color} hover:brightness-110`}
                                `}
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="animate-spin" /> {getTranslation(language, 'generating')}
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} /> {getTranslation(language, 'generate')}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Output Section */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white dark:bg-[#12141c] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none h-full min-h-[500px] flex flex-col"
                            >
                                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{getTranslation(language, 'aiResult')}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={async () => {
                                                const success = await copyToClipboard(result);
                                                if (success) {
                                                    alert('Скопировано!');
                                                }
                                            }}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors" title="Копировать"
                                        >
                                            <Copy size={18} />
                                        </button>
                                        <button
                                            onClick={() => exportToWord(result, `${toolTitle} - ${topic}`)}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors" title="Скачать Word"
                                        >
                                            <FileText size={18} />
                                        </button>
                                        <button
                                            onClick={() => exportToExcel(result, `${toolTitle} - ${topic}`)}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors" title="Скачать Excel"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button
                                            onClick={() => printContent(result, `${toolTitle} - ${topic}`)}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors" title="Печать"
                                        >
                                            <Printer size={18} />
                                        </button>

                                        {/* TTS buttons for Speech Writer */}
                                        {id === 'speech' && (
                                            <>
                                                <button
                                                    onClick={handleTTS}
                                                    disabled={isGeneratingAudio}
                                                    className={`p-2 rounded-lg transition-colors ${isPlaying
                                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
                                                        }`}
                                                    title={isPlaying ? 'Остановить' : 'Озвучить'}
                                                >
                                                    {isGeneratingAudio ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : isPlaying ? (
                                                        <VolumeX size={18} />
                                                    ) : (
                                                        <Volume2 size={18} />
                                                    )}
                                                </button>
                                                {audioUrl && (
                                                    <button
                                                        onClick={handleDownloadAudio}
                                                        className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors"
                                                        title="Скачать аудио"
                                                    >
                                                        <Mic size={18} />
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors" title="Good">
                                            <ThumbsUp size={18} />
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors" title="Bad">
                                            <ThumbsDown size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div
                                    className="prose dark:prose-invert max-w-none flex-grow overflow-y-auto custom-scrollbar pr-2 leading-relaxed text-gray-600 dark:text-gray-300"
                                >
                                    {id === 'test' ? (
                                        (() => {
                                            try {
                                                // Try to extract JSON if there's surrounding text
                                                const jsonMatch = result.match(/\{[\s\S]*\}/);
                                                const jsonString = jsonMatch ? jsonMatch[0] : result;
                                                const testData = JSON.parse(jsonString);
                                                return <InteractiveTest testData={testData} onRetry={handleGenerate} />;
                                            } catch (e) {
                                                // While streaming or if invalid, show loading or fallback
                                                if (isGenerating) {
                                                    return (
                                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                            <Wand2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                                                            <p>Создаем интерактивный тест...</p>
                                                        </div>
                                                    );
                                                }
                                                return <div dangerouslySetInnerHTML={{ __html: markdownToHtml(result) }} />;
                                            }
                                        })()
                                    ) : (
                                        <div dangerouslySetInnerHTML={{ __html: markdownToHtml(result) }} />
                                    )}
                                </div>

                                {/* TTS Section for Speech Writer - More prominent UI */}
                                {id === 'speech' && !isGenerating && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={handleTTS}
                                                disabled={isGeneratingAudio}
                                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isPlaying
                                                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30'
                                                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 hover:-translate-y-0.5'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {isGeneratingAudio ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={20} />
                                                        {getTranslation(language, 'generatingVoice') || 'Генерация голоса...'}
                                                    </>
                                                ) : isPlaying ? (
                                                    <>
                                                        <VolumeX size={20} />
                                                        {getTranslation(language, 'stopAudio') || 'Остановить'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Volume2 size={20} />
                                                        {getTranslation(language, 'listenSpeech') || 'Прослушать речь'}
                                                    </>
                                                )}
                                            </button>

                                            {audioUrl && (
                                                <button
                                                    onClick={handleDownloadAudio}
                                                    className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Download size={20} />
                                                    {getTranslation(language, 'downloadAudio') || 'Скачать аудио'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[500px] rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-8 text-center"
                            >
                                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-20 blur-2xl mb-6`}></div>
                                <div className={`relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-6`}>
                                    <Sparkles className="text-white w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{getTranslation(language, 'readyToCreate')}</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                                    {getTranslation(language, 'readyToCreateDesc')}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                message={upgradeMessage}
            />
        </div>
    );
};

export default Generator;
