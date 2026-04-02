import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Check, X, RefreshCw, Star, Trophy, Heart, Play, Award, Volume2, VolumeX,
    Shapes, Moon, Hash, CheckCircle, Briefcase, Palette, Calculator, LayoutGrid
} from 'lucide-react';

// Icon mapping for games
const gameIconMap = {
    Shapes, 'Heart': Heart, Moon, Hash, CheckCircle, Briefcase, Palette, Calculator, LayoutGrid
};

const getGameIcon = (iconName, size = 24, className = '') => {
    const IconComponent = gameIconMap[iconName];
    if (IconComponent) {
        return <IconComponent size={size} className={className} />;
    }
    return null;
};
import { kidsGames } from '../data/kidsGames';
import confetti from 'canvas-confetti';

// Sound utilities using Web Audio API
const createAudioContext = () => {
    return new (window.AudioContext || window.webkitAudioContext)();
};

const playSound = (type, audioContextRef) => {
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = createAudioContext();
        }
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        if (type === 'correct') {
            // Happy ascending sound
            oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.4);
        } else if (type === 'wrong') {
            // Descending buzzer sound
            oscillator.frequency.setValueAtTime(200, ctx.currentTime);
            oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
        } else if (type === 'levelup') {
            // Fanfare sound
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
                gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.3);
                osc.start(ctx.currentTime + i * 0.12);
                osc.stop(ctx.currentTime + i * 0.12 + 0.3);
            });
        } else if (type === 'click') {
            // Soft click
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.05);
        } else if (type === 'gameover') {
            // Sad descending sound
            oscillator.frequency.setValueAtTime(400, ctx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.5);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.6);
        }
    } catch (e) {
        console.log('Audio not supported');
    }
};

const AldeaKidsGame = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showResult, setShowResult] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const audioContextRef = useRef(null);

    const gameData = kidsGames.find(g => g.id === gameId);

    const playSoundEffect = useCallback((type) => {
        if (soundEnabled) {
            playSound(type, audioContextRef);
        }
    }, [soundEnabled]);

    const triggerConfetti = () => {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#3b82f6', '#10b981', '#f59e0b']
        });
    };

    const triggerCelebration = () => {
        const duration = 2000;
        const end = Date.now() + duration;
        const frame = () => {
            confetti({
                particleCount: 4,
                angle: 60,
                spread: 45,
                origin: { x: 0 },
                colors: ['#3b82f6', '#10b981']
            });
            confetti({
                particleCount: 4,
                angle: 120,
                spread: 45,
                origin: { x: 1 },
                colors: ['#f59e0b', '#8b5cf6']
            });
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
    };

    const handleScore = () => {
        setScore(s => s + 10 * level);
        setShowResult('correct');
        playSoundEffect('correct');
        triggerConfetti();
        setTimeout(() => setShowResult(null), 600);
    };

    const handleWrong = () => {
        setLives(l => l - 1);
        setShowResult('wrong');
        playSoundEffect('wrong');
        setTimeout(() => setShowResult(null), 600);
        if (lives <= 1) {
            setGameOver(true);
            playSoundEffect('gameover');
        }
    };

    const handleLevelUp = () => {
        setLevel(l => l + 1);
        playSoundEffect('levelup');
    };

    const handleGameComplete = () => {
        setGameOver(true);
        playSoundEffect('levelup');
        triggerCelebration();
    };

    const restartGame = () => {
        setScore(0);
        setLives(3);
        setLevel(1);
        setGameOver(false);
        setIsPlaying(true);
        playSoundEffect('click');
    };

    if (!gameData) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h2 className="text-3xl font-bold mb-6">{getTranslation(language, 'gameNotFound')}</h2>
                    <button
                        onClick={() => navigate('/games/aldea-kids')}
                        className="bg-blue-600 px-8 py-4 rounded-xl text-lg hover:bg-blue-700 transition-all"
                    >
                        {getTranslation(language, 'backToGames')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 relative overflow-hidden">
            {/* Subtle Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Result Overlay */}
            <AnimatePresence>
                {showResult && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${
                            showResult === 'correct' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                        }`}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={`w-32 h-32 rounded-full flex items-center justify-center ${
                                showResult === 'correct' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                        >
                            {showResult === 'correct' ? (
                                <Check className="w-16 h-16 text-white" strokeWidth={3} />
                            ) : (
                                <X className="w-16 h-16 text-white" strokeWidth={3} />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/games/aldea-kids')}
                            className="bg-white text-slate-600 p-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm border border-slate-200"
                        >
                            <ArrowLeft size={26} />
                        </button>
                        <button
                            onClick={() => {
                                setSoundEnabled(!soundEnabled);
                                if (!soundEnabled) playSoundEffect('click');
                            }}
                            className={`p-3 rounded-xl transition-all shadow-sm border ${
                                soundEnabled 
                                    ? 'bg-white text-blue-600 border-slate-200 hover:bg-slate-50' 
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                        >
                            {soundEnabled ? <Volume2 size={26} /> : <VolumeX size={26} />}
                        </button>
                    </div>

                    <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2">
                            <Star className="w-7 h-7 text-amber-500" fill="currentColor" />
                            <span className="text-2xl font-bold text-slate-800">{score}</span>
                        </div>
                        
                        <div className="w-px h-7 bg-slate-200" />
                        
                        <div className="flex items-center gap-2">
                            <span className="text-base font-medium text-slate-500">{getTranslation(language, 'levelLabel')}</span>
                            <span className="text-2xl font-bold text-blue-600">{level}</span>
                        </div>

                        <div className="w-px h-7 bg-slate-200" />
                        
                        <div className="flex items-center gap-1">
                            {[...Array(3)].map((_, i) => (
                                <Heart
                                    key={i}
                                    size={24}
                                    className={i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-200 fill-slate-200'}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Game Area */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 min-h-[600px] flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        {gameOver ? (
                            <motion.div
                                key="gameover"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center w-full max-w-md"
                            >
                                <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 ${
                                    lives > 0 ? 'bg-amber-100' : 'bg-slate-100'
                                }`}>
                                    {lives > 0 ? (
                                        <Trophy className="w-14 h-14 text-amber-600" />
                                    ) : (
                                        <Award className="w-14 h-14 text-slate-400" />
                                    )}
                                </div>
                                
                                <h1 className="text-3xl font-bold text-slate-800 mb-3">
                                    {lives > 0 
                                        ? getTranslation(language, 'congratulations') 
                                        : getTranslation(language, 'gameOver')}
                                </h1>
                                
                                <p className="text-lg text-slate-500 mb-2">{getTranslation(language, 'finalScore')}</p>
                                
                                <div className="flex items-center gap-3 mb-10">
                                    <Star className="w-10 h-10 text-amber-500" fill="currentColor" />
                                    <span className="text-6xl font-bold text-slate-800">{score}</span>
                                </div>
                                
                                <div className="flex gap-4 w-full">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={restartGame}
                                        className="flex-1 bg-blue-600 text-white font-semibold py-4 rounded-xl text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                                    >
                                        <RefreshCw size={22} />
                                        {getTranslation(language, 'playAgain')}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/games/aldea-kids')}
                                        className="flex-1 bg-slate-100 text-slate-700 font-semibold py-4 rounded-xl text-lg hover:bg-slate-200 transition-all"
                                    >
                                        {getTranslation(language, 'moreGames')}
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : !isPlaying ? (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className={`w-32 h-32 bg-gradient-to-br ${gameData.gradient} rounded-3xl flex items-center justify-center mb-8 shadow-lg`}>
                                    {getGameIcon(gameData.iconName, 56, 'text-white')}
                                </div>
                                
                                <h1 className="text-3xl font-bold text-slate-800 mb-3">
                                    {getTranslation(language, gameData.titleKey) || gameData.id}
                                </h1>
                                
                                <p className="text-lg text-slate-500 mb-10 max-w-lg">
                                    {getTranslation(language, gameData.descKey)}
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setIsPlaying(true);
                                        playSoundEffect('click');
                                    }}
                                    className="bg-blue-600 text-white font-semibold px-12 py-4 rounded-xl text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-3"
                                >
                                    <Play size={24} fill="currentColor" />
                                    {getTranslation(language, 'startGame')}
                                </motion.button>
                            </motion.div>
                        ) : (
                            <GameEngine
                                gameData={gameData}
                                level={level}
                                language={language}
                                onScore={handleScore}
                                onWrong={handleWrong}
                                onLevelUp={handleLevelUp}
                                onComplete={handleGameComplete}
                                playSound={playSoundEffect}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const GameEngine = ({ gameData, level, language, onScore, onWrong, onLevelUp, onComplete, playSound }) => {
    switch (gameData.gameType) {
        case 'matching':
            return <MatchingGame gameData={gameData} level={level} language={language} onScore={onScore} onWrong={onWrong} onLevelUp={onLevelUp} onComplete={onComplete} playSound={playSound} />;
        case 'sequence':
            return <SequenceGame gameData={gameData} level={level} language={language} onScore={onScore} onWrong={onWrong} onLevelUp={onLevelUp} onComplete={onComplete} playSound={playSound} />;
        case 'choice':
            return <ChoiceGame gameData={gameData} level={level} language={language} onScore={onScore} onWrong={onWrong} onLevelUp={onLevelUp} onComplete={onComplete} playSound={playSound} />;
        case 'counting':
            return <CountingGame gameData={gameData} level={level} language={language} onScore={onScore} onWrong={onWrong} onLevelUp={onLevelUp} onComplete={onComplete} playSound={playSound} />;
        case 'memory':
            return <MemoryGame gameData={gameData} level={level} language={language} onScore={onScore} onWrong={onWrong} onLevelUp={onLevelUp} onComplete={onComplete} playSound={playSound} />;
        default:
            return <MatchingGame gameData={gameData} level={level} language={language} onScore={onScore} onWrong={onWrong} onLevelUp={onLevelUp} onComplete={onComplete} playSound={playSound} />;
    }
};

// ==================== MATCHING GAME ====================
const MatchingGame = ({ gameData, level, language, onScore, onWrong, onLevelUp, playSound }) => {
    const [target, setTarget] = useState(null);
    const [options, setOptions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [round, setRound] = useState(0);
    const [animating, setAnimating] = useState(false);
    const maxRounds = 10;

    const data = gameData.data;

    const generateLevel = useCallback(() => {
        if (data.type === 'DirectMatch') {
            const items = data.items;
            const targetItem = items[Math.floor(Math.random() * items.length)];
            
            let opts = [targetItem];
            while (opts.length < Math.min(3 + Math.floor(level / 2), 6)) {
                const randomItem = items[Math.floor(Math.random() * items.length)];
                if (!opts.includes(randomItem)) {
                    opts.push(randomItem);
                }
            }
            
            setTarget(targetItem);
            setCorrectAnswer(targetItem);
            setOptions(opts.sort(() => Math.random() - 0.5));
        } else if (data.type === 'Pairs') {
            const pairs = data.pairs;
            const pair = pairs[Math.floor(Math.random() * pairs.length)];
            
            let opts = [pair.a];
            const otherPairs = pairs.filter(p => p.a !== pair.a);
            while (opts.length < Math.min(3 + Math.floor(level / 2), pairs.length) && otherPairs.length > 0) {
                const idx = Math.floor(Math.random() * otherPairs.length);
                const randomPair = otherPairs[idx];
                if (!opts.includes(randomPair.a)) {
                    opts.push(randomPair.a);
                }
            }
            
            setTarget(pair.q);
            setCorrectAnswer(pair.a);
            setOptions(opts.sort(() => Math.random() - 0.5));
        }
        setAnimating(false);
    }, [data, level]);

    useEffect(() => {
        generateLevel();
    }, [generateLevel]);

    const handleOptionClick = (option) => {
        if (animating) return;
        setAnimating(true);
        playSound('click');

        if (option === correctAnswer) {
            onScore();
            const newRound = round + 1;
            setRound(newRound);
            
            if (newRound >= maxRounds) {
                onLevelUp();
                setRound(0);
            }
            
            setTimeout(() => generateLevel(), 500);
        } else {
            onWrong();
            setTimeout(() => setAnimating(false), 500);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-3xl"
        >
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-base text-slate-500 mb-3">
                    <span>{getTranslation(language, 'round')} {round + 1} / {maxRounds}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-blue-500 rounded-full"
                        animate={{ width: `${(round / maxRounds) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <h2 className="text-xl font-medium text-slate-600 mb-8 text-center">
                {data.type === 'DirectMatch' 
                    ? getTranslation(language, 'findThisShape')
                    : getTranslation(language, 'findTheMatch')}
            </h2>

            <div className="flex justify-center mb-12">
                <motion.div
                    key={target}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl md:text-9xl bg-slate-50 p-8 md:p-10 rounded-3xl border-2 border-slate-200"
                >
                    {target}
                </motion.div>
            </div>

            <div className={`grid gap-4 ${options.length <= 3 ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4'} max-w-2xl mx-auto`}>
                {options.map((option, index) => (
                    <motion.button
                        key={`${option}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOptionClick(option)}
                        disabled={animating}
                        className="text-5xl md:text-6xl bg-white border-2 border-slate-200 p-5 md:p-6 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50"
                    >
                        {option}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

// ==================== SEQUENCE GAME ====================
const SequenceGame = ({ gameData, level, language, onScore, onWrong, onLevelUp, playSound }) => {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [round, setRound] = useState(0);
    const maxRounds = 5;

    const levels = gameData.data.levels;

    const getCurrentSequence = () => {
        return levels[currentLevel % levels.length];
    };

    const handleOptionClick = (option) => {
        if (animating) return;
        setAnimating(true);
        playSound('click');

        const current = getCurrentSequence();
        if (option === current.answer) {
            onScore();
            const newRound = round + 1;
            setRound(newRound);
            
            if (newRound >= maxRounds) {
                onLevelUp();
                setRound(0);
            }
            
            setTimeout(() => {
                setCurrentLevel(l => l + 1);
                setAnimating(false);
            }, 500);
        } else {
            onWrong();
            setTimeout(() => setAnimating(false), 500);
        }
    };

    const current = getCurrentSequence();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-3xl"
        >
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-base text-slate-500 mb-3">
                    <span>{getTranslation(language, 'round')} {round + 1} / {maxRounds}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-orange-500 rounded-full"
                        animate={{ width: `${(round / maxRounds) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <h2 className="text-xl font-medium text-slate-600 mb-8 text-center">
                {getTranslation(language, 'whatComesNext')}
            </h2>

            {/* Sequence Display */}
            <div className="flex justify-center items-center gap-3 md:gap-4 mb-12 flex-wrap">
                {current.sequence.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`text-4xl md:text-5xl font-bold w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-2xl ${
                            item === '?' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                    >
                        {item}
                    </motion.div>
                ))}
            </div>

            {/* Options */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {current.options.map((option, index) => (
                    <motion.button
                        key={option}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOptionClick(option)}
                        disabled={animating}
                        className="text-3xl md:text-4xl font-bold bg-white border-2 border-slate-200 py-5 md:py-6 rounded-2xl hover:border-orange-400 hover:bg-orange-50 transition-all disabled:opacity-50"
                    >
                        {option}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

// ==================== CHOICE GAME (TRUE/FALSE) ====================
const ChoiceGame = ({ gameData, level, language, onScore, onWrong, onLevelUp, playSound }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [round, setRound] = useState(0);
    const maxRounds = 5;

    const questions = gameData.data.questions;

    const handleChoice = (isCorrectChoice) => {
        if (animating) return;
        setAnimating(true);
        playSound('click');

        const question = questions[currentQuestion % questions.length];
        const isAnswerCorrect = isCorrectChoice === question.isCorrect;

        if (isAnswerCorrect) {
            onScore();
            const newRound = round + 1;
            setRound(newRound);
            
            if (newRound >= maxRounds) {
                onLevelUp();
                setRound(0);
            }
            
            setTimeout(() => {
                setCurrentQuestion(q => q + 1);
                setAnimating(false);
            }, 500);
        } else {
            onWrong();
            setTimeout(() => setAnimating(false), 500);
        }
    };

    const question = questions[currentQuestion % questions.length];
    const questionText = question.textKey 
        ? getTranslation(language, question.textKey) 
        : question.text;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl"
        >
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-base text-slate-500 mb-3">
                    <span>{getTranslation(language, 'round')} {round + 1} / {maxRounds}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-violet-500 rounded-full"
                        animate={{ width: `${(round / maxRounds) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <h2 className="text-xl font-medium text-slate-600 mb-8 text-center">
                {getTranslation(language, 'isThisCorrect')}
            </h2>

            {/* Question Display */}
            <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-50 p-8 md:p-10 rounded-2xl border border-slate-200 mb-10"
            >
                <p className="text-3xl md:text-4xl font-medium text-slate-800 text-center">
                    {questionText}
                </p>
            </motion.div>

            {/* True/False Buttons */}
            <div className="grid grid-cols-2 gap-5">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChoice(true)}
                    disabled={animating}
                    className="flex flex-col items-center gap-3 bg-emerald-600 text-white py-6 md:py-8 rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                    <Check size={40} strokeWidth={2.5} />
                    <span className="text-xl font-semibold">{getTranslation(language, 'trueAnswer')}</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChoice(false)}
                    disabled={animating}
                    className="flex flex-col items-center gap-3 bg-rose-600 text-white py-6 md:py-8 rounded-2xl hover:bg-rose-700 transition-all disabled:opacity-50"
                >
                    <X size={40} strokeWidth={2.5} />
                    <span className="text-xl font-semibold">{getTranslation(language, 'falseAnswer')}</span>
                </motion.button>
            </div>
        </motion.div>
    );
};

// ==================== COUNTING GAME ====================
const CountingGame = ({ gameData, level, language, onScore, onWrong, onLevelUp, playSound }) => {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [round, setRound] = useState(0);
    const maxRounds = 5;

    const levels = gameData.data.levels;

    const getCurrentLevel = () => {
        return levels[currentLevel % levels.length];
    };

    const handleOptionClick = (option) => {
        if (animating) return;
        setAnimating(true);
        playSound('click');

        const current = getCurrentLevel();
        if (option === current.answer) {
            onScore();
            const newRound = round + 1;
            setRound(newRound);
            
            if (newRound >= maxRounds) {
                onLevelUp();
                setRound(0);
            }
            
            setTimeout(() => {
                setCurrentLevel(l => l + 1);
                setAnimating(false);
            }, 500);
        } else {
            onWrong();
            setTimeout(() => setAnimating(false), 500);
        }
    };

    const current = getCurrentLevel();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-3xl"
        >
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-base text-slate-500 mb-3">
                    <span>{getTranslation(language, 'round')} {round + 1} / {maxRounds}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-lime-500 rounded-full"
                        animate={{ width: `${(round / maxRounds) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <h2 className="text-xl font-medium text-slate-600 mb-8 text-center">
                {getTranslation(language, 'howManyObjects')}
            </h2>

            {/* Objects Display */}
            <motion.div
                key={currentLevel}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-50 p-8 md:p-10 rounded-2xl border border-slate-200 mb-10 flex justify-center items-center min-h-[120px]"
            >
                <p className="text-5xl md:text-6xl tracking-widest">
                    {current.items}
                </p>
            </motion.div>

            {/* Options */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {current.options.map((option, index) => (
                    <motion.button
                        key={option}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOptionClick(option)}
                        disabled={animating}
                        className="text-3xl md:text-4xl font-bold bg-white border-2 border-slate-200 py-5 md:py-6 rounded-2xl hover:border-lime-400 hover:bg-lime-50 transition-all disabled:opacity-50"
                    >
                        {option}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

// ==================== MEMORY GAME ====================
const MemoryGame = ({ gameData, level, language, onScore, onWrong, onLevelUp, playSound }) => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [round, setRound] = useState(0);
    const maxRounds = 3;

    const initGame = useCallback(() => {
        const baseCards = gameData.data.cards.slice(0, 4 + level);
        const doubled = [...baseCards, ...baseCards];
        const shuffled = doubled.sort(() => Math.random() - 0.5).map((card, index) => ({
            id: index,
            value: card
        }));
        setCards(shuffled);
        setFlipped([]);
        setMatched([]);
        setMoves(0);
    }, [gameData.data.cards, level]);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const handleCardClick = (cardId) => {
        if (flipped.length === 2) return;
        if (flipped.includes(cardId)) return;
        if (matched.includes(cardId)) return;

        playSound('click');
        const newFlipped = [...flipped, cardId];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [first, second] = newFlipped;
            const firstCard = cards.find(c => c.id === first);
            const secondCard = cards.find(c => c.id === second);

            if (firstCard.value === secondCard.value) {
                onScore();
                const newMatched = [...matched, first, second];
                setMatched(newMatched);
                setFlipped([]);

                // Check if all matched
                if (newMatched.length === cards.length) {
                    const newRound = round + 1;
                    setRound(newRound);
                    
                    if (newRound >= maxRounds) {
                        onLevelUp();
                        setRound(0);
                    }
                    
                    setTimeout(() => initGame(), 1000);
                }
            } else {
                onWrong();
                setTimeout(() => setFlipped([]), 800);
            }
        }
    };

    const isFlipped = (cardId) => flipped.includes(cardId) || matched.includes(cardId);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-3xl"
        >
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-base text-slate-500 mb-3">
                    <span>{getTranslation(language, 'round')} {round + 1} / {maxRounds}</span>
                    <span>{getTranslation(language, 'moves')}: {moves}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-indigo-500 rounded-full"
                        animate={{ width: `${(matched.length / cards.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <h2 className="text-xl font-medium text-slate-600 mb-8 text-center">
                {getTranslation(language, 'findPairs')}
            </h2>

            {/* Cards Grid */}
            <div className={`grid gap-3 ${cards.length <= 8 ? 'grid-cols-4' : 'grid-cols-4 md:grid-cols-5'} max-w-lg mx-auto`}>
                {cards.map((card) => (
                    <motion.button
                        key={card.id}
                        whileHover={{ scale: isFlipped(card.id) ? 1 : 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCardClick(card.id)}
                        disabled={isFlipped(card.id)}
                        className={`aspect-square text-4xl md:text-5xl rounded-xl transition-all duration-300 ${
                            isFlipped(card.id)
                                ? matched.includes(card.id)
                                    ? 'bg-emerald-100 border-2 border-emerald-300'
                                    : 'bg-white border-2 border-blue-300'
                                : 'bg-indigo-600 hover:bg-indigo-700 border-2 border-indigo-600'
                        }`}
                    >
                        <motion.span
                            initial={false}
                            animate={{ 
                                rotateY: isFlipped(card.id) ? 0 : 180,
                                opacity: isFlipped(card.id) ? 1 : 0
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            {isFlipped(card.id) ? card.value : ''}
                        </motion.span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

export default AldeaKidsGame;
