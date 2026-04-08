import type { World, WorldsResponse, WorldAssetsResponse, ApiError } from '../types';
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

    async fetchWorldAssets(id: number | string, server?: string, version?: number): Promise<WorldAssetsResponse | ApiError> {
        const qs = new URLSearchParams();
        if (version !== undefined && version >= 0) qs.set('version', String(version));
        const query = qs.toString() ? `?${qs.toString()}` : '';
        const res = await fetchApi<WorldAssetsResponse>(`/api/worlds/${id}${server ? `@${server}` : ''}/assets${query}`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }
}
