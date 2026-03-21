import type { ApiError } from '../types';
import { fetchApi, isResponseError } from '../utils';

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
        const res = await fetchApi<ServerInfo>('/api/server');
        if (isResponseError(res)) return res.error;
        return res.data;
    }
}
