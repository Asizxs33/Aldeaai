import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, CheckCircle2, Clock3, RotateCcw, Target, XCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const GAME_SIZE = 10;
const QUESTION_TIME = 20;

const uiCopy = {
    en: {
        title: 'Aldea Study Quest',
        subtitle: 'Educational challenge across school subjects',
        startTitle: 'Ready for a smart challenge?',
        startText: 'Answer mixed subject questions, keep your streak, and finish with the highest score.',
        startButton: 'Start Quest',
        question: 'Question',
        of: 'of',
        streak: 'Streak',
        score: 'Score',
        seconds: 's',
        correct: 'Correct',
        wrong: 'Wrong',
        next: 'Next',
        resultTitle: 'Quest Complete',
        finalScore: 'Final Score',
        accuracy: 'Accuracy',
        bestStreak: 'Best Streak',
        playAgain: 'Play Again'
    },
    ru: {
        title: 'Aldea Study Quest',
        subtitle: 'Учебный челлендж по школьным предметам',
        startTitle: 'Готов к умному испытанию?',
        startText: 'Отвечай на вопросы по разным предметам, держи серию и набирай максимум очков.',
        startButton: 'Начать квест',
        question: 'Вопрос',
        of: 'из',
        streak: 'Серия',
        score: 'Очки',
        seconds: 'с',
        correct: 'Верно',
        wrong: 'Неверно',
        next: 'Далее',
        resultTitle: 'Квест завершён',
        finalScore: 'Итоговый счёт',
        accuracy: 'Точность',
        bestStreak: 'Лучшая серия',
        playAgain: 'Сыграть ещё'
    },
    kk: {
        title: 'Aldea Study Quest',
        subtitle: 'Мектеп пәндері бойынша оқу челленджі',
        startTitle: 'Ақылды сынаққа дайынсың ба?',
        startText: 'Әртүрлі пән сұрақтарына жауап беріп, серияңды сақтап, ең жоғары ұпай жина.',
        startButton: 'Квестті бастау',
        question: 'Сұрақ',
        of: 'ішінен',
        streak: 'Серия',
        score: 'Ұпай',
        seconds: 'с',
        correct: 'Дұрыс',
        wrong: 'Қате',
        next: 'Келесі',
        resultTitle: 'Квест аяқталды',
        finalScore: 'Қорытынды ұпай',
        accuracy: 'Дәлдік',
        bestStreak: 'Ең үздік серия',
        playAgain: 'Қайта ойнау'
    }
};

const questionBank = [
    {
        subject: 'Mathematics',
        text: { en: 'What is 15% of 200?', ru: 'Сколько будет 15% от 200?', kk: '200 санының 15%-ы қанша?' },
        answers: ['20', '25', '30', '35'],
        correct: 2,
        explanation: {
            en: '10% is 20 and 5% is 10, so total is 30.',
            ru: '10% это 20 и 5% это 10, вместе 30.',
            kk: '10% = 20 және 5% = 10, барлығы 30.'
        }
    },
    {
        subject: 'Biology',
        text: { en: 'Which organ pumps blood through the body?', ru: 'Какой орган перекачивает кровь по телу?', kk: 'Қанды бүкіл денеге айдайтын мүше қайсы?' },
        answers: ['Lungs', 'Heart', 'Liver', 'Kidney'],
        correct: 1,
        explanation: {
            en: 'The heart is the main pump of the circulatory system.',
            ru: 'Сердце — главный насос кровеносной системы.',
            kk: 'Жүрек — қанайналым жүйесінің негізгі сорғысы.'
        }
    },
    {
        subject: 'Geography',
        text: { en: 'What is the capital city of Kazakhstan?', ru: 'Столица Казахстана?', kk: 'Қазақстанның астанасы қай қала?' },
        answers: ['Almaty', 'Shymkent', 'Astana', 'Aktobe'],
        correct: 2,
        explanation: {
            en: 'Astana is the current capital of Kazakhstan.',
            ru: 'Астана — действующая столица Казахстана.',
            kk: 'Астана — Қазақстанның қазіргі астанасы.'
        }
    },
    {
        subject: 'Physics',
        text: { en: 'What is measured in Newtons (N)?', ru: 'Что измеряется в ньютонах (N)?', kk: 'Ньютонмен (N) не өлшенеді?' },
        answers: ['Speed', 'Force', 'Energy', 'Power'],
        correct: 1,
        explanation: {
            en: 'Newton is the SI unit of force.',
            ru: 'Ньютон — единица силы в системе СИ.',
            kk: 'Ньютон — күштің SI жүйесіндегі өлшем бірлігі.'
        }
    },
    {
        subject: 'Chemistry',
        text: { en: 'What is the chemical symbol for water?', ru: 'Химическая формула воды?', kk: 'Судың химиялық формуласы қандай?' },
        answers: ['CO2', 'O2', 'H2O', 'NaCl'],
        correct: 2,
        explanation: {
            en: 'Water consists of two hydrogen atoms and one oxygen atom.',
            ru: 'Вода состоит из двух атомов водорода и одного атома кислорода.',
            kk: 'Су екі сутек және бір оттек атомынан тұрады.'
        }
    },
    {
        subject: 'History',
        text: { en: 'In which century did the Renaissance begin in Europe?', ru: 'В каком веке начался Ренессанс в Европе?', kk: 'Еуропада Қайта өрлеу дәуірі қай ғасырда басталды?' },
        answers: ['10th', '14th', '18th', '20th'],
        correct: 1,
        explanation: {
            en: 'The Renaissance started in the 14th century, first in Italy.',
            ru: 'Ренессанс начался в XIV веке, сначала в Италии.',
            kk: 'Қайта өрлеу XIV ғасырда, алдымен Италияда басталды.'
        }
    },
    {
        subject: 'English',
        text: { en: 'Choose the correct form: "She ___ to school every day."', ru: 'Выберите правильную форму: "She ___ to school every day."', kk: '"She ___ to school every day." сөйлеміне дұрыс нұсқаны таңда.' },
        answers: ['go', 'goes', 'going', 'gone'],
        correct: 1,
        explanation: {
            en: 'For he/she/it in Present Simple we add -s.',
            ru: 'Для he/she/it в Present Simple добавляется -s.',
            kk: 'Present Simple-де he/she/it үшін етістікке -s жалғанады.'
        }
    },
    {
        subject: 'Mathematics',
        text: { en: 'If x + 7 = 12, what is x?', ru: 'Если x + 7 = 12, чему равен x?', kk: 'Егер x + 7 = 12 болса, x неге тең?' },
        answers: ['3', '4', '5', '6'],
        correct: 2,
        explanation: {
            en: 'Subtract 7 from both sides: x = 5.',
            ru: 'Вычитаем 7 из обеих частей: x = 5.',
            kk: 'Екі жағынан 7-ні азайтамыз: x = 5.'
        }
    },
    {
        subject: 'Computer Science',
        text: { en: 'Which of these is a programming language?', ru: 'Что из этого является языком программирования?', kk: 'Төмендегілердің қайсысы бағдарламалау тілі?' },
        answers: ['HTML', 'CPU', 'Python', 'SSD'],
        correct: 2,
        explanation: {
            en: 'Python is a high-level programming language.',
            ru: 'Python — это язык программирования высокого уровня.',
            kk: 'Python — жоғары деңгейлі бағдарламалау тілі.'
        }
    },
    {
        subject: 'Astronomy',
        text: { en: 'Which planet is known as the Red Planet?', ru: 'Какая планета известна как Красная планета?', kk: 'Қызыл ғаламшар деп қай планета аталады?' },
        answers: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correct: 1,
        explanation: {
            en: 'Mars looks red due to iron oxide on its surface.',
            ru: 'Марс выглядит красным из-за оксида железа на поверхности.',
            kk: 'Марс бетінде темір тотығы болғандықтан қызыл көрінеді.'
        }
    },
    {
        subject: 'Physics',
        text: { en: 'What is the approximate speed of light in vacuum?', ru: 'Какова приблизительная скорость света в вакууме?', kk: 'Вакуумдағы жарық жылдамдығы шамамен қанша?' },
        answers: ['300 km/s', '3,000 km/s', '30,000 km/s', '300,000 km/s'],
        correct: 3,
        explanation: {
            en: 'It is roughly 300,000 kilometers per second.',
            ru: 'Это примерно 300 000 километров в секунду.',
            kk: 'Шамамен 300 000 километр/секунд.'
        }
    },
    {
        subject: 'Geography',
        text: { en: 'Which continent has the largest land area?', ru: 'Какой континент имеет самую большую площадь?', kk: 'Қай құрлықтың жер аумағы ең үлкен?' },
        answers: ['Africa', 'North America', 'Asia', 'Europe'],
        correct: 2,
        explanation: {
            en: 'Asia is the largest continent by land area.',
            ru: 'Азия — самый большой континент по площади.',
            kk: 'Азия — жер аумағы бойынша ең үлкен құрлық.'
        }
    }
];

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const AldeaStudyQuest = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const t = uiCopy[language] || uiCopy.en;

    const [screen, setScreen] = useState('start');
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
    const [locked, setLocked] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const currentQuestion = questions[index];

    useEffect(() => {
        if (screen !== 'play' || locked) return undefined;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setLocked(true);
                    setStreak(0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [screen, locked, index]);

    const startGame = () => {
        const selected = shuffleArray(questionBank).slice(0, GAME_SIZE);
        setQuestions(selected);
        setIndex(0);
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setCorrectCount(0);
        setTimeLeft(QUESTION_TIME);
        setLocked(false);
        setSelectedAnswer(null);
        setScreen('play');
    };

    const moveNext = useMemo(
        () => () => {
            if (index >= GAME_SIZE - 1) {
                setScreen('result');
                return;
            }
            setIndex((prev) => prev + 1);
            setTimeLeft(QUESTION_TIME);
            setSelectedAnswer(null);
            setLocked(false);
        },
        [index]
    );

    const onAnswer = (answerIndex) => {
        if (!currentQuestion || locked) return;
        setSelectedAnswer(answerIndex);
        setLocked(true);

        const isCorrect = answerIndex === currentQuestion.correct;
        if (isCorrect) {
            const gained = 100 + timeLeft * 4 + streak * 10;
            setScore((prev) => prev + gained);
            setCorrectCount((prev) => prev + 1);
            setStreak((prev) => {
                const next = prev + 1;
                setBestStreak((best) => Math.max(best, next));
                return next;
            });
        } else {
            setStreak(0);
        }

        setTimeout(() => {
            moveNext();
        }, 1200);
    };

    const accuracy = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-[#090f1f] dark:via-[#0a1733] dark:to-[#0b1b3a] p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/games')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-800 text-slate-700 dark:text-slate-200 hover:border-blue-400 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t.title}</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">{t.subtitle}</p>
                        </div>
                    </div>
                </div>

                {screen === 'start' && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#12141c] rounded-[2rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-xl"
                    >
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">{t.startTitle}</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mb-8">{t.startText}</p>
                        <button
                            onClick={startGame}
                            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black flex items-center gap-2 shadow-lg shadow-blue-500/30"
                        >
                            <Target size={18} />
                            {t.startButton}
                        </button>
                    </motion.div>
                )}

                {screen === 'play' && currentQuestion && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="rounded-2xl bg-white dark:bg-[#12141c] border border-gray-100 dark:border-gray-800 p-4">
                                <div className="text-xs text-slate-400 uppercase">{t.question}</div>
                                <div className="text-2xl font-black text-slate-900 dark:text-white">{index + 1} {t.of} {GAME_SIZE}</div>
                            </div>
                            <div className="rounded-2xl bg-white dark:bg-[#12141c] border border-gray-100 dark:border-gray-800 p-4">
                                <div className="text-xs text-slate-400 uppercase">{t.score}</div>
                                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{score}</div>
                            </div>
                            <div className="rounded-2xl bg-white dark:bg-[#12141c] border border-gray-100 dark:border-gray-800 p-4">
                                <div className="text-xs text-slate-400 uppercase">{t.streak}</div>
                                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">x{streak}</div>
                            </div>
                            <div className="rounded-2xl bg-white dark:bg-[#12141c] border border-gray-100 dark:border-gray-800 p-4">
                                <div className="text-xs text-slate-400 uppercase">Timer</div>
                                <div className="text-2xl font-black text-orange-600 dark:text-orange-400 flex items-center gap-2">
                                    <Clock3 size={20} />
                                    {timeLeft}
                                    {t.seconds}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#12141c] rounded-[2rem] p-7 md:p-8 border border-gray-100 dark:border-gray-800 shadow-lg">
                            <div className="inline-flex px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs font-bold mb-4">
                                {currentQuestion.subject}
                            </div>

                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-6">
                                {currentQuestion.text[language] || currentQuestion.text.en}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {currentQuestion.answers.map((answer, answerIndex) => {
                                    const isSelected = selectedAnswer === answerIndex;
                                    const isCorrect = answerIndex === currentQuestion.correct;
                                    const showState = locked;
                                    return (
                                        <button
                                            key={answer}
                                            onClick={() => onAnswer(answerIndex)}
                                            disabled={locked}
                                            className={`text-left rounded-2xl px-5 py-4 border transition-all font-semibold ${
                                                showState && isCorrect
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300'
                                                    : showState && isSelected && !isCorrect
                                                    ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500 text-rose-700 dark:text-rose-300'
                                                    : 'bg-slate-50 dark:bg-[#0f1528] border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-400'
                                            }`}
                                        >
                                            {answer}
                                        </button>
                                    );
                                })}
                            </div>

                            {locked && selectedAnswer !== null && (
                                <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-[#0f1528] border border-slate-200 dark:border-slate-700">
                                    <div className={`font-bold mb-1 ${selectedAnswer === currentQuestion.correct ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {selectedAnswer === currentQuestion.correct ? t.correct : t.wrong}
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-400 text-sm">
                                        {currentQuestion.explanation[language] || currentQuestion.explanation.en}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {screen === 'result' && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#12141c] rounded-[2rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-xl"
                    >
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">{t.resultTitle}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                            <div className="rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-5">
                                <div className="text-sm text-blue-600 dark:text-blue-300">{t.finalScore}</div>
                                <div className="text-3xl font-black text-blue-700 dark:text-blue-200">{score}</div>
                            </div>
                            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-5">
                                <div className="text-sm text-emerald-600 dark:text-emerald-300">{t.accuracy}</div>
                                <div className="text-3xl font-black text-emerald-700 dark:text-emerald-200">{accuracy}%</div>
                            </div>
                            <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-5">
                                <div className="text-sm text-indigo-600 dark:text-indigo-300">{t.bestStreak}</div>
                                <div className="text-3xl font-black text-indigo-700 dark:text-indigo-200">x{bestStreak}</div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={startGame}
                                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} />
                                {t.playAgain}
                            </button>
                            <button
                                onClick={() => navigate('/games')}
                                className="px-7 py-4 rounded-2xl bg-slate-100 dark:bg-[#0f1528] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold"
                            >
                                Back to Games
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AldeaStudyQuest;
