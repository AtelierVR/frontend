import { fetchApi, isResponseError, getSIDById } from '../utils';
import type { ApiError, MultiResponse, Relation } from '../types';

export interface Follower {
  user: string;
  at: number;
}

export interface Following {
  user: string;
  at: number;
}

export class FollowService {
  async fetchMyFollowers(
    limit: number = 100,
    offset: number = 0
  ): Promise<MultiResponse & { items: Follower[] } | ApiError> {
    const response = await fetchApi<MultiResponse & { items: Follower[] }>(
      `/api/users/@me/followers?limit=${limit}&offset=${offset}`
    );

    if (isResponseError(response)) {
      return response.error;
    }

    return response.data;
  }

  async fetchMyFollowing(
    limit: number = 100,
    offset: number = 0
  ): Promise<MultiResponse & { items: Following[] } | ApiError> {
    const response = await fetchApi<MultiResponse & { items: Following[] }>(
      `/api/users/@me/following?limit=${limit}&offset=${offset}`
    );

    if (isResponseError(response)) {
      return response.error;
    }

    return response.data;
  }

  async sendFollow(
    id: number | string, 
    server?: string
  ): Promise<Relation | ApiError> {
    const response = await fetchApi<Relation>(
      `/api/relations/${getSIDById(id, server)}/follow`,
      {
        method: 'POST'
      }
    );

    if (isResponseError(response)) {
      return response.error;
    }

    return response.data;
  }

  async sendUnfollow(
    id: number | string,
    server?: string
  ): Promise<boolean | ApiError> {
    const response = await fetchApi(
      `/api/relations/${getSIDById(id, server)}/unfollow`,
      {
        method: 'POST'
      }
    );

    if (isResponseError(response)) {
      return response.error;
    }

    return true;
  }

  async sendFollowRequestResponse(
    type: 'accept' | 'reject',
    id: number | string,
    server?: string
  ): Promise<boolean | ApiError> {
    const response = await fetchApi(
      `/api/relations/${getSIDById(id, server)}/request`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      }
    );

    if (isResponseError(response)) {
      return response.error;
    }

    return true;
  }
}
