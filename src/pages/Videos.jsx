import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { PlayCircle } from 'lucide-react';

const Videos = () => {
    const { language } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center">
                    <PlayCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {getTranslation(language, 'videoExplainers')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Educational video library</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="text-center py-12">
                    <PlayCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Video Library Coming Soon
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Educational video content is under development
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Videos;
