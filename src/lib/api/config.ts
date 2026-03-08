/**
 * API Configuration
 */
export const API_CONFIG = {
    baseUrl: new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').toString().replace(/\/$/, ''),
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://127.3.2.1:53032/api/ws',
} as const;

export const APP_CONFIG = {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Nox',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Nox Documentation',
} as const;

export default API_CONFIG;
