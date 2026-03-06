import type { User, CurrentUser, UpdateUser, ApiError } from '../types';
import { fetchApi, isResponseError } from '../utils';
import { API_CONFIG } from '../config';

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

    async uploadThumbnail(file: Blob): Promise<URL | ApiError> {
        let formData = new FormData();
        formData.append("file", file);
        let res = await fetchApi<Blob>("/api/users/@me/thumbnail", {
            method: "POST",
            body: formData
        });
        
        if (isResponseError(res)) return res.error;
        return new URL(`/api/users/@me/thumbnail`, API_CONFIG.baseUrl);
    }

    async uploadBanner(file: Blob): Promise<URL | ApiError> {
        let formData = new FormData();
        formData.append("file", file);
        let res = await fetchApi<Blob>("/api/users/@me/banner", {
            method: "POST",
            body: formData
        });
        
        if (isResponseError(res)) return res.error;
        return new URL(`/api/users/@me/banner`, API_CONFIG.baseUrl);
    }
}
