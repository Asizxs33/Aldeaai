import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { Plus, Sparkles, User, MessageSquare, Trash2, PanelLeftClose, PanelLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics, ANALYTICS_EVENTS } from '../hooks/useAnalytics';
import { markdownToHtml } from '../utils/exportContent';
import { API_BASE } from '../utils/api';
import UpgradeModal from '../components/UpgradeModal';

const Bot = () => {
    const { language } = useLanguage();
    const { trackEvent } = useAnalytics();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const [chatHistory, setChatHistory] = useState([
        { id: 1, title: 'Новый чат', timestamp: new Date() }
    ]);
    const [currentChatId, setCurrentChatId] = useState(1);

    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue;
        const userMessage = {
            id: Date.now(),
            text: userText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Track bot message event
        trackEvent(ANALYTICS_EVENTS.BOT_MESSAGE_SENT, { length: userText.length });

        try {
            const res = await fetch(`${API_BASE}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText, language }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || `Server error: ${res.status}`);
            }
            const data = await res.json();
            const aiResponseText = data.response;

            const aiMessage = {
                id: Date.now() + 1,
                text: aiResponseText,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Bot generation error:', error);
            if (error.upgradeRequired) {
                setUpgradeMessage(error.message);
                setIsUpgradeModalOpen(true);
                // Optionally remove user message or add system message saying "Failed"
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: '⚠️ ' + (getTranslation(language, 'limitReached') || 'Limit Reached'),
                    sender: 'system',
                    timestamp: new Date()
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: '⚠️ Error: ' + (error.message || 'Failed to get response'),
                    sender: 'system',
                    timestamp: new Date()
                }]);
            }
        } finally {
            setIsTyping(false);
        }
    };

    const handleNewChat = () => {
        const newChat = {
            id: Date.now(),
            title: `Чат ${chatHistory.length + 1}`,
            timestamp: new Date()
        };
        setChatHistory(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        setMessages([]);
    };

    const deleteChat = (chatId, e) => {
        e.stopPropagation();
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        if (currentChatId === chatId && chatHistory.length > 1) {
            const remainingChats = chatHistory.filter(chat => chat.id !== chatId);
            setCurrentChatId(remainingChats[0].id);
        }
    };

    return (
        <div className="flex h-full bg-[#F3F4F6] dark:bg-[#0B1121] md:p-4 gap-4 relative overflow-hidden md:overflow-visible">
            {/* Sidebar - Chat History */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 left-0 z-50 h-full md:relative md:h-auto md:z-auto bg-white/95 md:bg-white/80 dark:bg-gray-900/95 md:dark:bg-gray-900/80 backdrop-blur-2xl border-r md:border border-white/20 dark:border-gray-800 md:rounded-[2rem] flex flex-col overflow-hidden shadow-2xl md:shadow-2xl"
                    >
                        {/* Sidebar Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center md:block">
                            <button
                                onClick={handleNewChat}
                                className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl py-3 px-4 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 group"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                                <div className="flex items-center justify-center gap-2 relative z-10">
                                    <Plus size={18} strokeWidth={2.5} />
                                    <span className="text-sm font-bold tracking-wide">{getTranslation(language, 'newChat')}</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="md:hidden p-2 text-gray-500"
                            >
                                <PanelLeftClose size={20} />
                            </button>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-hide">
                            <AnimatePresence>
                                {chatHistory.map((chat, index) => (
                                    <motion.button
                                        key={chat.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => {
                                            setCurrentChatId(chat.id);
                                            // Close sidebar on mobile when chat selected
                                            if (window.innerWidth < 768) setSidebarOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group relative ${currentChatId === chat.id
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <MessageSquare
                                                size={16}
                                                strokeWidth={currentChatId === chat.id ? 2.5 : 2}
                                                className={`flex-shrink-0 transition-transform duration-300 ${currentChatId === chat.id ? 'scale-110' : 'group-hover:scale-110'}`}
                                            />
                                            <span className="text-sm truncate flex-1">{chat.title}</span>
                                            {chatHistory.length > 1 && (
                                                <button
                                                    onClick={(e) => deleteChat(chat.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0"
                                                >
                                                    <Trash2 size={13} className="text-red-500" />
                                                </button>
                                            )}
                                        </div>
                                        {currentChatId === chat.id && (
                                            <motion.div
                                                layoutId="activeChatIndicator"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"
                                            />
                                        )}
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Overlay for Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-x md:border border-white/20 dark:border-gray-800 md:rounded-[2rem] overflow-hidden shadow-xl h-full">
                {/* Top Bar with Toggle */}
                <div className="flex items-center gap-3 p-3 md:p-4 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-emerald-950/0">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        {sidebarOpen && window.innerWidth >= 768 ? <PanelLeftClose size={20} className="text-gray-600 dark:text-gray-400" /> : <PanelLeft size={20} className="text-gray-600 dark:text-gray-400" />}
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 md:w-10 md:h-10">
                            <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-20"></div>
                            <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                                <Sparkles size={16} className="text-white md:w-5 md:h-5" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-base md:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Aldea Bot</h2>
                            <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{getTranslation(language, 'aiAssistant')}</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto scrollbar-hide px-2 md:px-0">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center p-4 md:p-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center max-w-2xl space-y-4 md:space-y-6"
                            >
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                                    <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
                                        <Sparkles size={32} className="text-white md:w-10 md:h-10" strokeWidth={2.5} />
                                    </div>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {getTranslation(language, 'welcomeBot')}
                                </h1>
                                <p className="text-sm md:text-lg text-gray-600 dark:text-gray-400 max-w-xs md:max-w-none mx-auto">
                                    {getTranslation(language, 'welcomeBotDesc')}
                                </p>
                            </motion.div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto py-4 md:py-8 px-2 md:px-4 space-y-4 md:space-y-6">
                            <AnimatePresence>
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex gap-3 md:gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.sender === 'ai' && (
                                            <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-md opacity-40"></div>
                                                <div className="relative w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                                    <Sparkles size={16} className="text-white md:w-5 md:h-5" />
                                                </div>
                                            </div>
                                        )}
                                        <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-4 ${message.sender === 'user'
                                            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/20'
                                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg'
                                            }`}>
                                            <div
                                                className={`prose prose-sm max-w-none ${message.sender === 'user' ? 'text-white prose-invert' : 'dark:prose-invert'}`}
                                                dangerouslySetInnerHTML={{ __html: markdownToHtml(message.text) }}
                                            />
                                        </div>
                                        {message.sender === 'user' && (
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                                <User size={16} className="text-gray-700 dark:text-gray-200 md:w-5 md:h-5" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-3 md:gap-4"
                                >
                                    <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-md opacity-40"></div>
                                        <div className="relative w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                            <Sparkles size={16} className="text-white md:w-5 md:h-5" />
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl px-6 py-4 shadow-lg">
                                        <div className="flex gap-1.5">
                                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-3 md:p-6 pb-safe md:pb-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative flex items-end gap-2 md:gap-3">
                            <div className="flex-1 relative">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder={getTranslation(language, 'typeMessage')}
                                    rows={1}
                                    className="w-full resize-none bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-4 text-sm md:text-base text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-all shadow-lg hover:shadow-xl"
                                    style={{ minHeight: '48px', maxHeight: '150px' }}
                                />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-600 rounded-full flex items-center justify-center transition-all duration-300 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 disabled:hover:scale-100"
                            >
                                <Send size={20} className="text-white md:w-6 md:h-6" />
                            </button>
                        </div>
                        <p className="text-[10px] md:text-xs text-center text-gray-400 mt-2 md:mt-3">
                            {getTranslation(language, 'botDisclaimer')}
                        </p>
                    </div>
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

export default Bot;
