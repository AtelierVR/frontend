import type { World, WorldsResponse, ApiError } from '../types';
import { fetchApi, isResponseError } from '../utils';

export class WorldService {
    async fetchWorld(id: number | string, server?: string): Promise<World | ApiError> {
        const res = await fetchApi<World>(`/api/worlds/${id}${server ? `@${server}` : ''}`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async fetchWorlds(limit = 20, offset = 0): Promise<WorldsResponse | ApiError> {
        const res = await fetchApi<WorldsResponse>(`/api/worlds?limit=${limit}&offset=${offset}`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }
}
