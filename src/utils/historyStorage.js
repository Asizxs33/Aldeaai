
const STORAGE_KEY = 'aldea_history';

export const getHistory = () => {
    try {
        const history = localStorage.getItem(STORAGE_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error reading history:', error);
        return [];
    }
};

export const saveHistoryItem = (item) => {
    try {
        const history = getHistory();
        const newItem = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            ...item
        };
        const updatedHistory = [newItem, ...history];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
        return newItem;
    } catch (error) {
        console.error('Error saving history item:', error);
        return null;
    }
};

export const clearHistory = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing history:', error);
        return false;
    }
};

export const deleteHistoryItem = (id) => {
    try {
        const history = getHistory();
        const updatedHistory = history.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
    } catch (error) {
        console.error('Error deleting history item:', error);
        return null;
    }
};
