// Simplified translations helper for components
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';

export const useTranslations = () => {
    const { language } = useLanguage();
    const t = (key) => getTranslation(language, key);
    return { t, language };
};
