import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../translations/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Play, Plus, Users, Monitor, QrCode, Hash, Trash2, Edit3, 
    Trophy, Clock, Zap, CheckCircle, X, Crown, Medal, Award, Star,
    Copy, Check, Smartphone, ArrowRight, Settings, Shuffle, Timer,
    Volume2, VolumeX, Sparkles, Target, Brain, Loader2, Wifi, WifiOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
// QR Code will be generated via API
import { quizzesApi, sessionsApi, playersApi, answersApi, createPoller } from '../utils/tapqyrApi';

// ==================== SOUND UTILITIES ====================
const playSound = (type) => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);

        switch (type) {
            case 'correct':
                osc.frequency.setValueAtTime(523.25, ctx.currentTime);
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
                osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
                break;
            case 'wrong':
                osc.frequency.setValueAtTime(200, ctx.currentTime);
                osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
                break;
            case 'tick':
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.05);
                break;
            case 'join':
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.setValueAtTime(550, ctx.currentTime + 0.1);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.2);
                break;
            case 'countdown':
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.15);
                break;
            case 'victory':
                [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
                    g.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.15);
                    o.start(ctx.currentTime + i * 0.15);
                    o.stop(ctx.currentTime + i * 0.15 + 0.3);
                });
                break;
        }
    } catch (e) {}
};

// ==================== GENERATE GAME CODE ====================
const generateGameCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// ==================== MAIN COMPONENT ====================
const AldeaTapqyr = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [screen, setScreen] = useState('home');
    const [quizzes, setQuizzes] = useState([]);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [gameSession, setGameSession] = useState(null);
    const [joinCode, setJoinCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isConnected, setIsConnected] = useState(true);
    const [loading, setLoading] = useState(false);
    const pollerRef = useRef(null);

    // Load quizzes from database
    useEffect(() => {
        const loadQuizzes = async () => {
            if (user?.id) {
                try {
                    const data = await quizzesApi.getAll(user.id);
                    setQuizzes(data);
                } catch (err) {
                    console.error('Failed to load quizzes:', err);
                    setQuizzes([]);
                }
            }
        };
        loadQuizzes();
    }, [user?.id]);

    // Check for join code in URL
    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            setJoinCode(code.toUpperCase());
            setScreen('join');
        }
    }, [searchParams]);

    // Cleanup poller on unmount
    useEffect(() => {
        return () => {
            if (pollerRef.current) pollerRef.current();
        };
    }, []);

    const handleCreateQuiz = async (quiz) => {
        if (!user?.id) {
            alert('Please login to create quizzes');
            return;
        }
        setLoading(true);
        try {
            await quizzesApi.create(user.id, quiz.title, quiz.questions);
            const data = await quizzesApi.getAll(user.id);
            setQuizzes(data);
            setScreen('quizList');
        } catch (err) {
            console.error('Failed to create quiz:', err);
            alert('Failed to create quiz');
        }
        setLoading(false);
    };

    const handleDeleteQuiz = async (id) => {
        try {
            await quizzesApi.delete(id);
            setQuizzes(quizzes.filter(q => q.id !== id));
        } catch (err) {
            console.error('Failed to delete quiz:', err);
        }
    };

    const handleStartGame = async (quiz) => {
        if (!user?.id) {
            alert('Please login to host games');
            return;
        }
        setLoading(true);
        try {
            const session = await sessionsApi.create(quiz.id, user.id);
            setCurrentQuiz(quiz);
            setGameSession({
                ...session,
                quiz: { ...quiz, questions: typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions },
                players: []
            });
            setScreen('lobby');
        } catch (err) {
            console.error('Failed to start game:', err);
            alert('Failed to start game');
        }
        setLoading(false);
    };

    const handleJoinGame = async () => {
        if (joinCode.length !== 6 || !playerName.trim()) return;
        
        setLoading(true);
        try {
            const result = await playersApi.join(joinCode, playerName.trim());
            
            setGameSession({
                code: joinCode,
                playerName: playerName.trim(),
                playerId: result.player.id,
                isPlayer: true,
                sessionInfo: result.session
            });
            setScreen('waiting');
        } catch (err) {
            console.error('Failed to join game:', err);
            alert(err.message || getTranslation(language, 'gameNotFound'));
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.3, 1], x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div 
                    className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-3xl"
                    animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                />
                <motion.div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* Top Bar */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                    <span className="text-sm font-medium">{isConnected ? 'Online' : 'Offline'}</span>
                </div>
                <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {screen === 'home' && (
                    <HomeScreen 
                        key="home"
                        language={language}
                        onCreateQuiz={() => setScreen('create')}
                        onMyQuizzes={() => setScreen('quizList')}
                        onJoin={() => setScreen('join')}
                        onBack={() => navigate('/games')}
                    />
                )}
                {screen === 'create' && (
                    <CreateQuizScreen 
                        key="create"
                        language={language}
                        onSave={handleCreateQuiz}
                        onBack={() => setScreen('home')}
                    />
                )}
                {screen === 'quizList' && (
                    <QuizListScreen 
                        key="quizList"
                        language={language}
                        quizzes={quizzes}
                        onStart={handleStartGame}
                        onDelete={handleDeleteQuiz}
                        onBack={() => setScreen('home')}
                        onCreate={() => setScreen('create')}
                    />
                )}
                {screen === 'lobby' && gameSession && (
                    <LobbyScreen 
                        key="lobby"
                        language={language}
                        session={gameSession}
                        soundEnabled={soundEnabled}
                        onStart={async () => {
                            // Game will be started in GameScreen countdown
                            setScreen('game');
                        }}
                        onBack={async () => { 
                            await sessionsApi.delete(gameSession.code).catch(() => {});
                            setGameSession(null); 
                            setScreen('quizList'); 
                        }}
                    />
                )}
                {screen === 'game' && gameSession && (
                    <GameScreen 
                        key="game"
                        language={language}
                        session={gameSession}
                        setSession={setGameSession}
                        soundEnabled={soundEnabled}
                        onFinish={(results) => { 
                            setGameSession(prev => ({ ...prev, results })); 
                            setScreen('results'); 
                        }}
                    />
                )}
                {screen === 'join' && (
                    <JoinScreen 
                        key="join"
                        language={language}
                        code={joinCode}
                        name={playerName}
                        onCodeChange={setJoinCode}
                        onNameChange={setPlayerName}
                        onJoin={handleJoinGame}
                        onBack={() => { setJoinCode(''); setPlayerName(''); setScreen('home'); }}
                    />
                )}
                {screen === 'waiting' && gameSession?.isPlayer && (
                    <WaitingScreen 
                        key="waiting"
                        language={language}
                        session={gameSession}
                        onGameStart={() => setScreen('play')}
                    />
                )}
                {screen === 'play' && gameSession?.isPlayer && (
                    <PlayerScreen 
                        key="play"
                        language={language}
                        session={gameSession}
                        setSession={setGameSession}
                        soundEnabled={soundEnabled}
                    />
                )}
                {screen === 'results' && gameSession && (
                    <ResultsScreen 
                        key="results"
                        language={language}
                        session={gameSession}
                        onPlayAgain={async () => { 
                            await sessionsApi.delete(gameSession.code).catch(() => {});
                            setGameSession(null); 
                            setScreen('quizList'); 
                        }}
                        onHome={async () => { 
                            await sessionsApi.delete(gameSession.code).catch(() => {});
                            setGameSession(null); 
                            setScreen('home'); 
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// ==================== HOME SCREEN ====================
const HomeScreen = ({ language, onCreateQuiz, onMyQuizzes, onJoin, onBack }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10 relative z-10"
        >
            <button 
                onClick={onBack}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 sm:gap-3 text-white/70 hover:text-white transition-colors text-sm sm:text-lg"
            >
                <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">{getTranslation(language, 'back')}</span>
            </button>

            <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="mb-6 sm:mb-10"
            >
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl sm:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-purple-500/40 rotate-3">
                    <Brain className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white" />
                </div>
            </motion.div>

            <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-3 sm:mb-5 text-center px-4"
            >
                Aldea <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">Tapqyr</span>
            </motion.h1>

            <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-xl md:text-2xl text-white/60 mb-8 sm:mb-12 md:mb-14 text-center max-w-lg px-4"
            >
                {getTranslation(language, 'tapqyrSubtitle')}
            </motion.p>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-3 sm:gap-4 md:gap-5 w-full max-w-lg px-2"
            >
                <button 
                    onClick={onMyQuizzes}
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-7 flex items-center gap-3 sm:gap-4 md:gap-5 hover:shadow-2xl hover:shadow-purple-500/40 transition-all"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center relative z-10 p-3 sm:p-4 flex-shrink-0">
                        <Monitor className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <div className="text-left relative z-10 flex-1 min-w-0">
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-white block">{getTranslation(language, 'hostGame')}</span>
                        <span className="text-white/60 text-sm sm:text-base md:text-lg">{getTranslation(language, 'hostGameDesc')}</span>
                    </div>
                    <ArrowRight className="text-white/50 group-hover:text-white group-hover:translate-x-2 transition-all relative z-10 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex-shrink-0" />
                </button>

                <button 
                    onClick={onJoin}
                    className="group relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-7 flex items-center gap-3 sm:gap-4 md:gap-5 hover:shadow-2xl hover:shadow-cyan-500/40 transition-all"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center relative z-10 p-3 sm:p-4 flex-shrink-0">
                        <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <div className="text-left relative z-10 flex-1 min-w-0">
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-white block">{getTranslation(language, 'joinGame')}</span>
                        <span className="text-white/60 text-sm sm:text-base md:text-lg">{getTranslation(language, 'joinGameDesc')}</span>
                    </div>
                    <ArrowRight className="text-white/50 group-hover:text-white group-hover:translate-x-2 transition-all relative z-10 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex-shrink-0" />
                </button>

                <button 
                    onClick={onCreateQuiz}
                    className="group relative overflow-hidden bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-7 flex items-center gap-3 sm:gap-4 md:gap-5 hover:bg-white/20 transition-all"
                >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center p-3 sm:p-4 flex-shrink-0">
                        <Plus className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-white block">{getTranslation(language, 'createQuiz')}</span>
                        <span className="text-white/60 text-sm sm:text-base md:text-lg">{getTranslation(language, 'createQuizDesc')}</span>
                    </div>
                    <ArrowRight className="text-white/50 group-hover:text-white group-hover:translate-x-2 transition-all w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex-shrink-0" />
                </button>
            </motion.div>
        </motion.div>
    );
};

// ==================== CREATE QUIZ SCREEN ====================
const CreateQuizScreen = ({ language, onSave, onBack }) => {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([
        { question: '', answers: ['', '', '', ''], correctIndex: 0, timeLimit: 20 }
    ]);

    const addQuestion = () => {
        setQuestions(prev => [...prev, { question: '', answers: ['', '', '', ''], correctIndex: 0, timeLimit: 20 }]);
    };

    const updateQuestion = (index, field, value) => {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
    };

    const updateAnswer = (qIndex, aIndex, value) => {
        setQuestions(prev => prev.map((q, i) => i === qIndex ? { 
            ...q, 
            answers: q.answers.map((a, j) => j === aIndex ? value : a)
        } : q));
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            setQuestions(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSave = () => {
        if (title.trim() && questions.every(q => q.question.trim() && q.answers.every(a => a.trim()))) {
            onSave({
                title: title.trim(),
                questions,
                createdAt: new Date().toISOString()
            });
        }
    };

    const isValid = title.trim() && questions.every(q => q.question.trim() && q.answers.every(a => a.trim()));

    const answerColors = [
        'from-red-500 to-rose-600',
        'from-blue-500 to-indigo-600',
        'from-amber-500 to-orange-600',
        'from-emerald-500 to-green-600'
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6 relative z-10"
        >
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8 md:mb-10">
                    <button onClick={onBack} className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0">
                        <ArrowLeft size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                    </button>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{getTranslation(language, 'createQuiz')}</h1>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 border border-white/10">
                    <label className="text-white/60 text-sm sm:text-base md:text-lg mb-2 sm:mb-3 block">{getTranslation(language, 'quizTitle')}</label>
                    <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={getTranslation(language, 'enterQuizTitle')}
                        className="w-full bg-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 text-white text-base sm:text-lg md:text-xl placeholder-white/40 border border-white/10 focus:border-purple-500 focus:outline-none"
                    />
                </div>

                <div className="space-y-4 sm:space-y-6 md:space-y-8 mb-4 sm:mb-6 md:mb-8">
                    {questions.map((q, qIndex) => (
                        <motion.div 
                            key={qIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/10"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <span className="text-purple-400 font-bold text-base sm:text-lg md:text-xl">{getTranslation(language, 'questionNum').replace('{n}', qIndex + 1)}</span>
                                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                    <div className="flex items-center gap-2 sm:gap-3 bg-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3">
                                        <Timer size={16} className="sm:w-5 sm:h-5 text-white/60" />
                                        <select 
                                            value={q.timeLimit}
                                            onChange={(e) => updateQuestion(qIndex, 'timeLimit', parseInt(e.target.value))}
                                            className="bg-transparent text-white text-sm sm:text-base md:text-lg focus:outline-none cursor-pointer"
                                        >
                                            {[10, 15, 20, 30, 45, 60].map(t => (
                                                <option key={t} value={t} className="bg-slate-800">{t}s</option>
                                            ))}
                                        </select>
                                    </div>
                                    {questions.length > 1 && (
                                        <button 
                                            onClick={() => removeQuestion(qIndex)}
                                            className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-red-500/20 rounded-lg sm:rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors flex-shrink-0"
                                        >
                                            <Trash2 size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <input 
                                type="text"
                                value={q.question}
                                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                placeholder={getTranslation(language, 'enterQuestion')}
                                className="w-full bg-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 text-white text-base sm:text-lg md:text-xl placeholder-white/40 border border-white/10 focus:border-purple-500 focus:outline-none mb-4 sm:mb-6"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {q.answers.map((answer, aIndex) => (
                                    <div 
                                        key={aIndex}
                                        className={`relative rounded-xl sm:rounded-2xl overflow-hidden ${q.correctIndex === aIndex ? 'ring-2 sm:ring-3 ring-green-500' : ''}`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-r ${answerColors[aIndex]} opacity-40`} />
                                        <div className="relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5">
                                            <button 
                                                onClick={() => updateQuestion(qIndex, 'correctIndex', aIndex)}
                                                className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors text-lg sm:text-xl md:text-2xl font-bold flex-shrink-0 ${q.correctIndex === aIndex ? 'bg-green-500 text-white' : 'bg-white/20 text-white/60'}`}
                                            >
                                                {q.correctIndex === aIndex ? <Check size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" /> : ['▲', '◆', '●', '■'][aIndex]}
                                            </button>
                                            <input 
                                                type="text"
                                                value={answer}
                                                onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                                                placeholder={`${getTranslation(language, 'answer')} ${aIndex + 1}`}
                                                className="flex-1 bg-transparent text-white text-sm sm:text-base md:text-lg placeholder-white/40 focus:outline-none min-w-0"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <button 
                    onClick={addQuestion}
                    className="w-full bg-white/10 hover:bg-white/20 border-2 border-dashed border-white/30 rounded-2xl sm:rounded-3xl py-5 sm:py-6 md:py-8 text-white/70 hover:text-white flex items-center justify-center gap-3 sm:gap-4 transition-all mb-4 sm:mb-6 md:mb-8 text-base sm:text-lg md:text-xl"
                >
                    <Plus size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                    <span className="font-semibold">{getTranslation(language, 'addQuestion')}</span>
                </button>

                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={!isValid}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl py-4 sm:py-5 md:py-6 text-white font-bold text-lg sm:text-xl md:text-2xl shadow-xl shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 sm:gap-4"
                >
                    <Check size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                    {getTranslation(language, 'saveQuiz')}
                </motion.button>
            </div>
        </motion.div>
    );
};

// ==================== QUIZ LIST SCREEN ====================
const QuizListScreen = ({ language, quizzes, onStart, onDelete, onBack, onCreate }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6 relative z-10"
        >
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 mb-6 sm:mb-8 md:mb-10">
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                        <button onClick={onBack} className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0">
                            <ArrowLeft size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                        </button>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{getTranslation(language, 'myQuizzes')}</h1>
                    </div>
                    <button 
                        onClick={onCreate}
                        className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-white font-semibold text-sm sm:text-base md:text-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all w-full sm:w-auto justify-center"
                    >
                        <Plus size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        {getTranslation(language, 'createNew')}
                    </button>
                </div>

                {quizzes.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 md:py-24 px-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white/10 rounded-xl sm:rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8">
                            <Brain className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white/40" />
                        </div>
                        <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">{getTranslation(language, 'noQuizzes')}</h2>
                        <p className="text-white/50 text-base sm:text-lg md:text-xl mb-6 sm:mb-8">{getTranslation(language, 'noQuizzesDesc')}</p>
                        <button 
                            onClick={onCreate}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-white font-bold text-base sm:text-lg md:text-xl hover:shadow-xl hover:shadow-purple-500/30 transition-all"
                        >
                            {getTranslation(language, 'createFirstQuiz')}
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:gap-4 md:gap-5">
                        {quizzes.map((quiz, index) => (
                            <motion.div 
                                key={quiz.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/10 hover:border-white/20 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 break-words">{quiz.title}</h3>
                                        <p className="text-white/50 text-sm sm:text-base md:text-lg">{quiz.questions.length} {getTranslation(language, 'questions')}</p>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
                                        <button 
                                            onClick={() => onDelete(quiz.id)}
                                            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-red-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
                                        >
                                            <Trash2 size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                        </button>
                                        <button 
                                            onClick={() => onStart(quiz)}
                                            className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-white font-bold text-sm sm:text-base md:text-lg hover:shadow-xl hover:shadow-green-500/30 transition-all"
                                        >
                                            <Play size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" fill="white" />
                                            <span className="hidden sm:inline">{getTranslation(language, 'startGame')}</span>
                                            <span className="sm:hidden">Start</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ==================== LOBBY SCREEN ====================
const LobbyScreen = ({ language, session, soundEnabled, onStart, onBack }) => {
    const [qrCode, setQrCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [players, setPlayers] = useState([]);
    const prevPlayerCount = useRef(0);

    const joinUrl = `${window.location.origin}/games/aldea-tapqyr?code=${session.code}`;

    useEffect(() => {
        // Generate QR code using API (larger size for better scanning)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(joinUrl)}`;
        setQrCode(qrUrl);
    }, [joinUrl]);

    // Poll for players from database
    useEffect(() => {
        const stopPolling = createPoller(session.code, null, (data) => {
            if (data.players) {
                if (data.players.length > prevPlayerCount.current && soundEnabled) {
                    playSound('join');
                }
                prevPlayerCount.current = data.players.length;
                setPlayers(data.players);
            }
        }, 1500);
        
        return stopPolling;
    }, [session.code, soundEnabled]);

    const copyCode = () => {
        navigator.clipboard.writeText(session.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 md:py-10 relative z-10"
        >
            <button onClick={onBack} className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 sm:gap-3 text-white/70 hover:text-white transition-colors text-sm sm:text-lg">
                <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">{getTranslation(language, 'back')}</span>
            </button>

            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center mb-6 sm:mb-8 md:mb-10 px-2"
            >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">{getTranslation(language, 'joinAt')}</h1>
                <p className="text-purple-300 text-sm sm:text-base md:text-lg lg:text-2xl font-mono break-all">{window.location.host}/games/aldea-tapqyr</p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 items-center mb-6 sm:mb-8 md:mb-10 w-full max-w-4xl px-2">
                <motion.div 
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="bg-white rounded-xl sm:rounded-2xl md:rounded-[2rem] p-3 sm:p-4 md:p-5 lg:p-6 shadow-2xl"
                >
                    {qrCode && <img src={qrCode} alt="QR Code" className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80" />}
                </motion.div>

                <div className="text-white/40 text-2xl sm:text-3xl font-bold">{getTranslation(language, 'or')}</div>

                <motion.div 
                    initial={{ scale: 0, rotate: 10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className="text-center w-full sm:w-auto"
                >
                    <p className="text-white/60 text-base sm:text-lg md:text-xl mb-3 sm:mb-4">{getTranslation(language, 'gamePin')}</p>
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 justify-center">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 border-2 border-white/20">
                            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-wider sm:tracking-[0.2em] md:tracking-[0.3em]">{session.code}</span>
                        </div>
                        <button 
                            onClick={copyCode}
                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-colors p-3 sm:p-4 md:p-5 flex-shrink-0"
                        >
                            {copied ? <Check size={20} className="sm:w-6 sm:h-6 md:w-8 md:h-8" /> : <Copy size={20} className="sm:w-6 sm:h-6 md:w-8 md:h-8" />}
                        </button>
                    </div>
                </motion.div>
            </div>

            <div className="w-full max-w-3xl mb-6 sm:mb-8 md:mb-10 px-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{getTranslation(language, 'players')} ({players.length})</h2>
                    <div className="flex items-center gap-2 sm:gap-3 text-white/50 text-sm sm:text-base md:text-lg">
                        <Users size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        <span className="hidden sm:inline">{getTranslation(language, 'waitingForPlayers')}</span>
                        <span className="sm:hidden">Waiting...</span>
                        <Loader2 size={16} className="sm:w-5 sm:h-5 animate-spin" />
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 sm:gap-4 justify-center min-h-[100px] sm:min-h-[120px] md:min-h-[140px] bg-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
                    <AnimatePresence>
                        {players.length === 0 && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center w-full text-white/30 text-sm sm:text-base md:text-lg"
                            >
                                {getTranslation(language, 'noPlayersYet') || 'Waiting for players to join...'}
                            </motion.div>
                        )}
                        {players.map((player) => (
                            <motion.div 
                                key={player.id}
                                initial={{ scale: 0, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0 }}
                                className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-xl rounded-xl sm:rounded-2xl px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-4 flex items-center gap-3 sm:gap-4 border border-white/20"
                            >
                                <img src={player.avatar} alt="" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex-shrink-0" />
                                <span className="text-white font-semibold text-sm sm:text-base md:text-lg">{player.name}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                disabled={players.length === 0}
                className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl sm:rounded-3xl px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 text-white font-bold text-lg sm:text-xl md:text-2xl shadow-2xl shadow-green-500/30 disabled:opacity-50 flex items-center gap-3 sm:gap-4 w-full sm:w-auto max-w-sm sm:max-w-none justify-center"
            >
                <Play size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" fill="white" />
                {getTranslation(language, 'startGame')}
            </motion.button>

            <p className="text-white/40 mt-3 sm:mt-4 text-center text-xs sm:text-sm px-4">
                {getTranslation(language, 'openAnotherTab') || 'Open another browser tab to join as a player'}
            </p>
        </motion.div>
    );
};

// ==================== GAME SCREEN (HOST VIEW) ====================
const GameScreen = ({ language, session, setSession, soundEnabled, onFinish }) => {
    const [currentQ, setCurrentQ] = useState(-1);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [players, setPlayers] = useState(session.players || []);

    const questions = typeof session.quiz.questions === 'string' 
        ? JSON.parse(session.quiz.questions) 
        : session.quiz.questions;

    // Countdown before start
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                if (soundEnabled) playSound('countdown');
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && currentQ === -1) {
            // Start game via API
            sessionsApi.update(session.code, 'start').then(() => {
                setCurrentQ(0);
            }).catch(console.error);
        }
    }, [countdown, currentQ, session.code, soundEnabled]);

    // Question timer
    useEffect(() => {
        if (currentQ >= 0 && currentQ < questions.length && !showAnswer) {
            setTimeLeft(questions[currentQ].timeLimit);
            setAnsweredCount(0);
            
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setShowAnswer(true);
                        sessionsApi.update(session.code, 'showAnswer').catch(console.error);
                        if (soundEnabled) playSound('tick');
                        return 0;
                    }
                    if (prev <= 5 && soundEnabled) playSound('tick');
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [currentQ, showAnswer, session.code, questions, soundEnabled]);

    // Poll for player answers
    useEffect(() => {
        if (currentQ >= 0 && !showAnswer) {
            const stopPolling = createPoller(session.code, null, (data) => {
                setAnsweredCount(data.answeredCount || 0);
                if (data.players) setPlayers(data.players);
            }, 1000);
            return stopPolling;
        }
    }, [session.code, currentQ, showAnswer]);

    // Get updated scores when showing answer
    useEffect(() => {
        if (showAnswer) {
            playersApi.poll(session.code).then(data => {
                if (data?.players) setPlayers(data.players);
            }).catch(console.error);
        }
    }, [showAnswer, session.code]);

    const nextQuestion = async () => {
        if (currentQ < questions.length - 1) {
            setShowAnswer(false);
            const next = currentQ + 1;
            try {
                await sessionsApi.update(session.code, 'nextQuestion');
                setCurrentQ(next);
            } catch (err) {
                console.error('Failed to advance question:', err);
            }
        } else {
            // Game finished
            try {
                await sessionsApi.update(session.code, 'finish');
            } catch (err) {
                console.error(err);
            }
            if (soundEnabled) playSound('victory');
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
            onFinish({ scores: players, questions });
        }
    };

    const answerColors = [
        'from-red-500 to-rose-600',
        'from-blue-500 to-indigo-600',
        'from-amber-500 to-orange-600',
        'from-emerald-500 to-green-600'
    ];

    const answerSymbols = ['▲', '◆', '●', '■'];

    if (countdown > 0 || currentQ < 0) {
        return (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="min-h-screen flex items-center justify-center"
            >
                <motion.div 
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="text-[120px] sm:text-[150px] md:text-[180px] lg:text-[200px] font-black text-white"
                >
                    {countdown > 0 ? countdown : '🎮'}
                </motion.div>
            </motion.div>
        );
    }

    const currentQuestion = questions[currentQ];
    if (!currentQuestion) {
        return (
            <motion.div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-20 h-20 text-white animate-spin" />
            </motion.div>
        );
    }

    const totalPlayers = players.length;

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="min-h-screen flex flex-col relative z-10"
        >
            {/* Header */}
            <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4 md:gap-6">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                        <span className="text-white/60 text-sm sm:text-base md:text-lg lg:text-xl">{getTranslation(language, 'questionNum').replace('{n}', currentQ + 1)}/{questions.length}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                        <div className="flex items-center gap-2 sm:gap-3 bg-white/10 rounded-full px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3">
                            <Users size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/60" />
                            <span className="text-white font-semibold text-sm sm:text-base md:text-lg lg:text-xl">{answeredCount}/{totalPlayers}</span>
                        </div>
                        <motion.div 
                            className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center font-black text-xl sm:text-2xl md:text-2xl lg:text-3xl ${timeLeft <= 5 ? 'bg-red-500 text-white' : 'bg-white/20 text-white'}`}
                            animate={timeLeft <= 5 ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                        >
                            {timeLeft}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
                <motion.div 
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-[2rem] px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 md:py-10 lg:py-12 mb-6 sm:mb-8 md:mb-10 max-w-5xl w-full text-center border border-white/20"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white break-words px-2">{currentQuestion.question}</h2>
                </motion.div>

                {/* Answers */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full max-w-5xl">
                    {currentQuestion.answers.map((answer, index) => (
                        <motion.div 
                            key={index}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden ${showAnswer && index !== currentQuestion.correctIndex ? 'opacity-40' : ''}`}
                        >
                            <div className={`bg-gradient-to-r ${answerColors[index]} p-4 sm:p-5 md:p-6 lg:p-8 flex items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 min-h-[80px] sm:min-h-[100px] md:min-h-[120px] ${showAnswer && index === currentQuestion.correctIndex ? 'ring-2 sm:ring-3 md:ring-4 ring-white' : ''}`}>
                                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/80 flex-shrink-0">{answerSymbols[index]}</span>
                                <span className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white flex-1 break-words text-center">{answer}</span>
                                {showAnswer && index === currentQuestion.correctIndex && (
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-14 lg:w-14 lg:h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0"
                                    >
                                        <Check className="text-green-600 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Next Button */}
                {showAnswer && (
                    <motion.button 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={nextQuestion}
                        className="mt-6 sm:mt-8 md:mt-10 bg-white rounded-2xl sm:rounded-3xl px-6 sm:px-10 md:px-14 py-4 sm:py-5 md:py-6 text-purple-900 font-bold text-base sm:text-lg md:text-xl lg:text-2xl flex items-center gap-3 sm:gap-4 w-full sm:w-auto max-w-sm sm:max-w-none justify-center"
                    >
                        {currentQ < questions.length - 1 ? (
                            <>
                                {getTranslation(language, 'nextQuestion')}
                                <ArrowRight size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                            </>
                        ) : (
                            <>
                                {getTranslation(language, 'seeResults')}
                                <Trophy size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                            </>
                        )}
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

// ==================== JOIN SCREEN ====================
const JoinScreen = ({ language, code, name, onCodeChange, onNameChange, onJoin, onBack }) => {
    const inputRefs = useRef([]);

    const handleCodeInput = (index, value) => {
        const val = value.toUpperCase();
        if (/^[A-Z0-9]?$/.test(val)) {
            const newCode = code.split('');
            newCode[index] = val;
            onCodeChange(newCode.join(''));
            if (val && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10 relative z-10"
        >
            <button onClick={onBack} className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 sm:gap-3 text-white/70 hover:text-white transition-colors text-sm sm:text-lg">
                <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">{getTranslation(language, 'back')}</span>
            </button>

            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg px-2"
            >
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-cyan-500/30">
                        <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">{getTranslation(language, 'joinGame')}</h1>
                    <p className="text-white/50 text-base sm:text-lg md:text-xl px-2">{getTranslation(language, 'enterCodeToJoin')}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 md:p-10 border border-white/10 space-y-6 sm:space-y-7 md:space-y-8">
                    {/* Game PIN */}
                    <div>
                        <label className="text-white/60 text-sm sm:text-base md:text-lg mb-3 sm:mb-4 block">{getTranslation(language, 'gamePin')}</label>
                        <div className="flex gap-2 sm:gap-2.5 md:gap-3 justify-center">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <input 
                                    key={i}
                                    ref={el => inputRefs.current[i] = el}
                                    type="text"
                                    maxLength={1}
                                    value={code[i] || ''}
                                    onChange={(e) => handleCodeInput(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className="w-12 h-14 sm:w-14 sm:h-16 md:w-16 md:h-20 bg-white/10 rounded-xl sm:rounded-2xl text-center text-2xl sm:text-2xl md:text-3xl font-bold text-white border-2 border-white/20 focus:border-cyan-500 focus:outline-none"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-white/60 text-sm sm:text-base md:text-lg mb-3 sm:mb-4 block">{getTranslation(language, 'yourName')}</label>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            placeholder={getTranslation(language, 'enterYourName')}
                            className="w-full bg-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 text-white text-base sm:text-lg md:text-xl placeholder-white/40 border-2 border-white/20 focus:border-cyan-500 focus:outline-none"
                        />
                    </div>

                    {/* Join Button */}
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onJoin}
                        disabled={code.length !== 6 || !name.trim()}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl sm:rounded-2xl py-4 sm:py-5 md:py-6 text-white font-bold text-lg sm:text-xl md:text-2xl shadow-xl shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 sm:gap-4"
                    >
                        <Zap size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                        {getTranslation(language, 'join')}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ==================== WAITING SCREEN (PLAYER) ====================
const WaitingScreen = ({ language, session, onGameStart }) => {
    const [gameData, setGameData] = useState(null);

    // Poll for game status
    useEffect(() => {
        const stopPolling = createPoller(session.code, session.playerId, (data) => {
            setGameData(data);
            if (data.status === 'playing') {
                onGameStart(data);
            }
        }, 1000);
        
        return stopPolling;
    }, [session.code, session.playerId, onGameStart]);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6"
        >
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-4 border-white/20 border-t-white rounded-full mb-6 sm:mb-8"
            />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 text-center px-4">{session.playerName}</h2>
            <p className="text-white/50 text-base sm:text-lg md:text-xl text-center px-4">{getTranslation(language, 'waitingForHost')}</p>
            <div className="mt-6 sm:mt-8 flex items-center gap-2 sm:gap-3 bg-white/10 rounded-full px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-white/60 text-sm sm:text-base">{getTranslation(language, 'connectedToGame') || 'Connected'}</span>
            </div>
            {gameData?.players && (
                <p className="mt-3 sm:mt-4 text-white/40 text-sm sm:text-base">{gameData.players.length} {getTranslation(language, 'players')}</p>
            )}
        </motion.div>
    );
};

// ==================== PLAYER SCREEN ====================
const PlayerScreen = ({ language, session, setSession, soundEnabled }) => {
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [gameStatus, setGameStatus] = useState('playing');
    const [timeLeft, setTimeLeft] = useState(20);
    const [maxTime, setMaxTime] = useState(20);
    const prevQuestion = useRef(-1);

    // Poll for game state
    useEffect(() => {
        const stopPolling = createPoller(session.code, session.playerId, (data) => {
            setGameStatus(data.status);
            
            // New question
            if (data.currentQuestion !== prevQuestion.current && data.currentQuestion >= 0) {
                prevQuestion.current = data.currentQuestion;
                setCurrentQ(data.currentQuestion);
                setSelectedAnswer(null);
                setAnswered(false);
                setShowResult(false);
                if (data.questions?.[data.currentQuestion]) {
                    setMaxTime(data.questions[data.currentQuestion].timeLimit || 20);
                    setTimeLeft(data.questions[data.currentQuestion].timeLimit || 20);
                }
            }
            
            // Show answer
            if (data.gameState?.showAnswer && !showResult) {
                setShowResult(true);
            }
        }, 800);
        
        return stopPolling;
    }, [session.code, session.playerId, showResult]);

    const handleAnswer = async (index) => {
        if (!answered && !showResult) {
            setSelectedAnswer(index);
            setAnswered(true);
            if (soundEnabled) playSound('tick');
            
            try {
                const result = await answersApi.submit(
                    session.code, 
                    session.playerId, 
                    currentQ, 
                    index, 
                    timeLeft, 
                    maxTime
                );
                
                setIsCorrect(result.isCorrect);
                setScore(result.totalScore);
                
                if (result.isCorrect) {
                    if (soundEnabled) playSound('correct');
                } else {
                    if (soundEnabled) playSound('wrong');
                }
            } catch (err) {
                console.error('Failed to submit answer:', err);
            }
        }
    };

    const answerColors = [
        'from-red-500 to-rose-600',
        'from-blue-500 to-indigo-600',
        'from-amber-500 to-orange-600',
        'from-emerald-500 to-green-600'
    ];

    const answerSymbols = ['▲', '◆', '●', '■'];

    if (showResult && answered) {
        return (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6"
            >
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center mb-6 sm:mb-8 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {isCorrect ? <Check size={40} className="sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-20 lg:h-20 text-white" /> : <X size={40} className="sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-20 lg:h-20 text-white" />}
                </motion.div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 text-center px-4">
                    {isCorrect ? (getTranslation(language, 'correct') || 'Correct!') : (getTranslation(language, 'wrong') || 'Wrong!')}
                </h2>
                <p className="text-white/50 text-base sm:text-lg md:text-xl text-center px-4">{getTranslation(language, 'waitingForNext') || 'Waiting for next question...'}</p>
                <div className="mt-6 sm:mt-8 bg-white/10 rounded-xl sm:rounded-2xl px-6 sm:px-8 py-3 sm:py-4">
                    <span className="text-white/60 text-sm sm:text-base">{getTranslation(language, 'yourScore') || 'Score'}:</span>
                    <span className="text-2xl sm:text-3xl font-bold text-white ml-3 sm:ml-4">{score}</span>
                </div>
            </motion.div>
        );
    }

    if (answered) {
        return (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6"
            >
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center mb-6 sm:mb-8 bg-gradient-to-r ${answerColors[selectedAnswer]}`}
                >
                    <span className="text-4xl sm:text-5xl md:text-6xl text-white">{answerSymbols[selectedAnswer]}</span>
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 text-center px-4">{getTranslation(language, 'answerSubmitted')}</h2>
                <p className="text-white/50 text-base sm:text-lg md:text-xl text-center px-4">{getTranslation(language, 'waitingForOthers')}</p>
            </motion.div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="min-h-screen flex flex-col p-2 sm:p-3 md:p-4"
        >
            <div className="text-center mb-4 sm:mb-5 md:mb-6 pt-2 sm:pt-3 md:pt-4">
                <span className="text-white/60 text-base sm:text-lg md:text-xl">{getTranslation(language, 'chooseAnswer')}</span>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                {[0, 1, 2, 3].map((index) => (
                    <motion.button 
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAnswer(index)}
                        className={`bg-gradient-to-br ${answerColors[index]} rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl active:scale-95 min-h-[120px] sm:min-h-[150px] md:min-h-[180px]`}
                    >
                        <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white">{answerSymbols[index]}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

// ==================== RESULTS SCREEN ====================
const ResultsScreen = ({ language, session, onPlayAgain, onHome }) => {
    const [leaderboard, setLeaderboard] = useState([]);

    // Load final scores from database
    useEffect(() => {
        const loadScores = async () => {
            try {
                const data = await playersApi.poll(session.code);
                if (data?.players) {
                    setLeaderboard(data.players.sort((a, b) => b.score - a.score));
                }
            } catch (err) {
                console.error('Failed to load scores:', err);
                // Fallback to session data
                const scores = session.results?.scores;
                if (Array.isArray(scores)) {
                    setLeaderboard(scores.sort((a, b) => b.score - a.score));
                } else if (scores) {
                    setLeaderboard(Object.entries(scores).map(([id, data]) => ({ id, ...data })).sort((a, b) => b.score - a.score));
                }
            }
        };
        loadScores();
    }, [session.code, session.results]);

    useEffect(() => {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.4 } });
    }, []);

    const podiumColors = [
        'from-yellow-400 to-amber-500',
        'from-gray-300 to-gray-400',
        'from-amber-600 to-amber-700'
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center py-6 sm:py-8 md:py-10 px-4 sm:px-6 relative z-10"
        >
            <motion.h1 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-8 sm:mb-10 md:mb-12 text-center px-4"
            >
                {getTranslation(language, 'finalResults')}
            </motion.h1>

            {leaderboard.length > 0 ? (
                <>
                    {/* Podium */}
                    <div className="flex items-end justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-8 sm:mb-10 md:mb-12 lg:mb-14 px-2">
                        {/* 2nd Place */}
                        {leaderboard[1] && (
                            <motion.div 
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-xl">
                                    <Medal className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                                </div>
                                <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-xl sm:rounded-t-2xl md:rounded-t-3xl w-24 h-20 sm:w-28 sm:h-24 md:w-36 md:h-28 flex flex-col items-center justify-center px-2">
                                    <span className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg truncate w-full">{leaderboard[1].name}</span>
                                    <span className="text-white/80 text-xs sm:text-sm">{leaderboard[1].score}</span>
                                </div>
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {leaderboard[0] && (
                            <motion.div 
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-center"
                            >
                                <motion.div 
                                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-2xl shadow-yellow-500/40"
                                >
                                    <Crown className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white" />
                                </motion.div>
                                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-t-xl sm:rounded-t-2xl md:rounded-t-3xl w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-36 lg:w-44 lg:h-40 flex flex-col items-center justify-center px-2">
                                    <span className="text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl truncate w-full">{leaderboard[0].name}</span>
                                    <span className="text-white/80 text-xs sm:text-sm md:text-base lg:text-lg">{leaderboard[0].score}</span>
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {leaderboard[2] && (
                            <motion.div 
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-xl">
                                    <Award className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                                </div>
                                <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-t-xl sm:rounded-t-2xl md:rounded-t-3xl w-24 h-16 sm:w-28 sm:h-20 md:w-36 md:h-24 flex flex-col items-center justify-center px-2">
                                    <span className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg truncate w-full">{leaderboard[2].name}</span>
                                    <span className="text-white/80 text-xs sm:text-sm">{leaderboard[2].score}</span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Full Leaderboard */}
                    {leaderboard.length > 3 && (
                        <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 mb-6 sm:mb-8 md:mb-10 mx-4">
                            {leaderboard.slice(3).map((player, index) => (
                                <motion.div 
                                    key={player.id}
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                    className="flex items-center gap-3 sm:gap-4 md:gap-5 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 border-b border-white/10 last:border-0"
                                >
                                    <span className="text-white/40 font-bold w-6 sm:w-8 md:w-10 text-sm sm:text-base md:text-lg lg:text-xl">{index + 4}</span>
                                    <span className="text-white font-semibold flex-1 text-sm sm:text-base md:text-lg truncate">{player.name}</span>
                                    <span className="text-white/60 text-sm sm:text-base md:text-lg">{player.score}</span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 sm:py-14 md:py-16 px-4">
                    <p className="text-white/50 text-base sm:text-lg md:text-xl">{getTranslation(language, 'noScores') || 'No scores recorded'}</p>
                </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 w-full sm:w-auto max-w-sm sm:max-w-none px-4">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onPlayAgain}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-white font-bold text-base sm:text-lg md:text-xl flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto"
                >
                    <Play size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" fill="white" />
                    {getTranslation(language, 'playAgain')}
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onHome}
                    className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-white font-bold text-base sm:text-lg md:text-xl border-2 border-white/20 w-full sm:w-auto"
                >
                    {getTranslation(language, 'backToHome')}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default AldeaTapqyr;
