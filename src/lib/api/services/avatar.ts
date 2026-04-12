import type { Avatar, AvatarsResponse, AvatarAssetsResponse, UpdateAvatar, ApiError } from '../types';
import { fetchApi, isResponseError } from '../utils';
import { resolveApiConfig } from '../config';

export class AvatarService {
    async fetchAvatar(id: number | string, server?: string): Promise<Avatar | ApiError> {
        const res = await fetchApi<Avatar>(`/avatars/${id}${server ? `@${server}` : ''}`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async fetchAvatars(limit = 20, offset = 0): Promise<AvatarsResponse | ApiError> {
        const res = await fetchApi<AvatarsResponse>(`/avatars?limit=${limit}&offset=${offset}`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async fetchAvatarAssets(id: number | string, server?: string, version?: number): Promise<AvatarAssetsResponse | ApiError> {
        const qs = new URLSearchParams();
        if (version !== undefined && version >= 0) qs.set('version', String(version));
        const query = qs.toString() ? `?${qs.toString()}` : '';
        const res = await fetchApi<AvatarAssetsResponse>(`/avatars/${id}${server ? `@${server}` : ''}/assets${query}`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async updateAvatar(id: number | string, server: string | undefined, data: UpdateAvatar): Promise<Avatar | ApiError> {
        const res = await fetchApi<Avatar>(`/avatars/${id}${server ? `@${server}` : ''}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async uploadAvatarThumbnail(id: number | string, server: string | undefined, file: Blob): Promise<{ url: URL } | ApiError> {
        const config = await resolveApiConfig();
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(new URL(`avatars/${id}${server ? `@${server}` : ''}/thumbnail`, config.baseUrl), {
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
