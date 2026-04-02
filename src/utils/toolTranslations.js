/**
 * Tool descriptions translations
 * Format: toolId_description
 */

import { translations } from '../translations/translations';

export const getToolDescription = (toolId, language) => {
    const translationKey = `tool_${toolId}_desc`;
    const langTranslations = translations[language] || translations.en;
    
    // Check if translation exists
    if (langTranslations && langTranslations[translationKey]) {
        return langTranslations[translationKey];
    }
    
    // Return null to use fallback
    return null;
};

export const getToolName = (toolId, language) => {
    const translationKey = `tool_${toolId}_name`;
    const langTranslations = translations[language] || translations.en;
    
    if (langTranslations && langTranslations[translationKey]) {
        return langTranslations[translationKey];
    }
    
    return null;
};
