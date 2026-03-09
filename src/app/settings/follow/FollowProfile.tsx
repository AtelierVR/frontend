'use client';

import { useEffect, useState } from 'react';
import { useApi, isError } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/api/types';
import { cn } from '@/lib/cn';

interface FollowProfileProps {
  sid: string;
  at: number;
}

function getPairIdBySID(sid: string): { id: number | string; server?: string } {
  const [id, server] = sid.split('@');
  return {
    id: isNaN(parseInt(id)) ? id : parseInt(id),
    server: server === '::' ? undefined : server || undefined,
  };
}

export default function FollowProfile({ sid, at }: FollowProfileProps) {
  const [user, setUser] = useState<User | null>();
  const [imageError, setImageError] = useState(false);
  const Api = useApi();

  useEffect(() => {
    const pair = getPairIdBySID(sid);

    async function fetchUser() {
      if (!Api) return;

      const res = await Api.getOrFetchUser(pair.id, pair.server);
      if (isError(res)) {
        console.error('Failed to fetch user', res.message);
        setUser(null);
        setImageError(true);
        return;
      }

      setImageError(false);
      setUser(res);
    }

    if (user === undefined) {
      fetchUser();
    }
  }, [sid, Api, user]);

  // Find profile alias URL if present
  const profileUrl = user?.alias?.find((a: any) => a.type === 'profile')?.value;

  const content = (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-fd-border bg-fd-accent/10 hover:bg-fd-accent/20 transition-colors">
      {/* Avatar */}
      <div
        className={cn(
          'size-10 rounded-full overflow-hidden flex-shrink-0 bg-fd-accent/10',
          !user && 'animate-pulse',
          'hover:bg-fd-accent/50'
        )}
      >
        {!imageError && user?.thumbnail ? (
          <img
            src={user.thumbnail}
            alt={user.display || user.username}
            className="size-10 rounded-full object-cover mt-0 mb-0"
            onError={() => setImageError(true)}
          />
        ) : user ? (
          <div className="size-10 rounded-full bg-fd-primary/20 flex items-center justify-center text-fd-primary font-semibold">
            {(user.display || user.username).charAt(0).toUpperCase()}
          </div>
        ) : null}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        {!user ? (
          <>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </>
        ) : (
          <>
            <div className="font-medium truncate">{user.display || user.username}</div>
            <div className="text-sm text-fd-muted-foreground truncate">
              {user.username}@{user.server}
            </div>
          </>
        )}
      </div>

      {/* Date */}
      <div className="text-xs text-fd-muted-foreground flex-shrink-0">
        {new Date(at).toLocaleDateString()}
      </div>
    </div>
  );

  // If profile URL exists, wrap in link that opens in new tab
  if (profileUrl) {
    return (
      <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="block no-underline">
        {content}
      </a>
    );
  }

  return content;
}
