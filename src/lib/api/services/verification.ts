import type { SendVerificationCodeResponse, ApiError } from '../types';
import { fetchApi, isResponseError } from '../utils';
import { API_CONFIG } from '../config';

export class VerificationService {
    async sendVerificationCode(type: string): Promise<SendVerificationCodeResponse | ApiError> {
        let res = await fetchApi<SendVerificationCodeResponse>(`/api/auth/${type}/send`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }
}
