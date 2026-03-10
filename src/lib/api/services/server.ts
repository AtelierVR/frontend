import type { ApiError } from '../types';
import { fetchApi, isResponseError } from '../utils';

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
}

export class ServerService {
    async fetchServerInfo(): Promise<ServerInfo | ApiError> {
        const res = await fetchApi<ServerInfo>('/api/server');
        if (isResponseError(res)) return res.error;
        return res.data;
    }
}
