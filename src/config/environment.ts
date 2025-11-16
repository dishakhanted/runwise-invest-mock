// Environment configuration for test vs production mode
export const ENV_MODE = import.meta.env.VITE_ENV_MODE || 'test';

export const isTestMode = () => ENV_MODE === 'test';
export const isProductionMode = () => ENV_MODE === 'production';

// Mock data flag - when true, uses AI-like mock responses instead of real AI calls
export const useMockData = isTestMode();
