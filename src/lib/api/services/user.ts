import type { User, CurrentUser, UpdateUser, ApiError } from '../types';
import { fetchApi, isResponseError } from '../utils';
import { resolveApiConfig } from '../config';

export class UserService {
    async fetchCurrentUser(): Promise<CurrentUser | ApiError> {
        let res = await fetchApi<CurrentUser>("/api/users/@me");
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async fetchUser(id: number | string, server?: string): Promise<User | ApiError> {
        let res = await fetchApi<User>(`/api/users/${id}${server ? `@${server}` : ""}`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async updateUser(
        data: UpdateUser,
        factor_code?: string,
        onVerificationRequired?: (error: any, methods: any[]) => Promise<string | null>
    ): Promise<CurrentUser | ApiError> {
        let res = await fetchApi<CurrentUser>("/api/users/@me", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...data,
                factor_code: factor_code
            })
        }, onVerificationRequired);

        if (isResponseError(res)) return res.error;
        return res.data;
    }

    private async _uploadFile(endpoint: string, file: Blob): Promise<{ url: URL } | ApiError> {
        const config = await resolveApiConfig();
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(new URL(endpoint, config.baseUrl), {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            if (!res.ok) {
                let err: any;
                try { err = await res.json(); } catch { err = {}; }
                return { status: res.status, code: err?.error?.code ?? -1, message: err?.error?.message ?? res.statusText };
            }
            return { url: new URL(res.url) };
        } catch (e) {
            return {
                status: 500,
                code: -1,
                message: "An error occurred. Please try again later."
            };
        }
    }

    async uploadThumbnail(file: Blob): Promise<{ url: URL } | ApiError> {
        return this._uploadFile("/api/users/@me/thumbnail", file);
    }

    async uploadBanner(file: Blob): Promise<{ url: URL } | ApiError> {
        return this._uploadFile("/api/users/@me/banner", file);
    }
}
