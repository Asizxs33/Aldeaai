import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { Image as ImageIcon } from 'lucide-react';

const Visuals = () => {
    const { language } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {getTranslation(language, 'visuals')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Visual learning materials</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Visual Library Coming Soon
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Visual learning resources are under development
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Visuals;
