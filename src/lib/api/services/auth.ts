import type { CurrentUser, RegisterForm, ApiError, Auth, Logout } from '../types';
import { fetchApi, isResponseError } from '../utils';

export class AuthService {
    async login(
        identifier: string | number,
        password: string,
        factor_code?: string,
        onVerificationRequired?: (error: any, methods: any[]) => Promise<string | null>
    ): Promise<CurrentUser | ApiError> {
        let res = await fetchApi<Auth>("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                identifier: identifier,
                password: password,
                factor_code: factor_code
            })
        }, onVerificationRequired);
        
        if (isResponseError(res)) return res.error;
        
        // Save token and expiration date to localStorage
        const token = res.data.token;
        const expires = res.data.expires;
        localStorage.setItem("nox.token", token);
        localStorage.setItem("nox.token_expires", expires);
        
        return res.data.user;
    }

    async logout(): Promise<boolean | ApiError> {
        let res = await fetchApi<Logout>("/api/auth/logout");
        if (isResponseError(res)) return res.error;
        
        // Remove token and expiration date from localStorage
        localStorage.removeItem("nox.token");
        localStorage.removeItem("nox.token_expires");
        
        return true;
    }

    async register(data: RegisterForm): Promise<CurrentUser | ApiError> {
        let res = await fetchApi<Auth>("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: data.username,
                display: data.display || undefined,
                password: data.password,
            })
        });
        
        if (isResponseError(res)) return res.error;
        
        // Save token and expiration date to localStorage
        const token = res.data.token;
        const expires = res.data.expires;
        localStorage.setItem("nox.token", token);
        localStorage.setItem("nox.token_expires", expires);
        
        return res.data.user;
    }
}
