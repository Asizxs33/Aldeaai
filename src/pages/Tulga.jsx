import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { Mic, Video, Play, Download, Edit, RefreshCw, ArrowLeft, Sparkles, User, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveHistoryItem } from '../utils/historyStorage';

const Tulga = () => {
    const { language } = useLanguage();
    const [step, setStep] = useState('selection'); // selection, topic, editor, result
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [topic, setTopic] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioElement, setAudioElement] = useState(null);
    const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultVideoUrl, setResultVideoUrl] = useState(null);

    // Map characters to OpenAI voices
    // voices: alloy, echo, fable, onyx, nova, shimmer
    const characterVoices = {
        1: 'onyx',    // Abai - deep, authoritative
        2: 'echo',    // Ibrai - balanced
        3: 'fable',   // Shoqan - storytelling
        4: 'onyx',    // Ahmet - deep
        5: 'echo',    // Kunaev - balanced
        6: 'shimmer', // Aliya - clear, female
        7: 'nova',    // Manshuk - energetic, female
        8: 'onyx'     // Bauyrzhan - deep, commands respect
    };

    // Map characters to video files (place your videos in public/videos/)
    const characterVideos = {
        1: '/videos/1.mp4',
        2: '/videos/2.mp4',
        3: '/videos/3.mp4',
        4: '/videos/4.mp4',
        5: '/videos/5.mp4',
        6: '/videos/6.mp4',
        7: '/videos/7.mp4',
        8: '/videos/8.mp4',
    };

    const characters = [
        { id: 1, nameKey: 'abaiName', roleKey: 'abaiRole', gradient: 'from-amber-500 to-orange-600', image: '/Абай Кунанбаев.png' },
        { id: 2, nameKey: 'ibraiName', roleKey: 'ibraiRole', gradient: 'from-blue-500 to-cyan-600', image: '/Ибрай Алтынсарин.png' },
        { id: 3, nameKey: 'shoqanName', roleKey: 'shoqanRole', gradient: 'from-emerald-500 to-teal-600', image: '/Шокан Валиханов.png' },
        { id: 4, nameKey: 'ahmetName', roleKey: 'ahmetRole', gradient: 'from-red-500 to-pink-600', image: '/Ахмет Байтурсынов.png' },
        { id: 5, nameKey: 'kunaevName', roleKey: 'kunaevRole', gradient: 'from-violet-500 to-purple-600', image: '/Динмухамед Кунаев.png' },
        { id: 6, nameKey: 'aliyaName', roleKey: 'aliyaRole', gradient: 'from-rose-500 to-red-600', image: '/Алия Молдагулова.png' },
        { id: 7, nameKey: 'manshukName', roleKey: 'manshukRole', gradient: 'from-fuchsia-500 to-purple-600', image: '/Маншук Маметова .png' },
        { id: 8, nameKey: 'bauyrzhanName', roleKey: 'bauyrzhanRole', gradient: 'from-slate-500 to-gray-600', image: '/Бауыржан Момышулы.png' },
    ];

    const getCharName = (char) => getTranslation(language, char.nameKey);
    const getCharRole = (char) => getTranslation(language, char.roleKey);

    const handleCharacterSelect = (char) => {
        setSelectedCharacter(char);
        setStep('topic');
    };

    const handleGenerateText = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setAudioUrl(null);
        setGeneratedText(''); // Clear previous text
        setResultVideoUrl(null); // Clear previous video result

        const charName = getCharName(selectedCharacter);

        try {
            // Use Netlify Functions path
            const apiUrl = '/.netlify/functions';

            const response = await fetch(`${apiUrl}/ai-tulga-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic,
                    character: charName,
                    language: language
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to generate text');
            }

            const data = await response.json();
            setGeneratedText(data.content);
            setStep('editor');

        } catch (error) {
            console.error('Error generating text:', error);
            alert(getTranslation(language, 'errorGeneratingText') || 'Error generating text. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleTTS = async () => {
        if (!generatedText.trim()) return;

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

        setIsGeneratingVoice(true);

        try {
            const voice = characterVoices[selectedCharacter.id] || 'alloy';

            // Use Netlify Functions path
            const apiUrl = '/.netlify/functions';

            const response = await fetch(`${apiUrl}/ai-tts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: generatedText,
                    voice: voice
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("FULL BACKEND ERROR:", JSON.stringify(errorData, null, 2)); // Stringify for readability
                throw new Error(errorData.message || errorData.error || 'Failed to generate speech');
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
            alert(getTranslation(language, 'errorGeneratingVoice') || 'Error generating voice');
        } finally {
            setIsGeneratingVoice(false);
        }
    };

    const handleDownloadAudio = () => {
        if (!audioUrl) return;

        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = `${getCharName(selectedCharacter)} - ${topic}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleGenerateVideo = async () => {
        if (!audioUrl) {
            alert('Сначала сгенерируйте голос / Please generate voice first');
            return;
        }

        setLoading(true);
        setProgress(0);

        try {
            // Get video path for selected character
            const videoPath = characterVideos[selectedCharacter.id];
            if (!videoPath) {
                alert('Видео для этого персонажа не найдено / No video available for this character');
                setLoading(false);
                return;
            }

            // Create video element
            const video = document.createElement('video');
            video.src = videoPath;
            video.muted = true;
            video.volume = 0; // Explicitly mute to ensure no audio bleed
            video.crossOrigin = 'anonymous';
            video.loop = true;
            video.playsInline = true;

            // Wait for video metadata
            await new Promise((resolve, reject) => {
                video.onloadedmetadata = resolve;
                video.onerror = (e) => reject(new Error('Failed to load video'));
            });

            await video.play();

            // Setup Audio
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioResponse = await fetch(audioUrl);
            const audioArrayBuffer = await audioResponse.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(audioArrayBuffer);

            // Cap duration at 30 seconds
            const duration = Math.min(audioBuffer.duration, 30);
            const durationMs = duration * 1000;

            // Setup Canvas
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 1280;
            canvas.height = video.videoHeight || 720;
            const ctx = canvas.getContext('2d');

            // Setup MediaRecorder
            const stream = canvas.captureStream(30);

            // Add audio track
            const dest = audioContext.createMediaStreamDestination();
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(dest);
            source.start(0);

            const audioTrack = dest.stream.getAudioTracks()[0];
            stream.addTrack(audioTrack);

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9,opus'
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const videoUrl = URL.createObjectURL(blob);

                setResultVideoUrl(videoUrl);
                window.lastGeneratedVideoUrl = videoUrl; // For compatibility

                // Save to history
                const charName = getCharName(selectedCharacter);
                saveHistoryItem({
                    type: 'video',
                    toolTitle: 'Tulga AI Video',
                    subjectTitle: charName,
                    topic: topic,
                    content: generatedText,
                    videoUrl: videoUrl,
                    details: {
                        characterId: selectedCharacter.id,
                        characterImage: selectedCharacter.image,
                        characterName: charName
                    }
                });

                setLoading(false);
                setStep('result');

                // Cleanup
                video.pause();
                video.remove();
                audioContext.close();
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();

            // Render loop
            const startTime = Date.now();

            const render = () => {
                if (Date.now() - startTime > durationMs) {
                    mediaRecorder.stop();
                    return;
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const p = Math.min(100, ((Date.now() - startTime) / durationMs) * 100);
                setProgress(Math.round(p));

                requestAnimationFrame(render);
            };

            render();

        } catch (error) {
            console.error('Video generation error:', error);
            alert('Ошибка генерации видео. Убедитесь, что видео файлы находятся в public/videos/\nVideo generation error. Please ensure video files are in public/videos/');
            setLoading(false);
        }
    };

    // Clean up audio URL on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            if (audioElement) {
                audioElement.pause();
            }
        };
    }, []);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Video className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {getTranslation(language, 'tulga')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {getTranslation(language, 'tulgaDesc')}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {step === 'selection' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {characters.map((char) => (
                            <motion.button
                                key={char.id}
                                onClick={() => handleCharacterSelect(char)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300"
                            >
                                {char.image ? (
                                    <img
                                        src={char.image}
                                        alt={getCharName(char)}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${char.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                    <h3 className="text-xl font-bold text-white mb-1">{getCharName(char)}</h3>
                                    <p className="text-white/80 text-sm">{getCharRole(char)}</p>
                                </div>
                                <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                )}

                {step === 'topic' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-2xl mx-auto"
                    >
                        <button
                            onClick={() => setStep('selection')}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span>{getTranslation(language, 'backToSelection')}</span>
                        </button>

                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedCharacter.gradient} flex items-center justify-center`}>
                                    <User className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{getCharName(selectedCharacter)}</h3>
                                    <p className="text-sm text-gray-500">{getCharRole(selectedCharacter)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {getTranslation(language, 'enterTopic')}
                                </label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder={getTranslation(language, 'enterTopicDesc')}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                />
                                <button
                                    onClick={handleGenerateText}
                                    disabled={!topic.trim() || loading}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="animate-spin" size={20} />
                                            {getTranslation(language, 'generatingText')}
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={20} />
                                            {getTranslation(language, 'generateText')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'editor' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-3xl mx-auto"
                    >
                        <button
                            onClick={() => setStep('topic')}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span>{getTranslation(language, 'enterTopic')}</span>
                        </button>

                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Edit className="text-indigo-500" size={24} />
                                {getTranslation(language, 'editText')}
                            </h3>

                            <textarea
                                value={generatedText}
                                onChange={(e) => setGeneratedText(e.target.value)}
                                rows={8}
                                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white mb-6 text-lg leading-relaxed resize-none"
                            />

                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={handleTTS}
                                    disabled={loading || isGeneratingVoice}
                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2
                                        ${isPlaying
                                            ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30'
                                            : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isGeneratingVoice ? (
                                        <RefreshCw className="animate-spin" size={20} />
                                    ) : isPlaying ? (
                                        <><Video size={20} /> Stop Voice</>
                                    ) : (
                                        <><Mic size={20} /> Play Voice</>
                                    )}
                                </button>

                                {audioUrl && (
                                    <button
                                        onClick={handleDownloadAudio}
                                        className="flex-1 py-3 px-4 rounded-xl font-semibold shadow-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download size={20} /> Download Voice
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleGenerateVideo}
                                disabled={!generatedText.trim() || loading}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                            >
                                {loading ? (
                                    <>
                                        <div className="absolute inset-0 bg-black/10">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-400/30 to-white/30 transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <RefreshCw className="animate-spin relative z-10" size={20} />
                                        <span className="relative z-10">{getTranslation(language, 'generatingVideo')} {progress}%</span>
                                    </>
                                ) : (
                                    <>
                                        <Video size={20} />
                                        {getTranslation(language, 'generateVideo')}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'result' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="bg-black rounded-3xl overflow-hidden shadow-2xl relative aspect-video">
                            <video
                                src={resultVideoUrl || window.lastGeneratedVideoUrl}
                                controls
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="mt-8 text-center">
                            <div className="flex justify-center gap-4 mb-6">
                                <a
                                    href={resultVideoUrl || window.lastGeneratedVideoUrl}
                                    download={`${selectedCharacter ? getCharName(selectedCharacter) : 'video'} - ${topic}.webm`}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                >
                                    <Download size={20} /> {getTranslation(language, 'downloadVideo') || 'Download Video'}
                                </a>
                                <button
                                    onClick={() => setStep('selection')}
                                    className="px-6 py-3 bg-white text-black border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    {getTranslation(language, 'createNew')}
                                </button>
                            </div>

                            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                                * {getTranslation(language, 'botDisclaimer')}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tulga;
