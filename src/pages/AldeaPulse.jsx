import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Gauge, Play, RotateCcw, Target, Trophy, Zap } from 'lucide-react';

const GAME_DURATION_SECONDS = 45;
const BASE_TARGET_LIFETIME_MS = 1400;
const BEST_SCORE_KEY = 'aldea_pulse_best_score';

const DIFFICULTIES = {
    easy: {
        label: 'Easy',
        multiplier: 1,
        lifetimeFactor: 1.1
    },
    normal: {
        label: 'Normal',
        multiplier: 1.25,
        lifetimeFactor: 1
    },
    hard: {
        label: 'Hard',
        multiplier: 1.6,
        lifetimeFactor: 0.8
    }
};

const AldeaPulse = () => {
    const navigate = useNavigate();
    const arenaRef = useRef(null);

    const [difficulty, setDifficulty] = useState('normal');
    const [screen, setScreen] = useState('menu');
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [hits, setHits] = useState(0);
    const [misses, setMisses] = useState(0);
    const [target, setTarget] = useState(null);

    useEffect(() => {
        const raw = window.localStorage.getItem(BEST_SCORE_KEY);
        const parsed = Number(raw || 0);
        setBestScore(Number.isFinite(parsed) ? parsed : 0);
    }, []);

    const createTarget = useCallback(() => {
        const arenaRect = arenaRef.current?.getBoundingClientRect();
        const width = arenaRect?.width || 900;
        const height = arenaRect?.height || 500;

        const size = 58 + Math.random() * 32;
        const x = Math.max(12, Math.random() * (width - size - 24));
        const y = Math.max(12, Math.random() * (height - size - 24));
        const isBonus = Math.random() < 0.18;
        const lifetime = BASE_TARGET_LIFETIME_MS * DIFFICULTIES[difficulty].lifetimeFactor * (isBonus ? 0.9 : 1);

        return {
            id: `${Date.now()}-${Math.random()}`,
            x,
            y,
            size,
            isBonus,
            lifetime,
            createdAt: performance.now()
        };
    }, [difficulty]);

    const startGame = useCallback(() => {
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setHits(0);
        setMisses(0);
        setTimeLeft(GAME_DURATION_SECONDS);
        setTarget(createTarget());
        setScreen('play');
    }, [createTarget]);

    useEffect(() => {
        if (screen !== 'play') return undefined;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0.05) {
                    return 0;
                }
                return Math.max(0, prev - 0.05);
            });

            setTarget((currentTarget) => {
                if (!currentTarget) return currentTarget;
                const now = performance.now();
                if (now - currentTarget.createdAt > currentTarget.lifetime) {
                    setMisses((prev) => prev + 1);
                    setCombo(0);
                    return createTarget();
                }
                return currentTarget;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [screen, createTarget]);

    useEffect(() => {
        if (screen !== 'play' || timeLeft > 0) return;
        setScreen('result');
    }, [screen, timeLeft]);

    useEffect(() => {
        if (screen !== 'result') return;
        setBestScore((currentBest) => {
            if (score > currentBest) {
                window.localStorage.setItem(BEST_SCORE_KEY, String(score));
                return score;
            }
            return currentBest;
        });
    }, [screen, score]);

    const accuracy = useMemo(() => {
        const total = hits + misses;
        if (!total) return 0;
        return Math.round((hits / total) * 100);
    }, [hits, misses]);

    const handleHit = useCallback(() => {
        setTarget((currentTarget) => {
            if (!currentTarget) return currentTarget;

            const reactionMs = performance.now() - currentTarget.createdAt;
            const speedBonus = Math.max(0, 220 - reactionMs / 6);
            const comboBonus = combo * 7;
            const base = currentTarget.isBonus ? 180 : 110;
            const gained = Math.round((base + speedBonus + comboBonus) * DIFFICULTIES[difficulty].multiplier);

            setScore((prev) => prev + gained);
            setCombo((prev) => {
                const next = prev + 1;
                setMaxCombo((best) => Math.max(best, next));
                return next;
            });
            setHits((prev) => prev + 1);

            return createTarget();
        });
    }, [combo, createTarget, difficulty]);

    const handleMiss = useCallback(() => {
        if (screen !== 'play') return;
        setMisses((prev) => prev + 1);
        setCombo(0);
    }, [screen]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#091022] via-[#0b1735] to-[#0e224f] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/games')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/15 hover:bg-white/15 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <div className="text-right">
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Aldea Pulse</h1>
                        <p className="text-blue-100/70 text-sm">Reaction game inspired by modern learning platforms</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                    <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                        <div className="text-xs text-blue-100/70 uppercase">Time</div>
                        <div className="text-2xl font-black text-white">{timeLeft.toFixed(1)}s</div>
                    </div>
                    <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                        <div className="text-xs text-blue-100/70 uppercase">Score</div>
                        <div className="text-2xl font-black text-white">{score}</div>
                    </div>
                    <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                        <div className="text-xs text-blue-100/70 uppercase">Combo</div>
                        <div className="text-2xl font-black text-cyan-300">x{combo}</div>
                    </div>
                    <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                        <div className="text-xs text-blue-100/70 uppercase">Accuracy</div>
                        <div className="text-2xl font-black text-white">{accuracy}%</div>
                    </div>
                    <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                        <div className="text-xs text-blue-100/70 uppercase">Best</div>
                        <div className="text-2xl font-black text-amber-300">{bestScore}</div>
                    </div>
                </div>

                <div
                    ref={arenaRef}
                    onClick={handleMiss}
                    className="relative rounded-[2rem] min-h-[460px] md:min-h-[540px] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),rgba(2,6,23,0.7)_60%)] border border-white/15 overflow-hidden shadow-2xl"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />

                    {screen === 'menu' && (
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                            <div className="max-w-2xl w-full rounded-3xl bg-white/10 border border-white/15 p-6 md:p-8 text-white">
                                <h2 className="text-3xl font-black mb-3">Ready to test your reaction?</h2>
                                <p className="text-blue-100/80 mb-6">Hit targets quickly, build combo streaks, and chase your high score.</p>

                                <div className="grid sm:grid-cols-3 gap-3 mb-6">
                                    {Object.entries(DIFFICULTIES).map(([id, value]) => (
                                        <button
                                            key={id}
                                            onClick={() => setDifficulty(id)}
                                            className={`px-4 py-3 rounded-2xl border font-bold transition-colors ${
                                                difficulty === id
                                                    ? 'bg-blue-600 border-blue-500 text-white'
                                                    : 'bg-white/5 border-white/15 hover:bg-white/10'
                                            }`}
                                        >
                                            {value.label}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={startGame}
                                    className="w-full md:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                                >
                                    <Play size={20} fill="currentColor" />
                                    Start Match
                                </button>
                            </div>
                        </div>
                    )}

                    {screen === 'play' && target && (
                        <motion.button
                            key={target.id}
                            onClick={(event) => {
                                event.stopPropagation();
                                handleHit();
                            }}
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            className={`absolute rounded-full flex items-center justify-center text-white border-4 shadow-2xl ${
                                target.isBonus
                                    ? 'bg-gradient-to-br from-fuchsia-500 to-orange-400 border-fuchsia-200/80'
                                    : 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-200/80'
                            }`}
                            style={{
                                left: target.x,
                                top: target.y,
                                width: target.size,
                                height: target.size
                            }}
                        >
                            {target.isBonus ? <Zap size={24} /> : <Target size={24} />}
                        </motion.button>
                    )}

                    {screen === 'result' && (
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                            <div className="max-w-xl w-full rounded-3xl bg-white/10 border border-white/15 p-6 md:p-8 text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <Trophy className="text-amber-300" />
                                    <h2 className="text-3xl font-black">Match Finished</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="rounded-2xl bg-white/10 p-4">
                                        <div className="text-xs text-blue-100/70 uppercase">Final Score</div>
                                        <div className="text-3xl font-black">{score}</div>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-4">
                                        <div className="text-xs text-blue-100/70 uppercase">Best Score</div>
                                        <div className="text-3xl font-black text-amber-300">{bestScore}</div>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-4">
                                        <div className="text-xs text-blue-100/70 uppercase">Max Combo</div>
                                        <div className="text-2xl font-black">x{maxCombo}</div>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-4">
                                        <div className="text-xs text-blue-100/70 uppercase">Accuracy</div>
                                        <div className="text-2xl font-black">{accuracy}%</div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={startGame}
                                        className="flex-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 font-bold flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw size={18} />
                                        Play Again
                                    </button>
                                    <button
                                        onClick={() => setScreen('menu')}
                                        className="flex-1 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 font-bold flex items-center justify-center gap-2"
                                    >
                                        <Gauge size={18} />
                                        Change Difficulty
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AldeaPulse;
