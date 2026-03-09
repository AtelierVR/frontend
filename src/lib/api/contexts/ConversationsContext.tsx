'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useApi } from '../provider';
import type { Conversation, User } from '../types';
import { isError } from '../utils';

interface ConversationsContextValue {
  conversations: Conversation[];
  users: Map<string, User>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ConversationsContext = createContext<ConversationsContextValue | null>(null);

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const Api = useApi();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchConversations = useCallback(async () => {
    if (!Api.currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await Api.fetchConversations(50, 0);
      if (isError(result)) {
        setError(result.message);
        setLoading(false);
        return;
      }

      setConversations(result.conversations);

      const oids = new Set<string>();
      const iid = Api.currentUser.alias?.find(a => a.key === 'iid')?.value;

      for (const conv of result.conversations) {
        for (const member of conv.members) {
          if (member.id !== iid) {
            oids.add(member.id);
          }
        }
      }

      const ou = new Map<string, User>();
      await Promise.all(
        Array.from(oids).map(async uid => {
          const user = await Api.getOrFetchUser(uid);
          if (!isError(user)) ou.set(uid, user);
        })
      );

      setUsers(ou);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [Api.currentUser, Api.fetchConversations, Api.getOrFetchUser]);

  useEffect(() => {
    if (!hasFetched.current && Api.currentUser) {
      hasFetched.current = true;
      fetchConversations();
    }
  }, [Api.currentUser, fetchConversations]);

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        users,
        loading,
        error,
        refetch: fetchConversations,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations(): ConversationsContextValue {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
}
