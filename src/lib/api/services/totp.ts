import type { ApiError } from '../types';
import { fetchApi, isResponseError } from '../utils';

export interface TotpSetupResult {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
}

export interface TotpEnableResult {
    enabled: boolean;
    message: string;
}

export interface TotpDisableResult {
    disabled: boolean;
    message: string;
}

export class TotpService {
    async setup(): Promise<TotpSetupResult | ApiError> {
        const res = await fetchApi<TotpSetupResult>('/api/auth/totp/setup', { method: 'POST' });
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async enable(secret: string, token: string): Promise<TotpEnableResult | ApiError> {
        const res = await fetchApi<TotpEnableResult>('/api/auth/totp/enable', {
            method: 'POST',
            body: JSON.stringify({ secret, token }),
        });
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async disable(
        factor_code?: string,
        onVerificationRequired?: (error: any, methods: any[]) => Promise<string | null>
    ): Promise<TotpDisableResult | ApiError> {
        const res = await fetchApi<TotpDisableResult>('/api/auth/totp/disable', {
            method: 'POST',
            body: JSON.stringify({ factor_code }),
        }, onVerificationRequired);
        if (isResponseError(res)) return res.error;
        return res.data;
    }
}
