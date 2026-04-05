import type { ApiError } from '../types';
import { fetchApi, isResponseError } from '../utils';
import { resolveWellKnown } from '../config';

export interface ServerStatistics {
    users: number;
    active_users: number;
    connected_users: number;
    worlds: number;
    avatars: number;
    instances: number;
    live_instances: number;
    live_clients: number;
    live_players: number;
}

export interface ServerInfo {
    id: string;
    title: string;
    description: string;
    address: string;
    features: string[];
    version: string;
    icon?: string;
    gateway: {
        http: string;
        ws: string;
        web: string;
    };
    statistics?: ServerStatistics;
}

export class ServerService {
    async fetchServerInfo(): Promise<ServerInfo | ApiError> {
        const wk = await resolveWellKnown();
        if (!wk) return { status: 503, code: -1, message: 'Well-known unavailable' };

        const base: ServerInfo = {
            id: wk.id,
            title: wk.metadata.title,
            description: wk.metadata.description ?? '',
            address: wk.address,
            features: wk.features,
            version: wk.software.version,
            icon: wk.metadata.icon ?? undefined,
            gateway: {
                http: wk.gateway.api,
                ws: wk.gateway.ws,
                web: wk.gateway.web,
            },
        };

        // Statistics not yet available from well-known — leave undefined
        return base;
    }
}
