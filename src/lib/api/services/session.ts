import { fetchApi, isResponseError } from '../utils';
import type { ApiError, IRSession, MultiResponse } from '../types';

export class SessionService {
  async fetchMySessions(
    limit?: number,
    offset?: number
  ): Promise<(MultiResponse & { sessions: IRSession[] }) | ApiError> {
    let url = `/users/@me/sessions`;
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (offset) params.set('offset', offset.toString());
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetchApi<MultiResponse & { sessions: IRSession[] }>(url);
    if (isResponseError(res)) return res.error;
    return res.data;
  }

  async fetchCurrentSession(): Promise<IRSession | ApiError> {
    const res = await fetchApi<IRSession>(`/users/@me/session`);
    if (isResponseError(res)) return res.error;
    return res.data;
  }

  async deleteMySession(id: string): Promise<{ success: boolean; logout: boolean } | ApiError> {
    const res = await fetchApi<{ success: boolean; logout: boolean }>(
      `/users/@me/sessions/${id}`,
      { method: 'DELETE' }
    );
    if (isResponseError(res)) return res.error;
    return res.data;
  }

  async deleteMySessions(): Promise<{ success: boolean; logout: boolean } | ApiError> {
    const res = await fetchApi<{ success: boolean; logout: boolean }>(
      `/users/@me/sessions`,
      { method: 'DELETE' }
    );
    if (isResponseError(res)) return res.error;
    return res.data;
  }
}
