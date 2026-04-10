import type { 
    ApiError,
    Conversation,
    Message,
    CreateConversationData,
    SendMessageData,
    ConversationsResponse,
    MessagesResponse
} from '../types';
import { fetchApi, isResponseError } from '../utils';

export class MessageService {
    async fetchConversations(limit?: number, offset?: number): Promise<ConversationsResponse | ApiError> {
        const params = new URLSearchParams();
        params.append('limit', String(limit || 50));
        params.append('offset', String(offset || 0));
        
        const res = await fetchApi<ConversationsResponse>(
            `/messages/conversations?${params.toString()}`
        );
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async fetchConversation(conversationId: string): Promise<Conversation | ApiError> {
        const res = await fetchApi<Conversation>(`/messages/conversations/${conversationId}`);
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async createConversation(data: CreateConversationData): Promise<Conversation | ApiError> {
        const res = await fetchApi<Conversation>('/messages/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async sendMessage(conversationId: string, data: SendMessageData): Promise<Message | ApiError> {
        const res = await fetchApi<Message>(`/messages/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async fetchMessages(conversationId: string, limit?: number, before?: string): Promise<MessagesResponse | ApiError> {
        const params = new URLSearchParams();
        params.append('limit', String(limit || 50));
        if (before) params.append('before', before);

        const res = await fetchApi<MessagesResponse>(
            `/messages/conversations/${conversationId}/messages?${params.toString()}`
        );
        if (isResponseError(res)) return res.error;
        return res.data;
    }

    async markAsRead(conversationId: string): Promise<{ success: boolean } | ApiError> {
        const res = await fetchApi<{ success: boolean }>(
            `/messages/conversations/${conversationId}/read`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        );
        if (isResponseError(res)) return res.error;
        return res.data;
    }
}
