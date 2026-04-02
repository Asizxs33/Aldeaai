import React, { useState, useEffect, useRef } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { LanguageProvider, useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../translations/translations";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe, ArrowRight, MapPin, Trophy, Timer, XCircle, Sparkles, ChevronRight, Zap
} from "lucide-react";
import { countries } from "../data/countries";
import confetti from 'canvas-confetti';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const DIFFICULTIES = {
    EASY: { id: 'easy', time: 60, points: 10, penalty: 2, color: 'from-green-400 to-emerald-500' },
    MEDIUM: { id: 'medium', time: 30, points: 15, penalty: 3, color: 'from-yellow-400 to-orange-500' },
    HARD: { id: 'hard', time: 15, points: 20, penalty: 5, color: 'from-red-500 to-pink-600' }
};

const REGIONS = [
    { id: 'Asia', nameKey: 'regionAsia', emoji: '🌏', color: 'from-orange-400 to-red-500' },
    { id: 'Europe', nameKey: 'regionEurope', emoji: '🇪🇺', color: 'from-blue-400 to-indigo-500' },
    { id: 'Africa', nameKey: 'regionAfrica', emoji: '🌍', color: 'from-yellow-500 to-orange-600' },
    { id: 'North America', nameKey: 'regionAmericas', emoji: '🌎', color: 'from-green-400 to-teal-500' },
    { id: 'South America', nameKey: 'regionAmericas', emoji: '🌎', color: 'from-lime-400 to-green-500' },
    { id: 'Oceania', nameKey: 'regionOceania', emoji: '🏝️', color: 'from-cyan-400 to-blue-500' },
];

const AldeaWorldGame = () => {
    const { language, setLanguage } = useLanguage();

    const [gameState, setGameState] = useState('welcome');
    const [difficulty, setDifficulty] = useState(null);
    const [currentRegion, setCurrentRegion] = useState(null);
    const [targetCountry, setTargetCountry] = useState(null);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(60);
    const [userInput, setUserInput] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [playedCountries, setPlayedCountries] = useState([]);
    const [cluesRevealed, setCluesRevealed] = useState({ capital: false, letter: false, flag: false, landmark: false });

    const timerRef = useRef(null);
    const inputRef = useRef(null);

    const toggleLanguage = () => {
        const langs = ['en', 'ru', 'kk'];
        const currentIndex = langs.indexOf(language);
        const nextLang = langs[(currentIndex + 1) % langs.length];
        setLanguage(nextLang);
    };

    const startGame = () => {
        if (!currentRegion || !difficulty) return;
        setGameState('playing');
        setScore(0);
        setPlayedCountries([]);
        nextTurn();
    };

    const nextTurn = () => {
        const regionCountries = countries.filter(c => c.region === currentRegion.id);
        const availableCountries = regionCountries.filter(c => !playedCountries.includes(c.id));

        if (availableCountries.length === 0) {
            setGameState('gameover');
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        const randomCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)];
        setTargetCountry(randomCountry);
        setPlayedCountries(prev => [...prev, randomCountry.id]);

        setUserInput("");
        setFeedback(null);
        setCluesRevealed({ capital: false, letter: false, flag: false, landmark: false });
        setTimer(difficulty.time);
    };

    useEffect(() => {
        if (gameState === 'playing' && timer > 0) {
            timerRef.current = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setFeedback({ type: 'error', message: getTranslation(language, 'incorrect') || 'Time Up!' });
                        setTimeout(nextTurn, 1500);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameState, timer, targetCountry]);

    const handleInputSubmit = (e) => {
        e.preventDefault();
        if (!targetCountry || !userInput.trim()) return;

        const correctNames = Object.values(targetCountry.name).map(n => n.toLowerCase());
        const userAttempt = userInput.trim().toLowerCase();

        if (correctNames.some(name => userAttempt === name || (userAttempt.length > 3 && name.includes(userAttempt)))) {
            const pointsEarned = difficulty.points - (cluesRevealed.capital ? 3 : 0) - (cluesRevealed.letter ? 2 : 0);
            setScore(prev => prev + Math.max(1, pointsEarned));
            setFeedback({ type: 'success', message: getTranslation(language, 'correct') || 'Correct!' });
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            setTimeout(nextTurn, 1500);
        } else {
            setScore(prev => Math.max(0, prev - difficulty.penalty));
            setFeedback({ type: 'error', message: getTranslation(language, 'incorrect') || 'Incorrect' });
            setUserInput('');
            inputRef.current?.focus();
        }
    };

    const getMapScale = () => {
        switch (currentRegion?.id) {
            case 'Europe': return 600;
            case 'Asia': return 300;
            case 'Africa': return 350;
            case 'North America': return 300;
            case 'South America': return 350;
            case 'Oceania': return 400;
            default: return 120;
        }
    };

    const getMapCenter = () => {
        switch (currentRegion?.id) {
            case 'Europe': return [10, 50];
            case 'Asia': return [90, 40];
            case 'Africa': return [20, 0];
            case 'North America': return [-100, 40];
            case 'South America': return [-60, -20];
            case 'Oceania': return [140, -30];
            default: return [0, 20];
        }
    };

    // Welcome Screen
    if (gameState === 'welcome') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-6 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob" />
                    <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
                </div>

                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                    <button
                        onClick={() => window.location.href = '/games'}
                        className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-5 py-3 rounded-xl hover:bg-white/30 transition-all shadow-lg border border-white/30"
                    >
                        <XCircle size={20} />
                        <span className="font-medium">{getTranslation(language, 'backToDashboard') || 'Back'}</span>
                    </button>

                    <button
                        onClick={toggleLanguage}
                        className="bg-white/20 backdrop-blur-md text-white px-5 py-3 rounded-xl hover:bg-white/30 transition-all shadow-lg border border-white/30 font-bold uppercase"
                    >
                        {language}
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-center max-w-2xl px-4"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="mb-6 md:mb-8"
                    >
                        <Globe className="w-20 h-20 md:w-32 md:h-32 mx-auto text-white drop-shadow-2xl" />
                    </motion.div>

                    <h1 className="text-5xl md:text-8xl font-black text-white mb-4 md:mb-6 drop-shadow-lg leading-tight">
                        {getTranslation(language, 'gameTitle') || 'WorldQuiz'}
                    </h1>
                    <p className="text-lg md:text-2xl text-white/90 mb-8 md:mb-12 font-medium">
                        {getTranslation(language, 'gameSubtitle') || 'Test your geography knowledge'}
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setGameState('difficulty')}
                        className="bg-white text-purple-600 px-8 py-3 md:px-12 md:py-5 rounded-2xl font-bold text-lg md:text-2xl shadow-2xl hover:shadow-white/50 transition-all flex items-center gap-2 md:gap-3 mx-auto group"
                    >
                        <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
                        {getTranslation(language, 'submit') || 'Start Game'}
                        <ChevronRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    // Difficulty Selection
    if (gameState === 'difficulty') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
                <div className="max-w-4xl w-full">
                    <button
                        onClick={() => setGameState('welcome')}
                        className="mb-8 text-white/60 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        <XCircle size={20} />
                        {getTranslation(language, 'backToDashboard') || 'Back'}
                    </button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8 md:mb-12"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4">{getTranslation(language, 'selectDifficulty') || 'Choose Your Challenge'}</h2>
                        <p className="text-lg md:text-xl text-white/70">{getTranslation(language, 'gameSubtitle') || 'How fast can you identify countries?'}</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-4 md:gap-6 pb-6">
                        {Object.values(DIFFICULTIES).map((diff, index) => (
                            <motion.button
                                key={diff.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -10 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setDifficulty(diff);
                                    setGameState('region');
                                }}
                                className={`relative p-6 md:p-8 rounded-3xl bg-gradient-to-br ${diff.color} text-white shadow-2xl overflow-hidden group`}
                            >
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                                <div className="relative z-10">
                                    <div className="text-4xl md:text-6xl font-black mb-3 md:mb-4 capitalize">{getTranslation(language, `difficulty${diff.id.charAt(0).toUpperCase() + diff.id.slice(1)}`) || diff.id}</div>
                                    <div className="text-2xl md:text-3xl font-bold mb-2">{diff.time}s</div>
                                    <div className="text-sm opacity-90">{getTranslation(language, `difficulty${diff.id.charAt(0).toUpperCase() + diff.id.slice(1)}Desc`) || 'per country'}</div>
                                    <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/20">
                                        <div className="text-sm">+{diff.points} {getTranslation(language, 'score') || 'points'}</div>
                                        <div className="text-xs opacity-75">-{diff.penalty} penalty</div>
                                    </div>
                                </div>
                                <Zap className="absolute bottom-4 right-4 w-8 h-8 md:w-12 md:h-12 opacity-20 group-hover:opacity-40 transition-opacity" />
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Region Selection
    if (gameState === 'region') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 flex items-center justify-center">
                <div className="max-w-5xl w-full">
                    <button
                        onClick={() => setGameState('difficulty')}
                        className="mb-8 text-white/60 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        <XCircle size={20} />
                        {getTranslation(language, 'backToDashboard') || 'Back'}
                    </button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8 md:mb-12"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4">{getTranslation(language, 'selectRegion') || 'Pick Your Region'}</h2>
                        <p className="text-lg md:text-xl text-white/70">{getTranslation(language, 'gameSubtitle') || 'Where in the world do you want to explore?'}</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-4 md:gap-6 pb-6">
                        {REGIONS.map((region, index) => (
                            <motion.button
                                key={region.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, rotate: 2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setCurrentRegion(region);
                                    startGame();
                                }}
                                className={`relative p-6 md:p-10 rounded-3xl bg-gradient-to-br ${region.color} text-white shadow-2xl overflow-hidden group`}
                            >
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                <div className="relative z-10">
                                    <div className="text-5xl md:text-7xl mb-2 md:mb-4">{region.emoji}</div>
                                    <div className="text-xl md:text-2xl font-bold">{getTranslation(language, region.nameKey) || region.id}</div>
                                    <div className="text-sm opacity-75 mt-1 md:mt-2">
                                        {countries.filter(c => c.region === region.id).length} {getTranslation(language, 'countries') || 'countries'}
                                    </div>
                                </div>
                                <ChevronRight className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-6 h-6 md:w-8 md:h-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Game Over Screen
    if (gameState === 'gameover') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 md:space-y-8 bg-white/10 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl max-w-md border border-white/20 w-full"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                    >
                        <Trophy className="w-24 h-24 md:w-32 md:h-32 mx-auto text-yellow-400 drop-shadow-2xl" />
                    </motion.div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white">{getTranslation(language, 'gameOver') || 'Game Over!'}</h1>
                    <div className="space-y-2">
                        <p className="text-white/70 text-base md:text-lg">{getTranslation(language, 'finalScore') || 'Your Score'}</p>
                        <p className="text-5xl md:text-7xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">{score}</p>
                    </div>
                    <button
                        onClick={() => {
                            setGameState('welcome');
                            setDifficulty(null);
                            setCurrentRegion(null);
                        }}
                        className="px-8 py-3 md:px-10 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all shadow-lg w-full"
                    >
                        {getTranslation(language, 'playAgain') || 'Play Again'}
                    </button>
                </motion.div>
            </div>
        );
    }

    // Playing Screen
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-2 md:p-4">
            <div className="max-w-7xl mx-auto h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)] flex flex-col lg:flex-row gap-3 md:gap-4">
                <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-3xl p-3 md:p-6 relative overflow-hidden shadow-2xl border border-white/20 min-h-[40vh] md:min-h-auto order-1 lg:order-none">
                    <button
                        onClick={() => {
                            setGameState('welcome');
                            setDifficulty(null);
                            setCurrentRegion(null);
                        }}
                        className="absolute top-3 left-3 md:top-6 md:left-6 z-10 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-xl hover:bg-black/50 transition-all text-white text-sm md:text-base"
                    >
                        <XCircle size={16} className="md:w-5 md:h-5" />
                        <span className="font-medium">{getTranslation(language, 'stop') || 'Quit'}</span>
                    </button>

                    <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-800 shadow-inner">
                        <ComposableMap
                            projection="geoMercator"
                            projectionConfig={{ scale: getMapScale(), center: getMapCenter() }}
                            style={{ width: "100%", height: "100%" }}
                        >
                            <ZoomableGroup center={getMapCenter()} zoom={1}>
                                <Geographies geography={geoUrl}>
                                    {({ geographies }) =>
                                        geographies.map((geo) => {
                                            const geoName = geo.properties?.name || geo.properties?.NAME || '';
                                            const isTarget = targetCountry && (
                                                geoName.toLowerCase().includes(targetCountry.name.en.toLowerCase()) ||
                                                targetCountry.name.en.toLowerCase().includes(geoName.toLowerCase()) ||
                                                geo.properties?.ISO_A3 === targetCountry.id ||
                                                geo.id === targetCountry.id
                                            );

                                            return (
                                                <Geography
                                                    key={geo.rsmKey}
                                                    geography={geo}
                                                    fill={isTarget ? "#3B82F6" : "#1E293B"}
                                                    stroke="#475569"
                                                    strokeWidth={0.5}
                                                    style={{
                                                        default: { outline: "none", transition: "fill 0.3s ease" },
                                                        hover: { fill: isTarget ? "#2563EB" : "#334155", outline: "none" },
                                                        pressed: { outline: "none" },
                                                    }}
                                                />
                                            );
                                        })
                                    }
                                </Geographies>
                            </ZoomableGroup>
                        </ComposableMap>
                    </div>
                </div>

                <div className="w-full lg:w-[400px] bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col gap-3 md:gap-6 shadow-2xl border border-white/20 order-2 lg:order-none">
                    <div className="flex gap-2 md:gap-3">
                        <div className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-3 py-3 md:px-4 md:py-4 rounded-xl md:rounded-2xl shadow-lg ${timer <= 10 ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' : 'bg-white/20 backdrop-blur-md'
                            }`}>
                            <Timer size={20} className="text-white md:w-6 md:h-6" />
                            <span className="text-2xl md:text-3xl font-black text-white">{timer}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-3 md:px-4 md:py-4 rounded-xl md:rounded-2xl shadow-lg">
                            <Trophy size={20} className="text-white md:w-6 md:h-6" />
                            <span className="text-2xl md:text-3xl font-black text-white">{score}</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 md:p-6 rounded-xl md:rounded-2xl text-white text-center shadow-lg">
                        <p className="text-xs md:text-sm uppercase tracking-wider opacity-90 mb-2 md:mb-3 font-bold">
                            {getTranslation(language, 'questionLabel') || 'Find This Country'}
                        </p>
                        <div className="flex justify-center gap-2 items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-300 shadow-lg animate-pulse" />
                            <span className="text-sm font-medium">{getTranslation(language, 'lookForAmber') || 'Look for the blue highlight'}</span>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {feedback && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`p-4 md:p-5 rounded-2xl text-center font-bold text-lg md:text-xl shadow-lg ${feedback.type === 'success'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                                    }`}
                            >
                                {feedback.message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (!cluesRevealed.capital) {
                                    setCluesRevealed(prev => ({ ...prev, capital: true }));
                                    setScore(prev => Math.max(0, prev - 3));
                                }
                            }}
                            disabled={cluesRevealed.capital}
                            className={`p-3 md:p-5 rounded-xl md:rounded-2xl flex flex-col items-center gap-1 md:gap-2 transition-all shadow-lg ${cluesRevealed.capital
                                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                : 'bg-white/20 backdrop-blur-md hover:bg-white/30 text-white'
                                }`}
                        >
                            <MapPin size={20} className="md:w-7 md:h-7" />
                            <span className="text-[10px] md:text-xs uppercase font-bold tracking-wider">{getTranslation(language, 'showCapital') || 'Capital'}</span>
                            <span className="text-xs md:text-sm font-bold text-center truncate w-full">{cluesRevealed.capital ? (targetCountry?.capital[language] || targetCountry?.capital.en) : '???'}</span>
                            {!cluesRevealed.capital && <span className="text-[10px] md:text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">-3</span>}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (!cluesRevealed.letter) {
                                    setCluesRevealed(prev => ({ ...prev, letter: true }));
                                    setScore(prev => Math.max(0, prev - 2));
                                }
                            }}
                            disabled={cluesRevealed.letter}
                            className={`p-3 md:p-5 rounded-xl md:rounded-2xl flex flex-col items-center gap-1 md:gap-2 transition-all shadow-lg ${cluesRevealed.letter
                                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                : 'bg-white/20 backdrop-blur-md hover:bg-white/30 text-white'
                                }`}
                        >
                            <span className="text-xl md:text-3xl font-black">A</span>
                            <span className="text-[10px] md:text-xs uppercase font-bold tracking-wider">{getTranslation(language, 'firstLetter') || 'Letter'}</span>
                            <span className="text-lg md:text-2xl font-black">{cluesRevealed.letter ? (targetCountry?.name[language]?.[0] || targetCountry?.name.en?.[0]) : '?'}</span>
                            {!cluesRevealed.letter && <span className="text-[10px] md:text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">-2</span>}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (!cluesRevealed.flag) {
                                    setCluesRevealed(prev => ({ ...prev, flag: true }));
                                    setScore(prev => Math.max(0, prev - 2));
                                }
                            }}
                            disabled={cluesRevealed.flag}
                            className={`p-3 md:p-5 rounded-xl md:rounded-2xl flex flex-col items-center gap-1 md:gap-2 transition-all shadow-lg ${cluesRevealed.flag
                                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                : 'bg-white/20 backdrop-blur-md hover:bg-white/30 text-white'
                                }`}
                        >
                            {cluesRevealed.flag ? (
                                <img
                                    src={`https://flagcdn.com/w80/${targetCountry?.id.toLowerCase()}.png`}
                                    alt={targetCountry?.name.en}
                                    className="w-10 h-8 md:w-16 md:h-12 object-cover rounded-lg shadow-lg"
                                    onError={(e) => {
                                        e.target.src = `https://flagcdn.com/w80/${targetCountry?.id.slice(0, 2).toLowerCase()}.png`;
                                    }}
                                />
                            ) : (
                                <div className="w-10 h-8 md:w-16 md:h-12 bg-white/20 rounded-lg flex items-center justify-center text-xl md:text-3xl">
                                    🏳️
                                </div>
                            )}
                            <span className="text-[10px] md:text-xs uppercase font-bold tracking-wider">{getTranslation(language, 'showFlag') || 'Flag'}</span>
                            {!cluesRevealed.flag && <span className="text-[10px] md:text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">-2</span>}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (!cluesRevealed.landmark) {
                                    setCluesRevealed(prev => ({ ...prev, landmark: true }));
                                    setScore(prev => Math.max(0, prev - 3));
                                }
                            }}
                            disabled={cluesRevealed.landmark}
                            className={`p-3 md:p-5 rounded-xl md:rounded-2xl flex flex-col items-center gap-1 md:gap-2 transition-all shadow-lg ${cluesRevealed.landmark
                                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                : 'bg-white/20 backdrop-blur-md hover:bg-white/30 text-white'
                                }`}
                        >
                            <Sparkles size={20} className="md:w-7 md:h-7" />
                            <span className="text-[10px] md:text-xs uppercase font-bold tracking-wider">{getTranslation(language, 'showLandmark') || 'Landmark'}</span>
                            <span className="text-xs md:text-sm font-bold text-center truncate w-full">{cluesRevealed.landmark ? (targetCountry?.landmark[language] || targetCountry?.landmark.en) : '???'}</span>
                            {!cluesRevealed.landmark && <span className="text-[10px] md:text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">-3</span>}
                        </motion.button>
                    </div>

                    <form onSubmit={handleInputSubmit} className="relative mt-auto">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={getTranslation(language, 'typeCountry') || 'Type country name...'}
                            className="w-full bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-5 pr-12 md:pr-16 focus:outline-none focus:border-white focus:bg-white/30 transition-all placeholder-white/50 shadow-lg text-white text-base md:text-lg font-medium"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-3 md:px-5 rounded-lg md:rounded-xl transition-all shadow-lg flex items-center justify-center"
                        >
                            <ArrowRight size={20} className="md:w-6 md:h-6" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Wrap with LanguageProvider
const AldeaWorld = () => {
    return (
        <LanguageProvider>
            <AldeaWorldGame />
        </LanguageProvider>
    );
};

export default AldeaWorld;
