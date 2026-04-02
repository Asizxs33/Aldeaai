import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Download } from 'lucide-react';
import { textbooks } from '../data/textbooks';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';

const TextbookReader = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage();

    const book = textbooks.find(b => b.id === id);

    const getBookContentUrl = (book) => {
        if (!book) return '';
        // Fix for Okulyk.kz books to load PDF directly instead of the webpage
        if (book.source === 'Okulyk.kz' && book.coverUrl?.includes('books.okulyk.kz')) {
            return book.coverUrl.replace('.jpg', '.pdf');
        }
        return book.fileUrl;
    };

    const contentUrl = getBookContentUrl(book);

    if (!book) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold mb-4">{getTranslation(language, 'bookNotFound')}</h2>
                <button
                    onClick={() => navigate('/resources')}
                    className="text-blue-500 hover:underline"
                >
                    {getTranslation(language, 'returnToLibrary')}
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-[#12141c] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#12141c]">
                <button
                    onClick={() => navigate('/resources')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">{getTranslation(language, 'back')}</span>
                </button>

                <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-xl">
                    {book.title}
                </h1>

                <div className="flex items-center gap-4">
                    <a
                        href={contentUrl}
                        download
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        <Download size={16} />
                        <span>{getTranslation(language, 'download')}</span>
                    </a>
                </div>
            </div>

            {/* Iframe Content */}
            <div className="flex-1 w-full bg-gray-100 relative">
                <iframe
                    src={contentUrl}
                    title={book.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                />
            </div>
        </div>
    );
};

export default TextbookReader;
