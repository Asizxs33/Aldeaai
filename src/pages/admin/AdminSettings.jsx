import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation } from '../../translations/translations';
import { Settings, Save, Globe, Bell, Shield, Palette, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSettings = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [saved, setSaved] = useState(false);

    const [settings, setSettings] = useState({
        siteName: 'Aldea AI',
        defaultLanguage: 'kk',
        registrationEnabled: true,
        emailVerification: false,
        maxGenerationsPerDay: 50,
        maintenanceMode: false,
    });

    useEffect(() => {
        if (user && user.role?.toLowerCase() !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSave = () => {
        // In real app, this would call an API
        localStorage.setItem('admin_settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (user?.role?.toLowerCase() !== 'admin') return null;

    return (
        <div className="max-w-4xl mx-auto pb-12 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                        <Settings className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                            {getTranslation(language, 'adminSettings') || 'Settings'}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            Платформа баптаулары
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                    {saved ? <CheckCircle size={20} /> : <Save size={20} />}
                    {saved ? 'Сақталды!' : 'Сақтау'}
                </button>
            </div>

            <div className="space-y-6">
                {/* General Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#12141c] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-lg"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Globe className="text-blue-500" size={24} />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Жалпы баптаулар</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Сайт атауы
                            </label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Әдепкі тіл
                            </label>
                            <select
                                value={settings.defaultLanguage}
                                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="kk">Қазақша</option>
                                <option value="ru">Русский</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Күніне генерация лимиті
                            </label>
                            <input
                                type="number"
                                value={settings.maxGenerationsPerDay}
                                onChange={(e) => setSettings({ ...settings, maxGenerationsPerDay: parseInt(e.target.value) })}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Security Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-[#12141c] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-lg"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="text-green-500" size={24} />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Қауіпсіздік</h3>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl cursor-pointer">
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Тіркелуді қосу</div>
                                <div className="text-sm text-gray-500">Жаңа пайдаланушылар тіркеле алады</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.registrationEnabled}
                                onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
                                className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl cursor-pointer">
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Email верификациясы</div>
                                <div className="text-sm text-gray-500">Тіркелу кезінде email тексеру керек</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.emailVerification}
                                onChange={(e) => setSettings({ ...settings, emailVerification: e.target.checked })}
                                className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"
                            />
                        </label>
                    </div>
                </motion.div>

                {/* Maintenance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-[#12141c] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-lg"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className="text-amber-500" size={24} />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Қызмет көрсету</h3>
                    </div>

                    <label className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl cursor-pointer border border-red-200 dark:border-red-800">
                        <div>
                            <div className="font-medium text-red-600 dark:text-red-400">Техникалық жұмыс режимі</div>
                            <div className="text-sm text-red-500 dark:text-red-400/80">Сайт уақытша қолжетімсіз болады</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                            className="w-5 h-5 rounded text-red-500 focus:ring-red-500"
                        />
                    </label>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminSettings;
