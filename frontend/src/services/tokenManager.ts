// Token state stored in closure
let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshTimer: NodeJS.Timeout | null = null;

// Pure functions for token operations
const loadTokens = (): void => {
    try {
        const stored = sessionStorage.getItem('soundbyte_tokens');
        if (stored) {
            const tokens = JSON.parse(stored);
            accessToken = tokens.accessToken;
            refreshToken = tokens.refreshToken;
            scheduleRefresh();
        }
    } catch (error) {
        console.error('Error loading tokens:', error);
    }
};

const saveTokens = (): void => {
    try {
        if (accessToken && refreshToken) {
            sessionStorage.setItem('soundbyte_tokens', JSON.stringify({
                accessToken,
                refreshToken
            }));
        }
    } catch (error) {
        console.error('Error saving tokens:', error);
    }
};

const scheduleRefresh = (): void => {
    if (refreshTimer) {
        clearTimeout(refreshTimer);
    }
    refreshTimer = setTimeout(() => {
        refreshAccessToken();
    }, 14 * 60 * 1000); // 14 minutes
};

// Public API functions
export const setTokens = (newAccessToken: string, newRefreshToken: string): void => {
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
    saveTokens();
    scheduleRefresh();
};

export const getAccessToken = (): string | null => accessToken;

export const getRefreshToken = (): string | null => refreshToken;

export const clearTokens = (): void => {
    accessToken = null;
    refreshToken = null;
    sessionStorage.removeItem('soundbyte_tokens');
    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }
};

export const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken) {
        return false;
    }

    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`
            },
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.accessToken && data.refreshToken) {
                setTokens(data.accessToken, data.refreshToken);
                return true;
            }
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
    }

    clearTokens();
    return false;
};

export const hasTokens = (): boolean => !!(accessToken && refreshToken);

// Initialize on module load
loadTokens();

// Export all functions as a namespace object for convenience
export const tokenManager = {
    setTokens,
    getAccessToken,
    getRefreshToken,
    clearTokens,
    refreshAccessToken,
    hasTokens
};