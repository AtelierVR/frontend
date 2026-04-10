/**
 * API Configuration — resolved lazily from the well-known endpoint.
 *
 * Call `resolveApiConfig()` before making any API or WebSocket request.
 * Call `resolveWellKnown()` to get the full well-known document.
 * Both results are cached after the first successful fetch.
 */

const WK_URL = process.env.NEXT_PUBLIC_WK_URL || 'http://localhost:8080/.well-known/nox';

export interface NoxWellKnownGateway {
    web: string;
    ws: string;
    api: string;
}

export interface NoxWellKnownMetadata {
    title: string;
    description: string | null;
    icon: string | null;
    contact: string | null;
    [key: string]: string | null;
}

export interface NoxWellKnownEndpoints {
    wellknown: string;
    webfinger: string;
    nodeinfo: string;
    hostmeta: string;
    terms: string;
    privacy: string;
    rules: string;
    [key: string]: string;
}

export interface NoxWellKnownSoftware {
    name: string;
    version: string;
    repository: string | null;
}

export interface NoxWellKnown {
    id: string;
    address: string;
    port: number;
    status: 'online' | 'maintenance' | 'degraded';
    started: number;
    features: string[];
    gateway: NoxWellKnownGateway;
    metadata: NoxWellKnownMetadata;
    endpoints: NoxWellKnownEndpoints;
    software: NoxWellKnownSoftware;
}

export interface ResolvedApiConfig {
    baseUrl: string;
    wsUrl: string;
}

let _wk: NoxWellKnown | null = null;
let _wkPending: Promise<NoxWellKnown | null> | null = null;

function fetchWellKnown(): Promise<NoxWellKnown | null> {
    if (_wk) return Promise.resolve(_wk);
    if (_wkPending) return _wkPending;

    console.debug(`Fetching well-known document from ${WK_URL}...`);
    _wkPending = fetch(WK_URL)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json() as Promise<NoxWellKnown>;
        })
        .then(data => {
            _wk = data;
            _wkPending = null;
            return _wk;
        })
        .catch(() => {
            _wkPending = null;
            return null;
        });

    return _wkPending;
}

export async function resolveWellKnown(): Promise<NoxWellKnown | null> {
    return fetchWellKnown();
}

export async function resolveApiConfig(): Promise<ResolvedApiConfig> {
    const wk = await fetchWellKnown();
    if (wk) return {
        baseUrl: wk.gateway.api,
        wsUrl: wk.gateway.ws,
    };

    // Fallback: derive from well-known URL origin
    console.warn('Failed to fetch well-known document, falling back to origin-based API config');
    const origin = new URL(WK_URL).origin;
    let baseUrl = new URL('/api/', origin);
    const wsUrl = new URL('/api/ws', baseUrl);
    wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    return {
        baseUrl: baseUrl.href,
        wsUrl: wsUrl.href,
    };
}

export const APP_CONFIG = {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Nox',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Nox Documentation',
} as const;
