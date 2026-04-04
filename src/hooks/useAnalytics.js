// Analytics tracking hook
// Usage: const { trackEvent } = useAnalytics();
//        trackEvent('presentation_created', { topic: 'Math' });

import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../utils/api';

export const useAnalytics = () => {
    const { user } = useAuth();

    const trackEvent = async (eventType, eventData = null) => {
        try {
            await fetch(`${API_BASE}/api/analytics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    eventType,
                    eventData
                })
            });
        } catch (err) {
            console.error('Analytics tracking error:', err);
        }
    };

    return { trackEvent };
};

// Standalone function for use outside React components
export const trackAnalyticsEvent = async (eventType, eventData = null, userId = null) => {
    try {
        await fetch(`${API_BASE}/api/analytics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, eventType, eventData })
        });
    } catch (err) {
        console.error('Analytics tracking error:', err);
    }
};

// Event type constants
export const ANALYTICS_EVENTS = {
    // Auth
    USER_LOGIN: 'user_login',
    USER_REGISTER: 'user_register',

    // Content Creation
    PRESENTATION_CREATED: 'presentation_created',
    TEST_GENERATED: 'test_generated',
    LESSON_PLAN_CREATED: 'lesson_plan_created',

    // AI Features
    BOT_MESSAGE_SENT: 'bot_message_sent',
    AI_TOOL_USED: 'ai_tool_used',
    TULGA_VIDEO_CREATED: 'tulga_video_created',

    // Games
    GAME_PLAYED: 'game_played',
    GAME_CREATED: 'game_created',

    // Resources
    TEXTBOOK_VIEWED: 'textbook_viewed',
    VIDEO_WATCHED: 'video_watched',

    // Other
    PAGE_VIEW: 'page_view',
    FEEDBACK_SUBMITTED: 'feedback_submitted',
};
