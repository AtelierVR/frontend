import type { ApiError, Response } from '../types';
import { API_CONFIG } from '../config';

export function isError(result: any): result is ApiError {
    return typeof result === 'object' && 'status' in result && 'code' in result && 'message' in result;
}

export function isResponseError<T>(res: Response<T>): res is { data: null; error: ApiError } {
    return res.data === null && res.error !== null;
}

export function getSIDById(id: number | string, server?: string): string {
    return server ? `${id}@${server}` : String(id);
}

export function getSIDByUser(user: { id: number | string; server?: string }): string {
    return getSIDById(user.id, user.server);
}

export function getPairIdBySID(sid: string): { id: string; server?: string } {
    const [id, server] = sid.split('@');
    return { id, server };
}

export async function fetchApi<T = unknown>(
    url: string,
    options: RequestInit = {},
    onVerificationRequired?: any
): Promise<Response<T>> {
    try {
        let res = await fetch(new URL(url, API_CONFIG.baseUrl), {
            ...options,
            credentials: 'include',
            headers: {
                ...(options.headers || {}),
                ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
            },
        });

        if (res.headers.get("content-type")?.includes("application/json")) {
            let data = await res.json();
            if (!res.ok) {
                // Check if this is a verification required error (HTTP 428)
                if (res.status === 428 && data.error?.code === 20 && onVerificationRequired) {
                    const methods = data.data?.methods || [];
                    const code = await onVerificationRequired(data.error, methods);

                    if (code) {
                        // Retry the request with the verification code
                        const bodyData = options.body ? JSON.parse(options.body as string) : {};
                        bodyData.factor_code = code;
                        return fetchApi(url, {
                            ...options,
                            body: JSON.stringify(bodyData),
                        });
                    }
                }
                return { error: data.error, data: null };
            }
            return { data: data.data, error: null };
        } else {
            if (!res.ok)
                return { error: { status: res.status, code: -1, message: "An error occurred. Please try again later." }, data: null };
            let data = await res.blob();
            return { data: data as T, error: null };
        }
    } catch (e) {
        console.error(e);
        return {
            data: null,
            error: {
                message: "An error occurred. Please try again later.",
                status: 500,
                code: -1
            }
        };
    }
}
