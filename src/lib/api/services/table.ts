import type { ApiError, TableMeta, TableListResponse } from '../types';
import { fetchApi, isResponseError } from '../utils';
import { resolveApiConfig } from '../config';

export class TableService {

    async listMyTables(limit = 100, offset = 0): Promise<TableListResponse | ApiError> {
        const res = await fetchApi<TableListResponse>(`/users/@me/tables?limit=${limit}&offset=${offset}`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    /**
     * Fetch raw content of a table entry.
     * For JSON MIME tables, returns parsed JS value.
     * Returns ApiError if the table doesn't exist or request fails.
     */
    async getMyTable(key: string): Promise<unknown | ApiError> {
        const config = await resolveApiConfig();
        try {
            const res = await fetch(new URL(`users/@me/tables/${encodeURIComponent(key)}`, config.baseUrl), {
                credentials: 'include',
            });
            if (!res.ok) {
                let err: any;
                try { err = await res.json(); } catch { err = {}; }
                return { status: res.status, code: err?.error?.code ?? -1, message: err?.error?.message ?? res.statusText } as ApiError;
            }
            const ct = res.headers.get('content-type') ?? '';
            if (ct.includes('application/json')) return res.json();
            return res.blob();
        } catch {
            return { status: 500, code: -1, message: 'An error occurred.' } as ApiError;
        }
    }

    /**
     * Create or update a JSON table entry.
     * Serializes `content` to JSON and posts with the specified MIME type.
     * Returns null on success, ApiError on failure.
     */
    async setMyTable(key: string, content: unknown, mime = 'application/json'): Promise<ApiError | null> {
        const config = await resolveApiConfig();
        try {
            const body = JSON.stringify(content);
            const res = await fetch(new URL(`users/@me/tables/${encodeURIComponent(key)}`, config.baseUrl), {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': mime },
                body,
            });
            if (!res.ok) {
                let err: any;
                try { err = await res.json(); } catch { err = {}; }
                return { status: res.status, code: err?.error?.code ?? -1, message: err?.error?.message ?? res.statusText };
            }
            return null;
        } catch {
            return { status: 500, code: -1, message: 'An error occurred.' };
        }
    }

    async deleteMyTable(key: string): Promise<ApiError | null> {
        const res = await fetchApi(`/users/@me/tables/${encodeURIComponent(key)}`, { method: 'DELETE' });
        if (isResponseError(res)) return res.error;
        return null;
    }
}
