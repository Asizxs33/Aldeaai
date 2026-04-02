import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { MessageCircle, Users, Send, Star, UserPlus, ArrowRight, Activity, Smile, Frown, Meh } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Feedback = () => {
    const { language } = useLanguage();
    const [mode, setMode] = useState('teacher'); // 'teacher' | 'student'

    // Teacher State
    const [sessions, setSessions] = useState([]);
    const [newSessionName, setNewSessionName] = useState('');
    const [selectedSession, setSelectedSession] = useState(null);

    // Student State
    const [joinCode, setJoinCode] = useState('');
    const [activeSession, setActiveSession] = useState(null);
    const [rating, setRating] = useState(null);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Initialize from LocalStorage
    useEffect(() => {
        const storedSessions = JSON.parse(localStorage.getItem('aldea_feedback_sessions') || '[]');
        setSessions(storedSessions);
    }, []);

    const createSession = () => {
        if (!newSessionName.trim()) return;
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const newSession = {
            id: Date.now(),
            name: newSessionName,
            code: code,
            createdAt: new Date().toISOString(),
            feedbacks: []
        };
        const updatedSessions = [newSession, ...sessions];
        setSessions(updatedSessions);
        localStorage.setItem('aldea_feedback_sessions', JSON.stringify(updatedSessions));
        setNewSessionName('');
    };

    const handleJoinSession = () => {
        const storedSessions = JSON.parse(localStorage.getItem('aldea_feedback_sessions') || '[]');
        const session = storedSessions.find(s => s.code === joinCode);
        if (session) {
            setActiveSession(session);
        } else {
            alert('Session not found!');
        }
    };

    const submitFeedback = () => {
        if (!rating) return;

        const feedback = {
            rating, // 1-4
            comment,
            timestamp: new Date().toISOString()
        };

        const storedSessions = JSON.parse(localStorage.getItem('aldea_feedback_sessions') || '[]');
        const updatedSessions = storedSessions.map(s => {
            if (s.code === activeSession.code) {
                return { ...s, feedbacks: [feedback, ...s.feedbacks] };
            }
            return s;
        });

        localStorage.setItem('aldea_feedback_sessions', JSON.stringify(updatedSessions));
        setSubmitted(true);
    };

    // Helper to get stats for selected session
    const getSessionStats = (session) => {
        if (!session.feedbacks.length) return null;
        const avg = session.feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / session.feedbacks.length;
        return avg.toFixed(1);
    };

    return (
        <div className="max-w-5xl mx-auto pb-12 px-4">
            {/* Header & Mode Switch */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                        <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                            {getTranslation(language, 'feedback')}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            Teacher & Student Collaboration
                        </p>
                    </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl flex">
                    <button
                        onClick={() => { setMode('teacher'); setSubmitted(false); setActiveSession(null); }}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${mode === 'teacher' ? 'bg-white dark:bg-gray-700 shadow-md text-amber-600 dark:text-amber-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        {getTranslation(language, 'teacherMode')}
                    </button>
                    <button
                        onClick={() => { setMode('student'); setSelectedSession(null); }}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${mode === 'student' ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        {getTranslation(language, 'studentMode')}
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {mode === 'teacher' ? (
                    <motion.div
                        key="teacher"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                    >
                        {/* Create Session Card */}
                        <div className="bg-white dark:bg-[#12141c] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 relative z-10">{getTranslation(language, 'createSession')}</h2>
                            <div className="flex gap-4 relative z-10">
                                <input
                                    type="text"
                                    value={newSessionName}
                                    onChange={(e) => setNewSessionName(e.target.value)}
                                    placeholder={getTranslation(language, 'sessionName')}
                                    className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-4 outline-none focus:border-amber-500 text-lg transition-colors"
                                />
                                <button
                                    onClick={createSession}
                                    disabled={!newSessionName}
                                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                                >
                                    {getTranslation(language, 'create')}
                                </button>
                            </div>
                        </div>

                        {/* Active Sessions List & Results */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Session List */}
                            <div className="lg:col-span-1 space-y-4">
                                <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest">{getTranslation(language, 'activeSessions')}</h3>
                                {sessions.length === 0 && <p className="text-gray-400 italic">No active sessions</p>}
                                {sessions.map(session => (
                                    <div
                                        key={session.id}
                                        onClick={() => setSelectedSession(session)}
                                        className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedSession?.id === session.id
                                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 shadow-md'
                                                : 'bg-white dark:bg-[#12141c] border-gray-100 dark:border-gray-800 hover:border-amber-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-xl text-gray-900 dark:text-white">{session.name}</h4>
                                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg font-mono font-bold text-sm">
                                                {session.code}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Users size={16} />
                                            <span>{session.feedbacks.length} feedbacks</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Results View */}
                            <div className="lg:col-span-2">
                                {selectedSession ? (
                                    <div className="bg-white dark:bg-[#12141c] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl min-h-[400px]">
                                        <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                                            <div>
                                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedSession.name}</h2>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-amber-500 font-bold text-xl">Code: {selectedSession.code}</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                    <span className="text-gray-500">Live Results</span>
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                </div>
                                            </div>
                                            {selectedSession.feedbacks.length > 0 && (
                                                <div className="text-right">
                                                    <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">
                                                        {getSessionStats(selectedSession)}
                                                    </div>
                                                    <div className="text-sm text-gray-400">Average Rating</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {selectedSession.feedbacks.length === 0 ? (
                                                <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                                                    <Activity className="w-16 h-16 mb-4 opacity-20" />
                                                    <p>{getTranslation(language, 'waitingForFeedback')}</p>
                                                </div>
                                            ) : (
                                                selectedSession.feedbacks.map((fb, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800"
                                                    >
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <div className={`p-3 rounded-xl ${fb.rating === 4 ? 'bg-green-100 text-green-600' :
                                                                    fb.rating === 3 ? 'bg-blue-100 text-blue-600' :
                                                                        fb.rating === 2 ? 'bg-yellow-100 text-yellow-600' :
                                                                            'bg-red-100 text-red-600'
                                                                }`}>
                                                                {fb.rating === 4 ? <Star fill="currentColor" /> :
                                                                    fb.rating === 3 ? <Smile /> :
                                                                        fb.rating === 2 ? <Meh /> : <Frown />}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 dark:text-white">
                                                                    {fb.rating === 4 ? getTranslation(language, 'amazing') :
                                                                        fb.rating === 3 ? getTranslation(language, 'good') :
                                                                            fb.rating === 2 ? getTranslation(language, 'okay') :
                                                                                getTranslation(language, 'bad')}
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    {new Date(fb.timestamp).toLocaleTimeString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {fb.comment && (
                                                            <p className="text-gray-600 dark:text-gray-300 ml-16 bg-white dark:bg-gray-800 p-3 rounded-lg text-sm italic border border-gray-200 dark:border-gray-700">
                                                                "{fb.comment}"
                                                            </p>
                                                        )}
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem]">
                                        <ArrowRight className="w-12 h-12 mb-4 opacity-50" />
                                        <p>Select a session to view results</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="student"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-xl mx-auto"
                    >
                        {!activeSession ? (
                            <div className="bg-white dark:bg-[#12141c] rounded-[2rem] p-10 border border-gray-100 dark:border-gray-800 shadow-2xl text-center space-y-8">
                                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600">
                                    <UserPlus size={40} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{getTranslation(language, 'joinSession')}</h2>
                                    <p className="text-gray-500">{getTranslation(language, 'enterCode')}</p>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        className="w-full text-center text-4xl font-mono font-bold tracking-[1em] py-6 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 transition-colors uppercase"
                                        placeholder="0000"
                                    />
                                    <button
                                        onClick={handleJoinSession}
                                        disabled={joinCode.length !== 4}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all"
                                    >
                                        {getTranslation(language, 'join')}
                                    </button>
                                </div>
                            </div>
                        ) : !submitted ? (
                            <div className="bg-white dark:bg-[#12141c] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-8">
                                <div className="text-center border-b border-gray-100 dark:border-gray-800 pb-6">
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold mb-2 inline-block">Connected</span>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activeSession.name}</h2>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-center text-gray-700 dark:text-gray-200">{getTranslation(language, 'howWasLesson')}</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { val: 1, icon: Frown, label: 'bad', color: 'red' },
                                            { val: 2, icon: Meh, label: 'okay', color: 'yellow' },
                                            { val: 3, icon: Smile, label: 'good', color: 'blue' },
                                            { val: 4, icon: Star, label: 'amazing', color: 'green' }
                                        ].map(opt => (
                                            <button
                                                key={opt.val}
                                                onClick={() => setRating(opt.val)}
                                                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${rating === opt.val
                                                        ? `bg-${opt.color}-50 border-${opt.color}-500 text-${opt.color}-600 transform scale-105 shadow-md`
                                                        : 'bg-gray-50 dark:bg-gray-900 border-transparent hover:border-gray-300 text-gray-400 hover:text-gray-600'
                                                    }`}
                                            >
                                                <opt.icon size={32} />
                                                <span className="font-bold text-sm">{getTranslation(language, opt.label)}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder={getTranslation(language, 'commentPlaceholder')}
                                        className="w-full h-32 bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 outline-none focus:border-blue-500 transition-colors resize-none"
                                    />

                                    <button
                                        onClick={submitFeedback}
                                        disabled={!rating}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Send size={20} />
                                        {getTranslation(language, 'submitFeedback')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#12141c] rounded-[2rem] p-12 border border-gray-100 dark:border-gray-800 shadow-2xl text-center">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6 animate-bounce">
                                    <Star size={48} fill="currentColor" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{getTranslation(language, 'feedbackSent')}</h2>
                                <p className="text-gray-500 mb-8">{getTranslation(language, 'feedbackSentDesc')}</p>
                                <button
                                    onClick={() => { setSubmitted(false); setActiveSession(null); }}
                                    className="px-8 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold transition-colors"
                                >
                                    {getTranslation(language, 'backToHome')}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Feedback;
