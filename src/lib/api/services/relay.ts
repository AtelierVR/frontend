import { fetchApi, isResponseError } from '../utils';
import type { RelayDetails, RelayLog, RelayInstancesResult, RelayClientsResult, RelayPlayersResult, ApiError } from '../types';

export class RelayService {
    async fetchRelays(): Promise<RelayDetails[] | ApiError> {
        const res = await fetchApi<RelayDetails[]>('/api/relays');
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async fetchRelay(id: number): Promise<RelayDetails | ApiError> {
        const res = await fetchApi<RelayDetails>(`/api/relays/${id}`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async fetchRelayLogs(id: number, since?: number, limit: number = 100): Promise<RelayLog[] | ApiError> {
        const params = new URLSearchParams();
        if (since) params.append('since', since.toString());
        params.append('limit', limit.toString());
        const url = `/api/relays/${id}/logs${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await fetchApi<RelayLog[]>(url);
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async sendRelayCommand(id: number, command: string): Promise<{ success: boolean } | ApiError> {
        const res = await fetchApi<{ success: boolean }>(`/api/relays/${id}/logs`, {
            method: 'PUT',
            body: JSON.stringify({ content: command }),
        });
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async fetchRelayInstances(id: number, limit: number = 100, offset: number = 0): Promise<RelayInstancesResult | ApiError> {
        const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
        const res = await fetchApi<RelayInstancesResult>(`/api/relays/${id}/instances?${params}`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async fetchRelayClients(id: number, limit: number = 100, offset: number = 0): Promise<RelayClientsResult | ApiError> {
        const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
        const res = await fetchApi<RelayClientsResult>(`/api/relays/${id}/clients?${params}`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async fetchInstancePlayers(id: number, iid: string): Promise<RelayPlayersResult | ApiError> {
        const res = await fetchApi<RelayPlayersResult>(`/api/relays/${id}/instances/${iid}/players`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async createRelay(data: { name: string; host: string; port: number }): Promise<RelayDetails | ApiError> {
        const res = await fetchApi<RelayDetails>('/api/relays', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async updateRelay(id: number, data: Partial<{ name: string; host: string; port: number; enabled: boolean }>): Promise<RelayDetails | ApiError> {
        const res = await fetchApi<RelayDetails>(`/api/relays/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async deleteRelay(id: number): Promise<{ success: boolean } | ApiError> {
        const res = await fetchApi<{ success: boolean }>(`/api/relays/${id}`, {
            method: 'DELETE',
        });
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async stopRelay(id: number): Promise<{ success: boolean } | ApiError> {
        const res = await fetchApi<{ success: boolean }>(`/api/relays/${id}/stop`, {
            method: 'POST',
        });
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async restartRelay(id: number): Promise<{ success: boolean } | ApiError> {
        const res = await fetchApi<{ success: boolean }>(`/api/relays/${id}/restart`, {
            method: 'POST',
        });
        if (isResponseError(res)) return res.error;
        return res.data;
    }
}
