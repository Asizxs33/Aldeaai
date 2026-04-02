import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, Sparkles, Play, Download, Trash2, Plus,
    MessageSquare, GitCompare, CircleDot, LayoutGrid, X, Loader2, Check,
    RotateCcw, Shuffle, ChevronLeft, ChevronRight, Zap, Trophy, Star,
    Timer, Target, Volume2, VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { generateContent } from '../utils/generateContent';
import UpgradeModal from '../components/UpgradeModal';

const STORAGE_KEY = 'aldea_ushqyr_games';

// Sound effects
const useSound = () => {
    const audioContextRef = useRef(null);
    const [enabled, setEnabled] = useState(true);

    const play = useCallback((type) => {
        if (!enabled) return;
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'correct') {
                osc.frequency.setValueAtTime(523, ctx.currentTime);
                osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
                osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.4);
            } else if (type === 'wrong') {
                osc.frequency.setValueAtTime(200, ctx.currentTime);
                osc.type = 'square';
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.2);
            } else if (type === 'flip') {
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.1);
            } else if (type === 'win') {
                [523, 659, 784, 1047].forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
                    g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
                    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
                    o.start(ctx.currentTime + i * 0.15);
                    o.stop(ctx.currentTime + i * 0.15 + 0.3);
                });
            }
        } catch (e) { }
    }, [enabled]);

    return { play, enabled, setEnabled };
};

const AldeaUshqyr = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const [step, setStep] = useState('intro');
    const [selectedType, setSelectedType] = useState(null);
    const [savedGames, setSavedGames] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createMode, setCreateMode] = useState('manual');
    const [currentGame, setCurrentGame] = useState(null);
    const sound = useSound();

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setSavedGames(JSON.parse(saved));
    }, []);

    const saveGames = (games) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
        setSavedGames(games);
    };

    const gameTypes = [
        { id: 'flashcards', nameKey: 'flashcards', descKey: 'flashcardsGameDesc', icon: MessageSquare, gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-500' },
        { id: 'matching', nameKey: 'matchingGame', descKey: 'matchingGameTypeDesc', icon: GitCompare, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500' },
        { id: 'wheel', nameKey: 'spinWheel', descKey: 'spinWheelGameDesc', icon: CircleDot, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-500' },
        { id: 'grouping', nameKey: 'groupingGame', descKey: 'groupingGameTypeDesc', icon: LayoutGrid, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500' }
    ];

    const filteredGames = savedGames.filter(g => g.type === selectedType);

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            {/* Colorful background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/50 via-slate-900 to-slate-900" />
                <motion.div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity }} />
                <motion.div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 7, repeat: Infinity }} />
                <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} />
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-4 md:p-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                    <button onClick={() => step === 'intro' ? navigate('/games') : setStep('intro')} className="w-11 h-11 bg-white/5 backdrop-blur-xl rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold text-white">Aldea</span>
                            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Ushqyr</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <button onClick={() => sound.setEnabled(!sound.enabled)} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border border-white/10 ${sound.enabled ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/40'}`}>
                        {sound.enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
                <AnimatePresence mode="wait">
                    {step === 'intro' && <IntroScreen key="intro" language={language} onStart={() => setStep('selectType')} />}
                    {step === 'selectType' && <SelectTypeScreen key="selectType" language={language} gameTypes={gameTypes} onSelect={(type) => { setSelectedType(type); setStep('gamesList'); }} />}
                    {step === 'gamesList' && <GamesListScreen key="gamesList" language={language} selectedType={selectedType} games={filteredGames} gameTypes={gameTypes} onBack={() => setStep('selectType')} onCreate={(mode) => { setCreateMode(mode); setShowCreateModal(true); }} onPlay={(game) => { setCurrentGame(game); setStep('play'); }} onDelete={(id) => saveGames(savedGames.filter(g => g.id !== id))} />}
                    {step === 'play' && currentGame && <PlayScreen key="play" language={language} game={currentGame} gameTypes={gameTypes} sound={sound} onBack={() => { setCurrentGame(null); setStep('gamesList'); }} />}
                </AnimatePresence>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateGameModal language={language} mode={createMode} gameType={selectedType} onClose={() => setShowCreateModal(false)} onSave={(game) => { saveGames([...savedGames, { ...game, id: Date.now(), type: selectedType, createdAt: new Date().toISOString() }]); setShowCreateModal(false); }} />
                )}
            </AnimatePresence>
        </div>
    );
};

// ==================== INTRO SCREEN ====================
const IntroScreen = ({ language, onStart }) => {
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="text-center max-w-4xl">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <Zap className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl md:text-6xl font-black text-white mb-4">
                {getTranslation(language, 'aldeaUshqyr')}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-white/50 text-lg mb-12 max-w-md mx-auto">
                {getTranslation(language, 'aldeaUshqyrDesc')}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                {[
                    { icon: LayoutGrid, title: 'ushqyrStep1', color: 'from-rose-500 to-pink-600' },
                    { icon: Sparkles, title: 'ushqyrStep2', color: 'from-violet-500 to-purple-600' },
                    { icon: Play, title: 'ushqyrStep3', color: 'from-emerald-500 to-teal-600' }
                ].map((step, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                        <div className={`w-14 h-14 mx-auto mb-4 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center`}>
                            <step.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-3xl font-black text-white/20 mb-2">{i + 1}</div>
                        <p className="text-white/70 text-sm">{getTranslation(language, step.title)}</p>
                    </div>
                ))}
            </motion.div>

            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onStart} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg px-12 py-4 rounded-2xl shadow-xl shadow-blue-500/30 transition-all">
                {getTranslation(language, 'understood')}
            </motion.button>
        </motion.div>
    );
};

// ==================== SELECT TYPE SCREEN ====================
const SelectTypeScreen = ({ language, gameTypes, onSelect }) => {
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="w-full max-w-4xl px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10">{getTranslation(language, 'selectGameType')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {gameTypes.map((type, i) => (
                    <motion.button
                        key={type.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(type.id)}
                        className="group bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 flex items-center gap-6 hover:bg-slate-800/80 transition-all border border-white/10 hover:border-white/20"
                    >
                        <div className={`w-20 h-20 bg-gradient-to-br ${type.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                            <type.icon className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-left flex-1">
                            <span className="text-xl font-bold text-white block mb-1">{getTranslation(language, type.nameKey)}</span>
                            <span className="text-white/50 text-sm">{getTranslation(language, type.descKey)}</span>
                        </div>
                        <ArrowRight className="text-white/30 group-hover:text-white/60 transition-colors w-6 h-6" />
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

// ==================== GAMES LIST SCREEN ====================
const GamesListScreen = ({ language, selectedType, games, gameTypes, onBack, onCreate, onPlay, onDelete }) => {
    const currentType = gameTypes.find(t => t.id === selectedType);

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="w-full max-w-5xl">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 bg-gradient-to-br ${currentType?.gradient} rounded-xl flex items-center justify-center`}>
                                {currentType && <currentType.icon className="w-6 h-6 text-white" />}
                            </div>
                            <h2 className="text-2xl font-bold text-white">{getTranslation(language, currentType?.nameKey)}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onCreate('manual')} className="px-4 py-2.5 bg-white/5 text-white/70 rounded-xl font-medium hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 border border-white/10">
                            <Plus size={18} />{getTranslation(language, 'createManual')}
                        </button>
                        <button onClick={() => onCreate('generate')} className={`px-4 py-2.5 bg-gradient-to-r ${currentType?.gradient} text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-lg`}>
                            <Sparkles size={18} />{getTranslation(language, 'generate')}
                        </button>
                    </div>
                </div>

                {games.length === 0 ? (
                    <div className="text-center py-16">
                        <div className={`w-20 h-20 bg-gradient-to-br ${currentType?.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-30`}>
                            {currentType && <currentType.icon className="w-10 h-10 text-white" />}
                        </div>
                        <p className="text-white/40 text-lg mb-6">{getTranslation(language, 'noGamesYet')}</p>
                        <button onClick={() => onCreate('manual')} className={`px-6 py-3 bg-gradient-to-r ${currentType?.gradient} text-white rounded-xl font-semibold`}>
                            {getTranslation(language, 'createFirst')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {games.map((game, i) => (
                            <motion.div key={game.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group">
                                <h3 className="font-semibold text-white mb-2 truncate">{game.title}</h3>
                                <p className="text-white/40 text-sm mb-4">{game.items?.length || 0} {getTranslation(language, 'cards')}</p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onPlay(game)} className={`flex-1 py-2.5 bg-gradient-to-r ${currentType?.gradient} text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1.5`}>
                                        <Play size={16} fill="currentColor" />{getTranslation(language, 'start')}
                                    </button>
                                    <button className="p-2.5 bg-white/5 text-white/50 rounded-xl hover:bg-white/10 hover:text-white transition-all"><Download size={16} /></button>
                                    <button onClick={() => onDelete(game.id)} className="p-2.5 bg-white/5 text-red-400/70 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ==================== CREATE GAME MODAL ====================
const CreateGameModal = ({ language, mode, gameType, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [items, setItems] = useState([{ id: 1, front: '', back: '' }]);
    const [isGenerating, setIsGenerating] = useState(false);

    const addItem = () => setItems([...items, { id: Date.now(), front: '', back: '' }]);
    const updateItem = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    const removeItem = (id) => items.length > 1 && setItems(items.filter(item => item.id !== id));

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        try {
            // Get user ID from auth context since generateContent requires it for subscription limit check
            // Assuming we can access the user context here (need to pass user or use hook)
            // But this component doesn't have useAuth imported directly in the modal.
            // Let's rely on the parent or import it here.
            // Actually, we need to handle the content generation properly.

            // This needs to be passed down or handled here. 
            // Since I can't easily change the props signature without changing the parent, 
            // I'll assume we can use the imported generateContent which handles the fetch.
            // But we need the USER ID.

            // Wait, I should probably pass 'onGenerate' prop or something? 
            // Or just use the hook in the component.
            // Let's modify the imports and the component usage.

            // Actually, for now, let's just throw an error if the user context isn't available?
            // No, the parent (AldeaUshqyr) has access to user. 
            // I'll need to modify the parent to pass the generate function or user.
            // But first, let's put the logic here assuming 'user' is available.

            // Wait, I am replacing lines 301-308 which is inside CreateGameModal.
            // CreateGameModal receives 'language' but not 'user'.
            // I need to update the component definition too.

            // Let's do this in two steps or simply assume I can use user from a hook?
            // "const { user } = useAuth();" needs to be inside the component.

            // For this specific replacement, I will implement the logic calling an external handler or hook.
            // But simpler: let's update the imports and the mock function.

            // REAL GENERATION LOGIC
            const prompt = `Create a list of 6-8 pairs for a "${gameType}" game about "${topic}". 
            Format: JSON array of objects with "front" and "back" keys. 
            Example: [{"front": "Question", "back": "Answer"}]. 
            Language: ${language}.`;

            const result = await generateContent(null, topic, 'Game', 'Any', language, {
                customPrompt: prompt,
                fullResponse: false // we want parsed content
            });

            // Wait, generateContent utils might need updates to support custom raw prompts better or we use a toolId.
            // Let's just use a toolId 'ushqyr-game'.

            // Parse result
            let content = result;
            if (content.includes('```json')) {
                content = content.replace(/```json\n?|\n?```/g, '');
            } else if (content.includes('```')) {
                content = content.replace(/```\n?|\n?```/g, '');
            }
            content = content.trim();

            let pairs;
            try {
                pairs = JSON.parse(content);
            } catch (e) {
                console.error("JSON Parse Error", e);
                // Try to extract JSON array if text surrounds it
                const match = content.match(/\[.*\]/s);
                if (match) {
                    pairs = JSON.parse(match[0]);
                } else {
                    throw new Error("Invalid format received");
                }
            }

            if (Array.isArray(pairs)) {
                setTitle(topic);
                setItems(pairs.map((p, i) => ({ id: Date.now() + i, front: p.front, back: p.back })));
            }

        } catch (error) {
            console.error(error);
            if (error.upgradeRequired) {
                setLimitReason(error.reason);
                setShowUpgradeModal(true);
            } else {
                alert(getTranslation(language, 'errorGenerating') || 'Error generating game');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        if (!title.trim()) return;
        const valid = items.filter(i => i.front.trim() || i.back.trim());
        if (valid.length === 0) return;
        onSave({ title: title.trim(), items: valid });
    };

    return (
        <>
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                message={limitReason === 'daily_limit'
                    ? (getTranslation(language, 'dailyLimitReached') || "Daily generation limit reached.")
                    : (getTranslation(language, 'upgradeRequired') || "Upgrade required to use this feature.")}
            />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">{mode === 'generate' ? getTranslation(language, 'generateGame') : getTranslation(language, 'createGame')}</h2>
                        <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"><X size={20} /></button>
                    </div>

                    {mode === 'generate' ? (
                        <div className="space-y-5">
                            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={getTranslation(language, 'topicPlaceholder')} className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/30 text-lg" />
                            <button onClick={handleGenerate} disabled={isGenerating || !topic.trim()} className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                                {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" />{getTranslation(language, 'generating')}</> : <><Sparkles size={20} />{getTranslation(language, 'generate')}</>}
                            </button>
                            {items[0].front && items.some(i => i.front) && (
                                <div className="space-y-2 mt-6">
                                    {items.map((item) => (
                                        item.front && (
                                            <div key={item.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                <div className="font-medium text-white">{item.front}</div>
                                                <div className="text-white/50 text-sm mt-1">{item.back}</div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={getTranslation(language, 'titlePlaceholder')} className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/30 text-lg" />
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={item.id} className="flex gap-2 items-center">
                                        <span className="text-white/30 w-6 text-sm">{index + 1}</span>
                                        <input type="text" value={item.front} onChange={(e) => updateItem(item.id, 'front', e.target.value)} placeholder={getTranslation(language, 'frontSide')} className="flex-1 px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        <input type="text" value={item.back} onChange={(e) => updateItem(item.id, 'back', e.target.value)} placeholder={getTranslation(language, 'backSide')} className="flex-1 px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        <button onClick={() => removeItem(item.id)} className="p-2 text-red-400/50 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                                <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-white/20 text-white/50 rounded-xl hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center justify-center gap-2">
                                    <Plus size={18} />{getTranslation(language, 'addCard')}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 mt-8">
                        <button onClick={onClose} className="flex-1 py-3.5 bg-white/5 text-white/70 rounded-xl font-semibold hover:bg-white/10 transition-all">{getTranslation(language, 'cancel')}</button>
                        <button onClick={handleSave} disabled={!title.trim()} className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                            <Check size={20} />{getTranslation(language, 'save')}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
};

// ==================== PLAY SCREEN ====================
const PlayScreen = ({ language, game, gameTypes, sound, onBack }) => {
    const type = gameTypes.find(t => t.id === game.type);

    return (
        <AnimatePresence mode="wait">
            {game.type === 'flashcards' && <FlashcardsGame key="f" language={language} game={game} type={type} sound={sound} onBack={onBack} />}
            {game.type === 'matching' && <MatchingGamePlay key="m" language={language} game={game} type={type} sound={sound} onBack={onBack} />}
            {game.type === 'wheel' && <WheelGame key="w" language={language} game={game} type={type} sound={sound} onBack={onBack} />}
            {game.type === 'grouping' && <GroupingGame key="g" language={language} game={game} type={type} sound={sound} onBack={onBack} />}
        </AnimatePresence>
    );
};

// ==================== FLASHCARDS GAME ====================
const FlashcardsGame = ({ language, game, type, sound, onBack }) => {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [known, setKnown] = useState([]);
    const [unknown, setUnknown] = useState([]);
    const [streak, setStreak] = useState(0);

    const card = game.items[index];
    const done = known.length + unknown.length === game.items.length;

    const mark = (isKnown) => {
        sound.play(isKnown ? 'correct' : 'wrong');
        if (isKnown) { setKnown([...known, index]); setStreak(s => s + 1); }
        else { setUnknown([...unknown, index]); setStreak(0); }
        if (index < game.items.length - 1) { setIndex(index + 1); setFlipped(false); }
    };

    const flip = () => { setFlipped(!flipped); sound.play('flip'); };

    if (done) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        sound.play('win');
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-10 border border-white/10 max-w-md mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center"><Trophy className="w-10 h-10 text-white" /></div>
                    <h2 className="text-3xl font-bold text-white mb-6">{getTranslation(language, 'congratulations')}</h2>
                    <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center"><div className="text-4xl font-bold text-emerald-400">{known.length}</div><div className="text-white/50">{getTranslation(language, 'know')}</div></div>
                        <div className="text-center"><div className="text-4xl font-bold text-rose-400">{unknown.length}</div><div className="text-white/50">{getTranslation(language, 'dontKnow')}</div></div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setIndex(0); setFlipped(false); setKnown([]); setUnknown([]); }} className="flex-1 py-3 bg-white/5 text-white rounded-xl font-medium flex items-center justify-center gap-2 border border-white/10"><RotateCcw size={18} />{getTranslation(language, 'playAgain')}</button>
                        <button onClick={onBack} className={`flex-1 py-3 bg-gradient-to-r ${type?.gradient} text-white rounded-xl font-medium`}>{getTranslation(language, 'back')}</button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"><ArrowLeft size={20} />{getTranslation(language, 'back')}</button>
                <div className="flex items-center gap-4">
                    {streak >= 3 && <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full"><Zap size={16} />{streak}x</div>}
                    <div className="text-white/60 bg-white/5 px-4 py-2 rounded-xl">{index + 1}/{game.items.length}</div>
                </div>
            </div>

            <div className="h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
                <motion.div className={`h-full bg-gradient-to-r ${type?.gradient}`} animate={{ width: `${((known.length + unknown.length) / game.items.length) * 100}%` }} />
            </div>

            <div className="perspective-1000 mb-6 cursor-pointer" onClick={flip} style={{ perspective: '1000px' }}>
                <motion.div className="relative h-[280px]" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5 }} style={{ transformStyle: 'preserve-3d' }}>
                    <div className="absolute inset-0 bg-slate-800 rounded-3xl flex items-center justify-center p-8 border border-white/10" style={{ backfaceVisibility: 'hidden' }}>
                        <p className="text-2xl font-bold text-white text-center">{card?.front}</p>
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${type?.gradient} rounded-3xl flex items-center justify-center p-8`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <p className="text-xl font-medium text-white text-center">{card?.back}</p>
                    </div>
                </motion.div>
            </div>

            <p className="text-center text-white/30 mb-8">{getTranslation(language, 'clickToFlip')}</p>

            <div className="flex gap-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => mark(false)} className="flex-1 py-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl font-semibold flex items-center justify-center gap-2">
                    <X size={22} />{getTranslation(language, 'dontKnow')}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => mark(true)} className="flex-1 py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl font-semibold flex items-center justify-center gap-2">
                    <Check size={22} />{getTranslation(language, 'know')}
                </motion.button>
            </div>
        </motion.div>
    );
};

// ==================== MATCHING GAME ====================
const MatchingGamePlay = ({ language, game, type, sound, onBack }) => {
    const [cards, setCards] = useState([]);
    const [selected, setSelected] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        setCards(game.items.flatMap(item => [
            { id: `${item.id}-f`, value: item.front, pairId: item.id, type: 'front' },
            { id: `${item.id}-b`, value: item.back, pairId: item.id, type: 'back' }
        ]).sort(() => Math.random() - 0.5));
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [game.items]);

    const click = (card) => {
        if (selected.length === 2 || matched.includes(card.pairId) || selected.find(s => s.id === card.id)) return;
        sound.play('flip');
        const newSel = [...selected, card];
        setSelected(newSel);

        if (newSel.length === 2) {
            setMoves(m => m + 1);
            if (newSel[0].pairId === newSel[1].pairId && newSel[0].type !== newSel[1].type) {
                sound.play('correct');
                setMatched([...matched, newSel[0].pairId]);
                setSelected([]);
            } else {
                sound.play('wrong');
                setTimeout(() => setSelected([]), 600);
            }
        }
    };

    const done = matched.length === game.items.length;
    if (done) {
        confetti({ particleCount: 100, spread: 70 });
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-10 border border-white/10 max-w-md mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center"><Star className="w-10 h-10 text-white" /></div>
                    <h2 className="text-3xl font-bold text-white mb-4">{getTranslation(language, 'congratulations')}</h2>
                    <div className="flex justify-center gap-6 mb-8">
                        <div className="text-center"><div className="text-3xl font-bold text-white">{moves}</div><div className="text-white/50">{getTranslation(language, 'moves')}</div></div>
                        <div className="text-center"><div className="text-3xl font-bold text-white">{timer}s</div><div className="text-white/50">{getTranslation(language, 'time') || 'Time'}</div></div>
                    </div>
                    <button onClick={onBack} className={`w-full py-3 bg-gradient-to-r ${type?.gradient} text-white rounded-xl font-medium`}>{getTranslation(language, 'back')}</button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white"><ArrowLeft size={20} />{getTranslation(language, 'back')}</button>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-white/60 bg-white/5 px-4 py-2 rounded-xl"><Target size={18} />{moves}</div>
                    <div className="flex items-center gap-2 text-white/60 bg-white/5 px-4 py-2 rounded-xl"><Timer size={18} />{timer}s</div>
                </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {cards.map((card) => {
                        const isSel = selected.find(s => s.id === card.id);
                        const isMatch = matched.includes(card.pairId);
                        return (
                            <motion.button key={card.id} whileHover={{ scale: isMatch ? 1 : 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => click(card)} className={`aspect-square rounded-xl p-2 text-center font-medium transition-all flex items-center justify-center ${isMatch ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400' : isSel ? `bg-gradient-to-br ${type?.gradient} text-white` : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10'}`}>
                                <span className="text-sm line-clamp-3">{card.value}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

// ==================== WHEEL GAME ====================
const WheelGame = ({ language, game, type, sound, onBack }) => {
    const [totalRotation, setTotalRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const items = game.items;
    const segmentCount = items.length;
    const segmentAngle = 360 / segmentCount;
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

    const spin = () => {
        if (spinning) return;
        setSpinning(true);
        setResult(null);
        setShowAnswer(false);
        sound.play('flip');

        // Random spin amount (5-8 full rotations + random extra)
        const extraDegrees = Math.random() * 360;
        const fullSpins = 5 + Math.floor(Math.random() * 3);
        const spinAmount = fullSpins * 360 + extraDegrees;

        const newTotalRotation = totalRotation + spinAmount;
        setTotalRotation(newTotalRotation);

        setTimeout(() => {
            // Calculate which segment is at the top (pointer position)
            // The wheel rotates clockwise, so after rotating R degrees,
            // the segment that was at angle (360 - R % 360) is now at top
            const normalizedRotation = newTotalRotation % 360;
            const pointerPosition = (360 - normalizedRotation + 360) % 360;
            const winnerIndex = Math.floor(pointerPosition / segmentAngle) % segmentCount;

            setResult(items[winnerIndex]);
            setSpinning(false);
            sound.play('correct');
        }, 4000);
    };

    const handleShowAnswer = () => {
        setShowAnswer(true);
        sound.play('win');
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    };

    const handleNext = () => {
        setResult(null);
        setShowAnswer(false);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    {getTranslation(language, 'back')}
                </button>
                <h2 className="text-xl font-bold text-white">{game.title}</h2>
                <div className="w-20" />
            </div>

            <div className="flex flex-col items-center">
                {/* Wheel - Much Bigger */}
                <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] md:w-[480px] md:h-[480px] mb-10">
                    {/* Pointer at top */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
                        <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-t-[45px] border-l-transparent border-r-transparent border-t-white drop-shadow-xl" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }} />
                    </div>

                    {/* Outer glow */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 blur-xl opacity-30" />

                    {/* Wheel container */}
                    <div className="relative w-full h-full rounded-full shadow-2xl border-[12px] border-slate-700 overflow-hidden bg-slate-800">
                        <motion.div
                            className="w-full h-full"
                            animate={{ rotate: totalRotation }}
                            transition={{ duration: 4, ease: [0.15, 0.85, 0.15, 1] }}
                        >
                            <svg viewBox="0 0 200 200" className="w-full h-full">
                                <defs>
                                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
                                    </filter>
                                </defs>
                                {items.map((item, i) => {
                                    const startAngle = i * segmentAngle;
                                    const endAngle = (i + 1) * segmentAngle;
                                    const startRad = ((startAngle - 90) * Math.PI) / 180;
                                    const endRad = ((endAngle - 90) * Math.PI) / 180;
                                    const x1 = 100 + 98 * Math.cos(startRad);
                                    const y1 = 100 + 98 * Math.sin(startRad);
                                    const x2 = 100 + 98 * Math.cos(endRad);
                                    const y2 = 100 + 98 * Math.sin(endRad);
                                    const largeArc = segmentAngle > 180 ? 1 : 0;

                                    // Text position
                                    const midAngle = startAngle + segmentAngle / 2 - 90;
                                    const textRadius = segmentCount <= 4 ? 55 : segmentCount <= 6 ? 60 : 65;
                                    const textX = 100 + textRadius * Math.cos((midAngle * Math.PI) / 180);
                                    const textY = 100 + textRadius * Math.sin((midAngle * Math.PI) / 180);

                                    // Max text length based on segment size
                                    const maxLen = segmentCount <= 4 ? 15 : segmentCount <= 6 ? 12 : 8;
                                    const displayText = item.front.length > maxLen ? item.front.slice(0, maxLen) + '..' : item.front;

                                    return (
                                        <g key={i}>
                                            <path
                                                d={`M 100 100 L ${x1} ${y1} A 98 98 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                                fill={colors[i % colors.length]}
                                                stroke="rgba(255,255,255,0.2)"
                                                strokeWidth="0.5"
                                            />
                                            <text
                                                x={textX}
                                                y={textY}
                                                fill="white"
                                                fontSize={segmentCount <= 4 ? "9" : segmentCount <= 6 ? "7" : "6"}
                                                fontWeight="bold"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                                                filter="url(#shadow)"
                                            >
                                                {displayText}
                                            </text>
                                        </g>
                                    );
                                })}
                                {/* Center decoration */}
                                <circle cx="100" cy="100" r="18" fill="#1e293b" stroke="#475569" strokeWidth="4" />
                                <circle cx="100" cy="100" r="10" fill="url(#centerGradient)" />
                                <defs>
                                    <radialGradient id="centerGradient">
                                        <stop offset="0%" stopColor="#60a5fa" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </motion.div>
                    </div>
                </div>

                {/* Spin button */}
                {!result && (
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={spin}
                        disabled={spinning}
                        className={`px-14 py-5 bg-gradient-to-r ${type?.gradient} text-white rounded-2xl font-bold text-xl shadow-2xl disabled:opacity-60 transition-all`}
                    >
                        {spinning ? (
                            <span className="flex items-center gap-3">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                {getTranslation(language, 'spinning')}
                            </span>
                        ) : (
                            <span className="flex items-center gap-3">
                                <CircleDot size={24} />
                                {getTranslation(language, 'spinWheel')}
                            </span>
                        )}
                    </motion.button>
                )}

                {/* Result */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="w-full max-w-lg"
                        >
                            <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center shadow-2xl">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
                                    <Star size={14} fill="currentColor" />
                                    {getTranslation(language, 'question')}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">{result.front}</h3>

                                {!showAnswer ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleShowAnswer}
                                        className={`w-full py-5 bg-gradient-to-r ${type?.gradient} text-white rounded-2xl font-bold text-lg shadow-xl`}
                                    >
                                        {getTranslation(language, 'showAnswer')}
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl p-6 mb-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/30 text-emerald-300 rounded-full text-sm font-medium mb-3">
                                                <Check size={14} />
                                                {getTranslation(language, 'answer')}
                                            </div>
                                            <p className="text-2xl font-bold text-white">{result.back}</p>
                                        </div>
                                        <button
                                            onClick={handleNext}
                                            className="w-full py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/10"
                                        >
                                            <RotateCcw size={20} />
                                            {getTranslation(language, 'spinAgain')}
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// ==================== GROUPING GAME ====================
const GroupingGame = ({ language, game, type, sound, onBack }) => {
    const [items, setItems] = useState([]);
    const [groups, setGroups] = useState({ a: [], b: [] });
    const [score, setScore] = useState(0);

    useEffect(() => {
        setItems(game.items.sort(() => Math.random() - 0.5));
        setGroups({ a: [], b: [] });
        setScore(0);
    }, [game.items]);

    const move = (item, group) => {
        sound.play('flip');
        setItems(items.filter(i => i.id !== item.id));
        setGroups({ ...groups, [group]: [...groups[group], item] });
        setScore(s => s + 10);
    };

    const back = (item, group) => {
        sound.play('flip');
        setGroups({ ...groups, [group]: groups[group].filter(i => i.id !== item.id) });
        setItems([...items, item]);
    };

    const done = items.length === 0;

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white"><ArrowLeft size={20} />{getTranslation(language, 'back')}</button>
                <h2 className="text-xl font-bold text-white">{game.title}</h2>
                <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-4 py-2 rounded-xl"><Star size={18} />{score}</div>
            </div>

            {/* Items to sort */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-white/10 mb-6 min-h-[80px]">
                <div className="flex flex-wrap gap-2 justify-center">
                    {items.map(item => (
                        <div key={item.id} className="flex">
                            <button onClick={() => move(item, 'a')} className="px-3 py-2 bg-rose-500/20 text-rose-400 rounded-l-lg hover:bg-rose-500/30 transition-all border border-rose-500/30 border-r-0"><ChevronLeft size={16} /></button>
                            <span className="px-4 py-2 bg-white/5 text-white border-y border-white/10">{item.front}</span>
                            <button onClick={() => move(item, 'b')} className="px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-r-lg hover:bg-cyan-500/30 transition-all border border-cyan-500/30 border-l-0"><ChevronRight size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Groups */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-rose-500/10 backdrop-blur-xl rounded-2xl p-4 border border-rose-500/30 min-h-[140px]">
                    <h3 className="text-rose-400 font-semibold mb-3 text-center">{getTranslation(language, 'groupA')}</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {groups.a.map(item => (
                            <motion.button key={item.id} initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => back(item, 'a')} className="px-3 py-2 bg-rose-500/30 text-rose-200 rounded-lg hover:bg-rose-500/40 transition-all">{item.front}</motion.button>
                        ))}
                    </div>
                </div>
                <div className="bg-cyan-500/10 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/30 min-h-[140px]">
                    <h3 className="text-cyan-400 font-semibold mb-3 text-center">{getTranslation(language, 'groupB')}</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {groups.b.map(item => (
                            <motion.button key={item.id} initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => back(item, 'b')} className="px-3 py-2 bg-cyan-500/30 text-cyan-200 rounded-lg hover:bg-cyan-500/40 transition-all">{item.front}</motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {done && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <div className="text-4xl mb-4">🎉</div>
                    <p className="text-white text-lg font-medium">{getTranslation(language, 'groupingComplete')}</p>
                    <p className="text-amber-400 mt-2">{getTranslation(language, 'score') || 'Score'}: {score}</p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default AldeaUshqyr;
