import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { Book, Search, Filter, Download, ExternalLink, Library, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { textbooks } from '../data/textbooks';

const Resources = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const getBookContentUrl = (book) => {
        if (!book) return '';
        if (book.source === 'Okulyk.kz' && book.coverUrl?.includes('books.okulyk.kz')) {
            return book.coverUrl.replace('.jpg', '.pdf');
        }
        return book.fileUrl;
    };

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedGrade, selectedSubject, selectedLanguage, searchQuery]);

    const filteredBooks = textbooks.filter(book => {
        const matchGrade = selectedGrade ? book.grade === selectedGrade : true;
        const matchSubject = selectedSubject ? book.subject === selectedSubject : true;
        const matchLanguage = selectedLanguage ? book.language === selectedLanguage : true;
        const matchSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchGrade && matchSubject && matchSearch && matchLanguage;
    });

    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    const paginatedBooks = filteredBooks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const subjects = ['mathematics', 'physics', 'chemistry', 'biology', 'history', 'geography', 'english', 'informatics', 'kazakh_language'];
    const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
    const languages = [
        { code: 'kk', label: 'Қазақша' },
        { code: 'ru', label: 'Русский' }
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Book className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {getTranslation(language, 'textbooksTitle')}
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        {getTranslation(language, 'textbooksDesc')}
                    </p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-[#12141c] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={getTranslation(language, 'searchBook')}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Language Filter */}
                    <div className="relative">
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white cursor-pointer"
                        >
                            <option value="">{getTranslation(language, 'selectLanguage') || 'Язык / Tili'}</option>
                            {languages.map(l => (
                                <option key={l.code} value={l.code}>{l.label}</option>
                            ))}
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>

                    {/* Grade Filter */}
                    <div className="relative">
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white cursor-pointer"
                        >
                            <option value="">{getTranslation(language, 'selectGrade')}</option>
                            {grades.map(g => (
                                <option key={g} value={g}>{g}-sy-nyp</option>
                            ))}
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>

                    {/* Subject Filter */}
                    <div className="relative">
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white cursor-pointer"
                        >
                            <option value="">{getTranslation(language, 'selectSubject')}</option>
                            {subjects.map(s => (
                                <option key={s} value={s}>{getTranslation(language, s)}</option>
                            ))}
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
                {paginatedBooks.length > 0 ? (
                    paginatedBooks.map((book) => (
                        <motion.div
                            key={book.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-[#12141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full"
                        >
                            {/* Book Cover */}
                            <div className="aspect-[3/4] rounded-xl bg-gray-100 dark:bg-gray-800 mb-4 overflow-hidden relative shadow-md">
                                <img
                                    src={book.coverUrl}
                                    alt={book.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/300x400?text=No+Cover';
                                    }}
                                />
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg">
                                    {book.language === 'kk' ? 'KAZ' : 'RUS'}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 text-sm leading-tight h-10">{book.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">{book.author}</p>

                                <div className="mt-auto flex flex-col gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/resources/read/${book.id}`);
                                        }}
                                        className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <BookOpen size={16} />
                                        {getTranslation(language, 'readOnline')}
                                    </button>

                                    <a
                                        href={getBookContentUrl(book)}
                                        download
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download size={14} />
                                        {getTranslation(language, 'download')}
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Library size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{getTranslation(language, 'noBooksFound') || 'Книги не найдены'}</h3>
                        <p className="text-gray-500">{getTranslation(language, 'adjustFilters') || 'Попробуйте изменить фильтры'}</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                    >
                        Prev
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Resources;
