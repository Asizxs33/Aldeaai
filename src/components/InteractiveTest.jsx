import React, { useState } from 'react';
import { Check, X, Award, RotateCcw, ChevronRight, Lightbulb, Trophy, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InteractiveTest = ({ testData, onRetry }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
    const [showReview, setShowReview] = useState(false);

    const questions = testData.questions || [];

    const handleAnswerSelect = (optionKey) => {
        if (hasSubmittedAnswer) return; // Can't change after submission
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestionIndex]: optionKey
        });
    };

    const handleSubmitAnswer = () => {
        setHasSubmittedAnswer(true);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setHasSubmittedAnswer(false);
        } else {
            calculateScore();
            setShowResults(true);
        }
    };

    const calculateScore = () => {
        let newScore = 0;
        questions.forEach((q, index) => {
            if (selectedAnswers[index] === q.correctAnswer) {
                newScore++;
            }
        });
        setScore(newScore);
    };

    const getScoreEmoji = () => {
        const percentage = (score / questions.length) * 100;
        if (percentage >= 90) return '🏆';
        if (percentage >= 70) return '🎉';
        if (percentage >= 50) return '👍';
        return '💪';
    };

    const getScoreMessage = () => {
        const percentage = (score / questions.length) * 100;
        if (percentage >= 90) return 'Отлично! Вы мастер!';
        if (percentage >= 70) return 'Хорошо! Есть небольшие пробелы';
        if (percentage >= 50) return 'Неплохо! Стоит повторить материал';
        return 'Нужно подучить тему';
    };

    if (!questions.length) return <div className="text-gray-600 dark:text-white p-8 text-center">Ошибка загрузки теста</div>;

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestionIndex];
    const isAnswered = selectedAnswer !== undefined;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    // Review mode - show all questions with answers
    if (showReview) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Обзор ответов</h2>
                    <button
                        onClick={() => setShowReview(false)}
                        className="px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                        Назад к результатам
                    </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {questions.map((q, index) => {
                        const userAnswer = selectedAnswers[index];
                        const wasCorrect = userAnswer === q.correctAnswer;

                        return (
                            <div
                                key={index}
                                className={`p-4 rounded-xl border ${wasCorrect
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    }`}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${wasCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                        {wasCorrect ? <Check size={14} /> : <X size={14} />}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                            {index + 1}. {q.question}
                                        </p>
                                    </div>
                                </div>

                                <div className="ml-9 space-y-1 text-sm">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Ваш ответ:</span> {userAnswer}) {q.options[userAnswer]}
                                    </p>
                                    {!wasCorrect && (
                                        <p className="text-green-600 dark:text-green-400">
                                            <span className="font-medium">Правильный:</span> {q.correctAnswer}) {q.options[q.correctAnswer]}
                                        </p>
                                    )}
                                    {q.explanation && (
                                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-300 text-xs">
                                            <Lightbulb size={12} className="inline mr-1" />
                                            {q.explanation}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        );
    }

    // Results screen
    if (showResults) {
        const percentage = Math.round((score / questions.length) * 100);

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
            >
                {/* Score Circle */}
                <div className="relative w-40 h-40 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="80" cy="80" r="70"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <motion.circle
                            cx="80" cy="80" r="70"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: '0 440' }}
                            animate={{ strokeDasharray: `${(percentage / 100) * 440} 440` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">{percentage}%</span>
                        <span className="text-2xl">{getScoreEmoji()}</span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {getScoreMessage()}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Правильно: {score} из {questions.length} вопросов
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{score}</div>
                        <div className="text-xs text-green-600 dark:text-green-400">Правильно</div>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{questions.length - score}</div>
                        <div className="text-xs text-red-600 dark:text-red-400">Ошибок</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{questions.length}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Всего</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => setShowReview(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all font-medium"
                    >
                        <Target size={18} />
                        Посмотреть ответы
                    </button>
                    <button
                        onClick={onRetry}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-blue-500/25"
                    >
                        <RotateCcw size={18} />
                        Новый тест
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Вопрос {currentQuestionIndex + 1} из {questions.length}
                </span>
                <span className="text-sm font-medium text-blue-500">
                    {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Question */}
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
                        {currentQuestion.question}
                    </h3>

                    {/* Options */}
                    <div className="space-y-3">
                        {Object.entries(currentQuestion.options).map(([key, value]) => {
                            const isSelected = selectedAnswer === key;
                            const isCorrectOption = key === currentQuestion.correctAnswer;

                            let optionStyle = 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';

                            if (hasSubmittedAnswer) {
                                if (isCorrectOption) {
                                    optionStyle = 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300';
                                } else if (isSelected && !isCorrectOption) {
                                    optionStyle = 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300';
                                }
                            } else if (isSelected) {
                                optionStyle = 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300';
                            }

                            return (
                                <button
                                    key={key}
                                    onClick={() => handleAnswerSelect(key)}
                                    disabled={hasSubmittedAnswer}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${optionStyle} ${!hasSubmittedAnswer && 'hover:border-blue-300 dark:hover:border-blue-500'}`}
                                >
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${hasSubmittedAnswer && isCorrectOption
                                        ? 'bg-green-500 text-white'
                                        : hasSubmittedAnswer && isSelected && !isCorrectOption
                                            ? 'bg-red-500 text-white'
                                            : isSelected
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        {hasSubmittedAnswer && isCorrectOption ? <Check size={16} /> :
                                            hasSubmittedAnswer && isSelected && !isCorrectOption ? <X size={16} /> :
                                                key}
                                    </span>
                                    <span className="flex-1">{value}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    {hasSubmittedAnswer && currentQuestion.explanation && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                        >
                            <div className="flex items-start gap-2">
                                <Lightbulb className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Action Button */}
                    <div className="mt-6 flex justify-end">
                        {!hasSubmittedAnswer ? (
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={!isAnswered}
                                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2
                                    ${isAnswered
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Проверить
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                            >
                                {currentQuestionIndex === questions.length - 1 ? 'Завершить' : 'Далее'}
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default InteractiveTest;
