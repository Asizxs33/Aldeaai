// API base URL: empty in dev (Vite proxy handles /api/*), Render URL in production
export const API_BASE = import.meta.env.VITE_API_URL || '';
