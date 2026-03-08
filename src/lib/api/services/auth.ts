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
        
        return res.data.user;
    }

    async logout(): Promise<boolean | ApiError> {
        let res = await fetchApi<Logout>("/api/auth/logout");
        if (isResponseError(res)) return res.error;
        
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
        
        return res.data.user;
    }
}
