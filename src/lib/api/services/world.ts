import type { World, WorldsResponse, WorldAssetsResponse, UpdateWorld, ApiError } from '../types';
import { fetchApi, isResponseError } from '../utils';
import { resolveApiConfig } from '../config';

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

    async updateWorld(id: number | string, server: string | undefined, data: UpdateWorld): Promise<World | ApiError> {
        const res = await fetchApi<World>(`/api/worlds/${id}${server ? `@${server}` : ''}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async uploadWorldThumbnail(id: number | string, server: string | undefined, file: Blob): Promise<{ url: URL } | ApiError> {
        const config = await resolveApiConfig();
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(new URL(`/api/worlds/${id}${server ? `@${server}` : ''}/thumbnail`, config.baseUrl), {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            if (!res.ok) {
                let err: any;
                try { err = await res.json(); } catch { err = {}; }
                return { status: res.status, code: err?.error?.code ?? -1, message: err?.error?.message ?? res.statusText };
            }
            return { url: new URL(res.url) };
        } catch {
            return { status: 500, code: -1, message: 'An error occurred. Please try again later.' };
        }
    }
}
