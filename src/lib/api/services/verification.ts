import type { SendVerificationCodeResponse, ApiError } from '../types';
import { fetchApi, isResponseError } from '../utils';

export class VerificationService {
    async sendVerificationCode(type: string, data: Record<string, any>): Promise<SendVerificationCodeResponse | ApiError> {
        let res = await fetchApi<SendVerificationCodeResponse>(`/api/auth/${type}/send`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (isResponseError(res)) return res.error;
        return res.data;
    }
}
